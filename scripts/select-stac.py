"""Select Overture parquet assets for HKUST using the release's spatial catalog."""
import concurrent.futures
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
RELEASE = "2026-10-21.0"
BBOX = [114.2525, 22.328, 114.274, 22.3435]
LAYERS = [("buildings", "building"), ("buildings", "building_part"),
          ("base", "land"), ("base", "water"), ("base", "land_use"),
          ("base", "land_cover"), ("base", "infrastructure"),
          ("transportation", "segment"), ("places", "place"),
          ("divisions", "division"), ("divisions", "division_area")]

def read(url):
    with urllib.request.urlopen(url, timeout=45) as response:
        return json.load(response)

def intersects(b):
    w, s, e, n = BBOX
    return b[0] < e and b[2] > w and b[1] < n and b[3] > s

def select(pair):
    theme, kind = pair
    url = f"https://stac.overturemaps.org/{RELEASE}/{theme}/{kind}/collection.json"
    collection = read(url)
    items = [link for link in collection["links"] if link["rel"] == "item"]
    boxes = collection["extent"]["spatial"]["bbox"][1:]
    if len(items) != len(boxes):
        # Single-file collections sometimes omit the redundant overall bbox.
        features = [read(item["href"]) for item in items]
        urls = [f["assets"]["aws"]["href"] for f in features if intersects(f["bbox"])]
        print(f"{kind}: {len(urls)} / {len(items)} spatial partitions", flush=True)
        return kind, {"urls": urls, "catalog": url, "license": collection["license"]}
    urls = []
    for box, item in zip(boxes, items):
        if not intersects(box):
            continue
        feature = read(item["href"])
        if feature["bbox"] != box:
            raise ValueError(f"{kind}: spatial catalog order mismatch")
        urls.append(feature["assets"]["aws"]["href"])
    print(f"{kind}: {len(urls)} / {len(items)} spatial partitions", flush=True)
    return kind, {"urls": urls, "catalog": url, "license": collection["license"]}

if __name__ == "__main__":
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        layers = dict(pool.map(select, LAYERS))
    dest = ROOT / "data/sources.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps({"release": RELEASE, "bbox": BBOX, "layers": layers}, indent=2), encoding="utf-8")
    print(f"Saved spatial asset selection: {dest}")
