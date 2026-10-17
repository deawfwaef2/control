# 机械病毒：赤巢协议

原创二次元机娘 / 赛博朋克 / 等额行动棋类战役。持续迭代的可玩原型。

## 下载后直接玩

- **[下载离线游戏 ZIP](https://github.com/deawfwaef2/control/raw/refs/heads/main/机械病毒-可直接游玩.zip)**：解压，双击 `开始游戏.html`。
- **[下载单文件 HTML](https://github.com/deawfwaef2/control/raw/refs/heads/main/开始游戏.html)**：保存后用现代浏览器打开。
- 根目录 `index.html` 是同一份完整游戏，适合静态网站托管。

没有安装步骤、外部字体、CDN 或后端。所有美术已经内嵌。存档保存在浏览器，也可在系统菜单导出 / 导入 JSON。沙盒预览若禁止本地存储，请下载独立打开。

## 当前版本 M3 / Director Build 0.3

- 双阵营、五章 **16 个作战段落**、六名独立机娘、角色阵营和成长跨关保留。
- 大立绘棋子、单侧人物档案、**100%—175% 棋子放大**，可切换立绘视图 / 全局总览。
- 真正生成的机械蜘蛛装置与感染状态美术，四个新场景。
- 等额行动：每单位每阶段一次，你行动 N 次，敌方获得 N 次额度。
- 棋类移动 / 吃子，机娘夺控换位、AI、撤离、分支、存档。

每章由多段目标推进，新增战中演出、定时守点、工程操作与终幕。完整当前任务说明见 [CAMPAIGN.md](CAMPAIGN.md)。最新交接以 [handoff.md](handoff.md) 追加记录为准。

## 源码与构建

`python3 build_game.py` 将 assets/*.webp 与源码内嵌，原子更新两个 HTML 以及 ZIP。构建需 Python 3 和 Node.js（用于语法保护），不需要 npm 安装运行时依赖。

基础：`data.js` / `engine.js` / `ui.js`
多阶段战役：`campaign.js`
视觉：`presentation.js` / `cinematic.css`
页面：`index.template.html` / `style.css`

## 协作要求

**每次编程前读根目录 handoff，检查远端；只追加交接，不覆盖记录，不强推。每个阶段先打包可玩 HTML，再检查、提交、推送。工作区总量不得超过 128 MB。绝不提交令牌。**

## 验证边界

已完成 27 项 Chromium 离线界面、真实演出恢复与规则固定局面检查，结果见 `qa/m2-report.json`，脚本为 `qa/check.cjs`。固定局面测试不等于完整人工通关。没有宣称完整战役平衡通过，也不是商业完成版。角色与背景为本项目生成美术；弥砂感染版暂为生成装置合成，其他五名为完整重绘。

下载包一致性与凭据模式扫描结果见 `qa/package-report.json`。所有阶段都保留可玩的 HTML 与 ZIP。
