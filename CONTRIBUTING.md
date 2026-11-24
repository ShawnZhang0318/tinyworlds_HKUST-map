# Contributing

欢迎通过 Issue 报告地图问题，或通过 Pull Request 改进这个项目。

## 提交地图问题

请提供地点的中英文名称、地图中的位置、预期与实际表现，以及可公开引用的资料链接。截图可以帮助定位问题。请区分建筑轮廓、程序化外观和地面平面化带来的差异。

## 本地开发

```sh
npm run dev
npm run check
npm test
```

修改生成配置后按 [README](README.md#重新生成地图) 安装生成器依赖并运行 `npm run generate`。提交相关的生成结果、来源元数据和校验和，说明修改影响哪个视角或地点。不要将 `node_modules`、运行日志、个人绝对路径、账号凭据或未获授权的参考图片提交到仓库。

尽量把修改限定在 HKUST 配置、独立查看器和项目脚本。修改继承自 tinyworlds 的共享代码时，请在 [docs/UPSTREAM.md](docs/UPSTREAM.md) 记录变更，并运行相关的上游测试。

## 授权

项目代码与文档贡献沿用 MIT；原创地图图像及描述文字沿用 CC-BY-4.0；地理数据贡献必须与 [DATA_LICENSE.md](DATA_LICENSE.md) 兼容，并提供来源。贡献不需要转让版权。保留 tinyworlds 原作者及第三方数据的署名和许可。
