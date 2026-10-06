"""Patch the BIOBUZZ simulator build (dist/index.html) for the merged team site:

1. i18n: add the missing English strings (tr_static.py) and pattern rules (sim-i18n-rules.js) to the
   game's own VI->EN dictionary, so text built by the game code at run time (HUD, toasts, referee calls,
   AUTO test-run log, results) is translated too.
2. Canvas text (AUTO editor field map, replay chart) goes through BBI18N.t.
3. Spoken field callout follows the language (Vietnamese voice when the browser has one).
4. Online play is hidden: it needs the Claude artifact room and cannot connect on a normal website.

Every patch asserts it applied exactly once, so a newer simulator build fails loudly instead of silently.
"""
import json, re, sys
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).parent
VI = re.compile(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐÀ-Ỹ]')


def once(src, old, new, what, times=1):
    n = src.count(old)
    if (times is None and n < 1) or (times is not None and n != times):
        raise SystemExit(f'sim_patch: "{what}" matched {n} times')
    return src.replace(old, new)


def text_pool(html):
    """Every text node / attribute / string-literal segment in the simulator (to resolve translation prefixes)."""
    pool = set()

    class P(HTMLParser):
        def __init__(s): super().__init__(); s.skip = 0
        def handle_starttag(s, t, a):
            if t in ('script', 'style'): s.skip += 1
            for k, v in a:
                if k in ('placeholder', 'title', 'aria-label') and v: pool.add(v.strip())
        def handle_endtag(s, t):
            if t in ('script', 'style'): s.skip -= 1
        def handle_data(s, d):
            if not s.skip and d.strip(): pool.add(re.sub(r'\s+', ' ', d).strip())
    i = html.find('<script')
    P().feed(html[:i])
    for m in re.finditer(r'<script type="text/plain" data-bb="[^"]+">(.*?)</script>', html, re.S):
        code = re.sub(r'/\*.*?\*/', '', m.group(1), flags=re.S)
        code = re.sub(r'(?m)^\s*//.*$', '', code)
        code = re.sub(r"(?m)\s//[^\n'\"`]*$", '', code)
        for a, b, c in re.findall(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"|`((?:[^`\\]|\\.)*)`", code):
            x = a or b or c; y = x; p = None
            while p != y: p = y; y = re.sub(r'\$\{[^{}]*\}', '\x00', y)
            for seg in re.split(r'<[^>]*>', y):
                for q in seg.split('\x00'):
                    q = re.sub(r'\s+', ' ', q).strip()
                    if q: pool.add(q)
    return pool


def build_extra(html):
    ns = {}
    exec((HERE / 'tr_static.py').read_text(encoding='utf8'), ns)
    pool = text_pool(html)
    extra, missing = {}, []
    for pre, en in ns['T']:
        if pre.endswith('$'):
            key = pre[:-1]
            extra[key] = en           # exact keys are kept even if not found (they may come from runtime data)
            continue
        hits = [x for x in pool if x.startswith(pre)]
        if not hits:   # tokenizer can be confused by regex literals: scan the raw source instead
            raw = set()
            for mm in re.finditer(re.escape(pre), html):
                seg = re.split(r"[<'\"`\n]|\$\{", html[mm.start():mm.start() + 3000], maxsplit=1)[0]
                raw.add(re.sub(r'\s+', ' ', seg).strip())
            hits = sorted(raw)
        if len(hits) != 1:
            missing.append(f'{pre} ({len(hits)} hits)')
            continue
        extra[hits[0]] = en
    return extra, missing


