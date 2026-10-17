"""Atomic offline-first release packager. Read handoff.md before source edits.
Every successful build publishes both HTML entrypoints and the playable ZIP.
Only compact WebP assets are retained in the working repository.
"""
from pathlib import Path
import base64, json, os, subprocess, tempfile, zipfile, io

ROOT = Path(__file__).resolve().parent
art = {p.stem: 'data:image/webp;base64,' + base64.b64encode(p.read_bytes()).decode('ascii')
       for p in sorted((ROOT/'assets').glob('*.webp'))}
css = '\n'.join((ROOT/f).read_text(encoding='utf-8') for f in ('style.css','cinematic.css') if (ROOT/f).exists())
files = ['data.js','engine.js','ui.js','presentation.js','campaign.js']
js = '\n\n'.join((ROOT/f).read_text(encoding='utf-8') for f in files if (ROOT/f).exists())
script = '(function(){\n' + js + '\n})();'
# Do not replace the last playable artifact with syntactically invalid work.
subprocess.run(['node','--check'],input=script,text=True,check=True,capture_output=True)
html = (ROOT/'index.template.html').read_text(encoding='utf-8').replace('__STYLE__',css).replace('__ART__',json.dumps(art,ensure_ascii=False)).replace('__SCRIPT__',script)

def atomic(path, data):
    path=Path(path); tmp=path.with_name('.'+path.name+'.pending')
    tmp.write_bytes(data); os.replace(tmp,path)

raw=html.encode('utf-8')
for filename in ('index.html','开始游戏.html'): atomic(ROOT/filename,raw)
# Keep the user's previous workspace deliverable current, too.
atomic(ROOT.parent/'机械病毒-赤巢协议.html',raw)
readme='机械病毒：赤巢协议\n\n双击“开始游戏.html”即可离线游玩。无需服务器、网络或安装依赖。\n选择阵营 → 接入作战。点击己方棋子，再点击高亮格。\n每单位每阶段行动一次，你行动 N 次，敌方获得 N 次额度。\n右上角作战手册可查完整规则。音效默认关闭，可手动开启。\n进度保存到当前浏览器；系统菜单可导出/导入 JSON 存档。\n若预览器禁止存储，请下载本 ZIP，解压后使用浏览器打开 HTML。\n这是持续更新的原型，不是已完成商业游戏。\n仓库：https://github.com/deawfwaef2/control\n'
archive=io.BytesIO()
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    z.writestr('开始游戏.html',raw)
    z.writestr('打开说明.txt',readme)
atomic(ROOT/'机械病毒-可直接游玩.zip',archive.getvalue())
print(f'PLAYABLE SAVED FIRST: index.html + 开始游戏.html + ZIP | {len(raw)/1048576:.2f} MiB HTML | {len(art)} embedded assets')
print('Source bundle syntax checked. Browser interaction checks are a separate step.')
