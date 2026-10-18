# 音乐署名与许可 / Music attribution

本游戏的 BGM 来自音乐作者 **PeriTune**，不是本项目原创配乐，也不是语音生成器合成的音乐。只作为游戏背景使用，不作单独音乐专辑发布。

## 使用曲目

### Irregular — PeriTune
- 原曲发布页：https://peritune.com/blog/2020/02/28/irregular/
- 原始发布日期：2020-02-28。
- 作者循环包：https://peritune.com/loop/PerituneMaterial_Irregular_loop.zip
- 游戏内文件：`music/irregular.mp3`。
- 用途：守护者交战与终章。作者页面标注 BPM 165、赛博/电子战斗曲。

### Cyberpunk_City — PeriTune
- 原曲发布页：https://peritune.com/blog/2020/05/22/cyberpunk_city/
- 原始发布日期：2020-05-22。
- 作者循环包：https://peritune.com/loop/PerituneMaterial_CyberPunk_City_loop.zip
- 游戏内文件：`music/cyberpunk-city.mp3`。
- 用途：主菜单、调查演出与赤巢作战。作者页面标注 BPM 138、暗色赛博朋克/合成器曲。

## License

**Creative Commons Attribution 4.0 International (CC BY 4.0)**

License URL: https://creativecommons.org/licenses/by/4.0/
Legal text: https://creativecommons.org/licenses/by/4.0/legalcode

原作者使用说明：https://peritune.com/about/ （核对日期：2026-10-18）。该页明确区分：2026年3月起的新作适用其新自定条款；2026年2月以前发布的作品继续适用 CC BY 4.0。这里选取的是两首2020年作品；Irregular发布页自身也直接标明 CC BY 4.0。不要把这项许可错误泛化为作者所有新作都适用同样条款。

## 本项目的处理 / Modifications

- 使用作者提供的完整循环 MP3，不重新创作或改写旋律。
- 为控制离线包大小，从192 kbps转码为112 kbps MP3，输出为双声道44.1 kHz文件（原循环MP3为48 kHz，进行了重采样）。
- 在游戏播放器里循环、淡入淡出、按场景降低音量，并允许用户分别调节音乐和音效。
- 音频文件以 data URI 内嵌在独立 HTML 中，不从第三方服务器实时加载。
- 本署名也内嵌在游戏「♫ 音乐与音效」面板中，并随可玩ZIP附带。
- 没有宣称作者为本游戏背书。音乐的 CC BY 4.0 不自动改变游戏代码或美术的许可。

## 动作音效

移动、选择、固守、交接、击杀、寄生、警报、胜利、敲击、卡扣、脉冲与切镜等音效由本项目 `audio.js` 使用 Web Audio 程序合成；没有借用未授权商业游戏音效，没有人物配音。
