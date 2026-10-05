#!/usr/bin/env python3
"""Merge the Thunderclaw team site + BIOBUZZ simulator into ONE self-contained HTML file.

- Thunderclaw: style.css and script.js inlined; new hash page #simulator (+ nav link + hero CTA).
- Simulator: dist/index.html gzipped + base64 inside <script type="text/plain">, inflated with
  DecompressionStream only when #simulator is opened, then run in an iframe from a Blob URL
  (isolated CSS/JS, so the two apps never clash).
"""
import base64, gzip, re, sys
from pathlib import Path

ROOT = Path(sys.argv[1])
OUT = Path(sys.argv[2])
TC = ROOT / 'thunderclaw-main/thunderclaw-main'
SIM = ROOT / 'Biobuzz-simulator-main/Biobuzz-simulator-main/biobuzz-sim/dist/index.html'
HERE = Path(__file__).parent

html = (TC / 'index.html').read_text(encoding='utf8')
css = (TC / 'style.css').read_text(encoding='utf8')
js = (TC / 'script.js').read_text(encoding='utf8')
sim = SIM.read_text(encoding='utf8')
sys.path.insert(0, str(Path(__file__).parent))
from sim_patch import patch as patch_sim
sim, unresolved = patch_sim(sim)
if unresolved:
    print('warning: untranslated prefixes:', unresolved)
sim_css = (HERE / 'sim.css').read_text(encoding='utf8')
sim_js = (HERE / 'sim.js').read_text(encoding='utf8')
sim_section = (HERE / 'sim-section.html').read_text(encoding='utf8')
site_i18n = (HERE / 'site-i18n.js').read_text(encoding='utf8')

def sub_once(pattern, repl, text, flags=0):
    new, n = re.subn(pattern, lambda m: repl, text, count=1, flags=flags)
    if n != 1:
        raise SystemExit('pattern not found: ' + pattern)
    return new

# ---- 1. router: register the new page in script.js ----
js = sub_once(r"const PAGE_IDS = \['about',", "const PAGE_IDS = ['simulator', 'about',", js)
js = sub_once(r"  else if \(h === 'sponsors'\) \{ showSponsorsEl\(\); updateNavActive\('sponsors'\); \}",
              "  else if (h === 'sponsors') { showSponsorsEl(); updateNavActive('sponsors'); }\n"
              "  else if (h === 'simulator') { showPage('simulator'); updateNavActive('resources'); }", js)
# notify the simulator controller on every route change (it pauses/resumes the iframe)
js = sub_once(r"addEventListener\('hashchange', routeHash\);",
              "addEventListener('hashchange', routeHash);\n"
              "addEventListener('hashchange', () => window.__simRoute && window.__simRoute());", js)
for name, s in (('script.js', js), ('sim.js', sim_js), ('site-i18n.js', site_i18n)):
    if re.search(r'</script', s, re.I):
        raise SystemExit(name + ' contains </script')

# ---- 2. simulator document: give it a real skeleton (standards mode, utf-8) ----
if not re.match(r'\s*<!doctype', sim, re.I):
    sim = ('<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
           + sim.lstrip() + '\n</html>\n')
payload = base64.b64encode(gzip.compress(sim.encode('utf8'), 9, mtime=0)).decode('ascii')
payload = re.sub(r'(.{8000})', r'\1\n', payload)

# ---- 3. markup ----
html = sub_once(r'<link rel="stylesheet" href="style.css">',
                '<style>\n' + css + '\n/* ===== BIOBUZZ simulator page ===== */\n' + sim_css + '\n</style>', html)
# the simulator lives under Resources (card on the Resources page); the navbar keeps a plain Resources link
html = sub_once(r'<button id="adminLogin" type="button">',
                '<div class="lang-sw" id="langSw" role="group" aria-label="Language">'
                '<button type="button" data-lang="vi" aria-pressed="false" title="Tiếng Việt">VI</button>'
                '<button type="button" data-lang="en" aria-pressed="true" title="English">EN</button></div>'
                '<button id="adminLogin" type="button">', html)
m = re.search(r'<section class="pad" id="resources">.*?</h2></div>', html, re.S)
if not m:
    raise SystemExit('resources head not found')
html = html[:m.end()] + '''
  <a href="#simulator" class="sim-promo">
    <span class="sim-promo-ico" aria-hidden="true">▶</span>
    <span class="sim-promo-txt"><b>BIOBUZZ Simulator</b><p>Play the FTC 2026–2027 game in 3D right in your browser: drive with a gamepad, plan your AUTO, practise against AI bots.</p></span>
    <span class="sim-promo-go">Open simulator →</span>
  </a>''' + html[m.end():]
m =re.search(r'<a class="hero-cta" href="#seasons">.*?</a>', html, re.S)
if not m:
    raise SystemExit('hero CTA not found')
html = html[:m.end()] + ('\n    <a class="hero-cta hero-cta-sim" href="#simulator"><span>Try BIOBUZZ Sim</span>'
                         '<i class="arr">▶</i></a>') + html[m.end():]
html = sub_once(r'\n<footer>', '\n' + sim_section + '\n<footer>', html)
html = sub_once(r'<script src="script.js"></script>',
                '<script>\n' + site_i18n + '\n</script>\n'
                '<script>\n' + js + '\n</script>\n'
                '<script type="text/plain" id="biobuzzSrc" data-enc="gzip+base64">\n' + payload + '\n</script>\n'
                '<script>\n' + sim_js + '\n</script>', html)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(html, encoding='utf8')
print('sim raw %.0f KB -> payload %.0f KB; total %.0f KB' % (len(sim.encode()) / 1024, len(payload) / 1024, len(html.encode()) / 1024))