def patch(html):
    extra, missing = build_extra(html)
    rules = (HERE / 'sim-i18n-rules.js').read_text(encoding='utf8')
    blurb = [k for k in extra if k.startswith('Sân dựng từ file CAD')]
    extra.update({
        'Chọn ngôn ngữ giao diện. Ngôn ngữ được nhớ cho lần sau.': 'Choose the interface language. Your choice is remembered.',
        'Các tay lái, cầm tay cầm lên': 'Drivers, pick up your controllers', 'Khán đài': 'Broadcast', 'Camera robot': 'Robot camera',
        'Tự do': 'Free', 'Từ trên': 'Top-down', 'Tự động': 'Automatic', 'Không hợp lệ': 'Not legal', 'NECTAR ĐỎ ·': 'RED NECTAR ·',
        'NECTAR XANH ·': 'BLUE NECTAR ·', 'HIỆN GIAO DIỆN': 'SHOW UI', 'Lỗi MINOR': 'MINOR foul', 'Lỗi MAJOR': 'MAJOR foul',
        # texts edited below (online play removed)
        'để thấy chỗ nào bắn vào được. Chọn chương trình cho bạn và cho bot đồng đội ở màn hình Đấu trận (cả chế độ Hai người); gửi mã':
            'to see where shots go in. Choose the program for yourself and your bot partner on the Match screen (also in Two players); share a',
    })
    if blurb:
        extra[blurb[0].replace('; chơi online hai máy qua mã phòng', '')] = extra[blurb[0]]
    # ---- 1. i18n engine: dictionary + rules + rule lookup (keys are whitespace-collapsed) ----
    inject = ('Object.assign(EN, ' + json.dumps(extra, ensure_ascii=False) + ');\n'
              '  function L(x) { var s = String(x).trim(); return EN[s] !== undefined ? EN[s] : (__rx(s) !== undefined ? __rx(s) : x); }\n'
              + rules +
              '\n  function __rx(s) { var c = s.replace(/\\s+/g, " "); if (c !== s && EN[c] !== undefined) return EN[c];'
              ' for (var i = 0; i < RULES.length; i++) { var m = c.match(RULES[i][0]); if (m) { var r = RULES[i][1](m); if (r !== undefined) return r; } } return undefined; }\n'
              '  var tOut = new WeakMap()')
    html = once(html, 'var tOut = new WeakMap()', inject, 'i18n inject point')
    html = once(html, ": EN[m[2]];", ": EN[m[2]]; if (t === undefined) t = __rx(m[2]);", 'i18n text lookup')
    html = once(html, "if (EN[v] !== undefined) { (el.__bbA = el.__bbA || {})[a] = [v, EN[v]]; el.setAttribute(a, EN[v]); }",
                "var tv = EN[v] !== undefined ? EN[v] : __rx(v); if (tv !== undefined) { (el.__bbA = el.__bbA || {})[a] = [v, tv]; el.setAttribute(a, tv); }", 'i18n attr lookup')
    html = once(html, "t: function (s) { return lang === 'en' && EN[s] !== undefined ? EN[s] : s; },",
                "t: function (s) { if (lang !== 'en') return s; var r = EN[s] !== undefined ? EN[s] : __rx(s); return r === undefined ? s : r; },", 'i18n t()')
    html = once(html, "'Chọn ngôn ngữ giao diện. Phần chưa dịch sẽ giữ nguyên tiếng Việt.'",
                "'Chọn ngôn ngữ giao diện. Ngôn ngữ được nhớ cho lần sau.'", 'lang setting hint', None)
    # ---- 2. canvas text ----
    html, n = re.subn(r'<script type="text/plain" data-bb="((autoed|replay)\.js)">(.*?)</script>',
                      lambda m: '<script type="text/plain" data-bb="%s">' % m.group(1) + re.sub(
                          r"g\.fillText\('([^']*)'", lambda q: "g.fillText((window.BBI18N ? window.BBI18N.t('%s') : '%s')" % (q.group(1), q.group(1)), m.group(3)) + '</script>',
                      html, flags=re.S)
    if n != 2: raise SystemExit('sim_patch: canvas modules not found')
    # ---- 3. field callout voice + toast follow the language ----
    html = once(html, "const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US';",
                "const VO = { 'Drivers, pick up your controllers.': 'Các tay lái, cầm tay cầm lên.' }, vi = window.BBI18N && window.BBI18N.lang === 'vi';"
                " const vv = vi && VO[text] ? (speechSynthesis.getVoices() || []).find(v => /^vi/i.test(v.lang)) : null;"
                " const u = new SpeechSynthesisUtterance(vv ? VO[text] : text); u.lang = vv ? vv.lang : 'en-US'; if (vv) u.voice = vv;", 'voice')
    html = once(html, "H.toast('Drivers, pick up your controllers', 'g')", "H.toast('Các tay lái, cầm tay cầm lên', 'g')", 'pickup toast')
    # ---- 4. online play is unavailable outside Claude: hide its entry points and mentions ----
    html = once(html, '; chơi online hai máy qua mã phòng', '', 'home blurb online', None)
    html = once(html, ' (cả Hai người và Chơi online)', ' (cả chế độ Hai người)', 'howto online mention', None)
    hide = ('<style id="site-patch">[data-screen="online"]{display:none!important}</style>\n'
            '<script>document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll("#scr-howto h3").forEach(function(h){'
            'if(/Chơi online|Play online/.test(h.textContent)){h.hidden=true;if(h.nextElementSibling)h.nextElementSibling.hidden=true;}});});</script>\n')
    html = once(html, '<style>', hide + '<style>', 'style head')
    return html, missing


if __name__ == '__main__':
    src = Path(sys.argv[1]).read_text(encoding='utf8')
    out, missing = patch(src)
    Path(sys.argv[2]).write_text(out, encoding='utf8')
    print('patched; unresolved prefixes:', len(missing))
    for m in missing: print('  ', m)
