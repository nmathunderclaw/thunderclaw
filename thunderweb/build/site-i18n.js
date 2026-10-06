/* ---- Site language (EN / VI) ----
   English is the source language of the team site. Vietnamese is applied by translating the DOM
   (static markup + anything script.js renders later, via a MutationObserver), and reverted exactly.
   Add pairs to VI below ("English": "Tiếng Việt"). Content typed by admins (season text, logs, names)
   is left as written. The simulator has its own dictionary; sim.js keeps both in sync. */
(function () {
  'use strict';
  var KEY = 'tc-lang';
  var VI_RAW = {
    // nav / chrome
    'Home': 'Trang chủ', 'About': 'Giới thiệu', 'Seasons': 'Các mùa giải', 'Resources': 'Tài nguyên', 'Sponsors': 'Nhà tài trợ',
    '🔒 Admin': '🔒 Quản trị', 'Log out admin': 'Đăng xuất quản trị', '★ ADMIN': '★ QUẢN TRỊ', 'Menu': 'Menu', 'Language': 'Ngôn ngữ',
    '© NMA Thunderclaw · FTC Team 32807 · Da Nang, Vietnam': '© NMA Thunderclaw · Đội FTC 32807 · Đà Nẵng, Việt Nam',
    // hero / home
    'FTC 32807 · Da Nang, Vietnam': 'FTC 32807 · Đà Nẵng, Việt Nam',
    'Explore our robots': 'Khám phá robot của đội', 'Try BIOBUZZ Sim': 'Chơi thử BIOBUZZ Sim', 'SCROLL DOWN ↓': 'CUỘN XUỐNG ↓',
    'Team Code': 'Mã đội', 'Members': 'Thành viên', 'Seasons Joined': 'Số mùa tham gia', 'Status': 'Trạng thái', 'Active': 'Đang hoạt động',
    '✎ Edit Info': '✎ Sửa thông tin',
    // about
    '← Home': '← Trang chủ', 'About Us': 'Về chúng tôi', 'Founded': 'Thành lập', 'Location': 'Địa điểm', 'Da Nang, Vietnam': 'Đà Nẵng, Việt Nam',
    'Mission': 'Sứ mệnh', '✎ Edit Intro': '✎ Sửa giới thiệu', 'Director': 'Giám đốc', 'Mentor': 'Cố vấn', 'Team Members': 'Thành viên đội',
    'Follow Us': 'Theo dõi đội', 'Contact': 'Liên hệ', 'Tech': 'Kỹ thuật', 'Non-tech': 'Phi kỹ thuật', 'Mechanical': 'Cơ khí',
    'Electrical': 'Điện', 'Coding': 'Lập trình', 'Follow →': 'Theo dõi →', 'No director info yet.': 'Chưa có thông tin giám đốc.',
    'Add Director': 'Thêm giám đốc', 'New Mentor': 'Thêm cố vấn', 'New Teammate': 'Thêm thành viên', 'New Social Site': 'Thêm mạng xã hội', 'New Contact': 'Thêm liên hệ',
    // seasons
    'Season Archives': 'Lưu trữ các mùa giải', 'No seasons yet.': 'Chưa có mùa giải nào.', '← Season Archives': '← Lưu trữ các mùa giải',
    'Latest': 'Mới nhất', 'New Season': 'Mùa giải mới', 'View Gallery': 'Xem thư viện ảnh', 'Robot Overview': 'Tổng quan robot',
    'Technical Specifications': 'Thông số kỹ thuật', 'Season Achievements': 'Thành tích mùa giải', '📐 View CAD file': '📐 Xem file CAD',
    'Edit': 'Sửa', 'Delete': 'Xóa', 'Description': 'Mô tả', '✎ Edit': '✎ Sửa', 'Files': 'Tệp', 'File name': 'Tên tệp',
    'Link (Drive, GitHub...) — use this if the file is large': 'Link (Drive, GitHub...) — dùng khi tệp lớn', '+ Add': '+ Thêm',
    'Project Logs': 'Nhật ký dự án', '+ New Log': '+ Nhật ký mới', 'ENJOY THIS PROJECT?': 'BẠN THÍCH DỰ ÁN NÀY?', 'Copy link': 'Sao chép link',
    'Share on Facebook': 'Chia sẻ lên Facebook', 'Share on Instagram': 'Chia sẻ lên Instagram', 'Share on Twitter': 'Chia sẻ lên Twitter',
    '← Back to project details': '← Quay lại chi tiết dự án', 'Sort by': 'Sắp xếp', 'Newest': 'Mới nhất', 'Oldest': 'Cũ nhất',
    'No project logs yet.': 'Chưa có nhật ký dự án.', 'No photos yet.': 'Chưa có ảnh.', 'No files yet.': 'Chưa có tệp.',
    'No description yet.': 'Chưa có mô tả.', 'Untitled season': 'Mùa giải chưa đặt tên', 'Untitled log': 'Nhật ký chưa đặt tên', 'Untitled file': 'Tệp chưa đặt tên',
    'View Full Size ↗': 'Xem kích thước đầy đủ ↗', 'COVER': 'ẢNH BÌA',
    // resources
    '← Resources': '← Tài nguyên', '🔗 Open link': '🔗 Mở link', '🖼️ Edit content': '🖼️ Sửa nội dung', 'No resources yet.': 'Chưa có tài nguyên.',
    'New Resource': 'Tài nguyên mới', 'Open simulator →': 'Mở mô phỏng →', 'BIOBUZZ Simulator': 'Mô phỏng BIOBUZZ',
    'Play the FTC 2026–2027 game in 3D right in your browser: drive with a gamepad, plan your AUTO, practise against AI bots.':
      'Chơi thể thức FTC 2026–2027 dạng 3D ngay trên trình duyệt: lái bằng tay cầm, lên chiến thuật AUTO, luyện tập với bot AI.',
    // sponsors
    'Sponsors carousel': 'Băng chuyền nhà tài trợ', '＋ Add sponsor': '＋ Thêm nhà tài trợ', '✎ Edit centered sponsor': '✎ Sửa nhà tài trợ ở giữa',
    '✕ Delete': '✕ Xóa', '✎ Edit thank-you': '✎ Sửa lời cảm ơn', 'Our sponsors will appear here soon.': 'Các nhà tài trợ sẽ sớm xuất hiện ở đây.',
    'Diamond': 'Kim cương', 'Gold': 'Vàng', 'Silver': 'Bạc', 'Partner': 'Đối tác',
    // forms / overlays (admin)
    'Cancel': 'Hủy', 'Save': 'Lưu', 'Save robot': 'Lưu robot', 'Save log': 'Lưu nhật ký', 'Add New': 'Thêm mới', 'Log in': 'Đăng nhập',
    'Password': 'Mật khẩu', 'Wrong password': 'Sai mật khẩu', 'Season name': 'Tên mùa giải', 'Year': 'Năm', 'e.g. DECODE': 'VD: DECODE',
    'e.g. 2025-2026': 'VD: 2025-2026', 'Compose content': 'Soạn nội dung', '+ Paragraph': '+ Đoạn văn', '+ Image': '+ Ảnh', '+ Heading': '+ Tiêu đề',
    'New Log': 'Nhật ký mới', 'Log title': 'Tiêu đề nhật ký', '+ add spec': '+ thêm thông số', '+ add achievement': '+ thêm thành tích',
    'Cover banner (wide banner shown at the top of the season page)': 'Ảnh bìa (banner rộng hiển thị đầu trang mùa giải)',
    'Photos (robot + award photos — the first one is used as the Season Archives cover; use the arrows to reorder)':
      'Ảnh (robot + giải thưởng — ảnh đầu tiên làm ảnh bìa ở Lưu trữ mùa giải; dùng mũi tên để sắp xếp)',
    'Describe the overall structure and design concept...': 'Mô tả cấu trúc tổng thể và ý tưởng thiết kế...',
    'CAD file link (GrabCAD / Google Drive / Onshape...)': 'Link file CAD (GrabCAD / Google Drive / Onshape...)',
    'Write a paragraph...': 'Viết một đoạn văn...', 'Image caption (optional)': 'Chú thích ảnh (không bắt buộc)', 'Heading text': 'Nội dung tiêu đề',
    // simulator page (launcher)
    'Mode': 'Chế độ', 'Match': 'Đấu trận', 'You + bot partner vs 2 bots': 'Bạn + bot đồng đội đấu 2 bot',
    'Practice': 'Luyện tập', 'Alone on the field': 'Một mình trên sân', 'Two players': 'Hai người',
    'One screen, two controllers': 'Một màn hình, hai tay cầm', 'AUTO strategy': 'Chiến thuật AUTO',
    'Program the first 30 seconds': 'Lập trình 30 giây đầu trận', 'Start': 'Bắt đầu', 'Ready': 'Sẵn sàng', 'Starting…': 'Đang khởi động…',
    'Loading simulator…': 'Đang tải mô phỏng…', 'Mode & language': 'Chế độ & ngôn ngữ', 'Exit simulator': 'Thoát mô phỏng',
    "Starts with the game's default settings. Robot, alliance, bots and controls can be changed any time in the in-game menu.":
      'Bắt đầu với thiết lập mặc định của game. Robot, liên minh, bot và điều khiển có thể đổi bất cứ lúc nào trong menu của game.',
    'The simulator is taking long to start. Check your internet connection (three.js is loaded from a CDN).':
      'Mô phỏng khởi động lâu bất thường. Kiểm tra kết nối mạng (three.js được tải từ CDN).',
    'This browser is too old to run the simulator. Please update Chrome, Edge, Firefox or Safari.':
      'Trình duyệt quá cũ để chạy mô phỏng. Hãy cập nhật Chrome, Edge, Firefox hoặc Safari.'
  };
  // text that is built with numbers inside
  var RX = [
    [/^View all (\d+) project logs?$/, function (m) { return 'Xem tất cả ' + m[1] + ' nhật ký dự án'; }]
  ];
  // whole blocks whose inline markup changes with the language (EN html is captured from the page)
  var BLOCKS = [
    ['.hero-sub', '<b>Thiết kế</b>, <b>chế tạo</b> và <b>lập trình</b> robot để giải quyết vấn đề, thi đấu và truyền cảm hứng cho thế hệ kỹ sư tiếp theo.']
  ];
  // never touched: admin-editable text that script.js reads back from the DOM, user content editors, the simulator frame
  var SKIP = 'script,style,svg,iframe,textarea,[contenteditable],[data-i18n-skip],#thTitle,#thText,#thSign,.hero-sub';
  var ATTR = ['placeholder', 'title', 'aria-label'];

  var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
  var VI = {}; Object.keys(VI_RAW).forEach(function (k) { VI[norm(k)] = VI_RAW[k]; });
  function tr(s) {
    var k = norm(s); if (!k) return undefined;
    if (VI[k] !== undefined) return VI[k];
    for (var i = 0; i < RX.length; i++) { var m = k.match(RX[i][0]); if (m) return RX[i][1](m); }
    return undefined;
  }

  var lang = 'en';
  try { lang = localStorage.getItem(KEY) || ''; } catch (e) { lang = ''; }
  if (lang !== 'vi' && lang !== 'en') {
    var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']);
    lang = langs.some(function (l) { return /^vi\b/i.test(l); }) ? 'vi' : 'en';
  }

  var orig = new WeakMap(), out = new WeakMap(), busy = false;
  function skipped(el) { return !el || (el.closest && el.closest(SKIP)); }
  function txText(n) {
    var v = n.nodeValue; if (!v || !v.trim() || skipped(n.parentElement)) return;
    if (lang === 'vi') {
      if (out.get(n) === v) return;
      var t = tr(v);
      if (t !== undefined) { var m = v.match(/^(\s*)[\s\S]*?(\s*)$/), r = m[1] + t + m[2]; orig.set(n, v); out.set(n, r); n.nodeValue = r; }
      else out.delete(n);
    } else if (out.has(n) && out.get(n) === v) { n.nodeValue = orig.get(n); out.delete(n); }
  }
  function txAttr(el) {
    if (skipped(el) && el.tagName !== 'TEXTAREA') return;
    for (var i = 0; i < ATTR.length; i++) {
      var a = ATTR[i], v = el.getAttribute && el.getAttribute(a); if (v == null) continue;
      var st = el.__tcA && el.__tcA[a];
      if (lang === 'vi') { if (st && st[1] === v) continue; var t = tr(v); if (t !== undefined) { (el.__tcA = el.__tcA || {})[a] = [v, t]; el.setAttribute(a, t); } }
      else if (st && st[1] === v) { el.setAttribute(a, st[0]); delete el.__tcA[a]; }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) { txText(root); return; }
    if (root.nodeType !== 1) return;
    txAttr(root);
    var w = document.createTreeWalker(root, 5, { acceptNode: function (n) { return n.nodeType === 1 && /^(SCRIPT|STYLE|IFRAME)$/.test(n.tagName) ? 2 : 1; } }), n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) txText(n); else txAttr(n); }
  }
  function blocks() {
    BLOCKS.forEach(function (b) {
      document.querySelectorAll(b[0]).forEach(function (el) {
        if (el.__tcEn == null) el.__tcEn = el.innerHTML;
        el.innerHTML = lang === 'vi' ? b[1] : el.__tcEn;
      });
    });
  }
  function syncSwitch() {
    document.querySelectorAll('#langSw [data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'); });
  }
  function apply() {
    busy = true;
    document.documentElement.lang = lang;
    blocks(); walk(document.body); syncSwitch();
    mo.takeRecords(); busy = false;
  }
  var mo = new MutationObserver(function (recs) {
    if (busy) return; busy = true;
    recs.forEach(function (r) {
      if (r.type === 'characterData') txText(r.target);
      else if (r.type === 'attributes') txAttr(r.target);
      else r.addedNodes.forEach(walk);
    });
    mo.takeRecords(); busy = false;
  });

  window.TCI18N = {
    get lang() { return lang; },
    set: function (l, from) {
      l = l === 'vi' ? 'vi' : 'en'; if (l === lang) return;
      lang = l; try { localStorage.setItem(KEY, l); } catch (e) {}
      apply();
      window.dispatchEvent(new CustomEvent('tc-lang', { detail: { lang: l, from: from || 'site' } }));
    },
    t: function (s) { var t = lang === 'vi' ? tr(s) : undefined; return t === undefined ? s : t; },
    add: function (o) { for (var k in o) VI[norm(k)] = o[k]; if (lang === 'vi') apply(); }
  };

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#langSw [data-lang]');
    if (b) window.TCI18N.set(b.dataset.lang);
  });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR });
  apply();
})();
