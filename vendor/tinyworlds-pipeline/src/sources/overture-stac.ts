import fs from "node:fs";
import path from "node:path";
import { DuckDBInstance } from "@duckdb/node-api";
import type { DataSource } from "./types.js";

/** Use the official STAC spatial partitions rather than opening every global parquet file. */
export const overtureStac: DataSource = {
  name: "overture-stac",
  files: [],
  async fetch(ctx) {
    const catalog = JSON.parse(fs.readFileSync(path.join(ctx.rawDir, "..", "stac-files.json"), "utf8")) as {
      layers: Record<string, { urls: string[] }>;
    };
    const db = await DuckDBInstance.create(":memory:");
    const conn = await db.connect();
    try {
      await conn.run("LOAD httpfs; LOAD spatial; SET threads=4; SET http_timeout=45; SET http_retries=2;");
      const { west, south, east, north } = ctx.bbox;
      const filter = `bbox.xmin < ${east} AND bbox.xmax > ${west} AND bbox.ymin < ${north} AND bbox.ymax > ${south}`;
      for (const [kind, layer] of Object.entries(catalog.layers)) {
        const dest = path.join(ctx.rawDir, `${kind}.parquet`);
        if (!ctx.force && fs.existsSync(dest)) { ctx.log(`${kind}: cached`); continue; }
        if (!layer.urls.length) throw new Error(`No Overture partition for ${kind}`);
        ctx.log(`${kind}: reading ${layer.urls.length} selected spatial partitions`);
        const urls = `[${layer.urls.map(u => `'${u.replaceAll("'", "''")}'`).join(",")}]`;
        const tmp = dest + ".stac.part";
        const confidence = kind === "place" ? " AND confidence >= 0.6" : "";
        const started = Date.now();
        await conn.run(`COPY (SELECT * FROM read_parquet(${urls}, hive_partitioning=true) WHERE ${filter}${confidence}) TO '${tmp.replaceAll("\\", "/").replaceAll("'", "''")}' (FORMAT parquet, COMPRESSION zstd)`);
        fs.renameSync(tmp, dest);
        const count = (await conn.runAndReadAll(`SELECT count(*) FROM '${dest.replaceAll("\\", "/").replaceAll("'", "''")}'`)).getRows()[0][0];
        ctx.log(`${kind}: ${count} features, ${(fs.statSync(dest).size/1e6).toFixed(2)} MB, ${Math.round((Date.now()-started)/1000)} s`);
      }
    } finally { conn.closeSync(); }
  },
};
