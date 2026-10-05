// Pattern rules for text the game builds at run time (numbers, names, reasons inside a sentence).
// Each rule: [RegExp on the Vietnamese text node, function (m) -> English]. L(x) translates a fragment
// through the dictionary (or leaves it), AL maps ĐỎ/XANH, LR maps TRÁI/PHẢI.
var AL = { 'ĐỎ': 'RED', 'XANH': 'BLUE' };
var LR = { 'TRÁI': 'LEFT', 'PHẢI': 'RIGHT' };
var CAMU = { 'KHU LÁI': 'DRIVER STATION', 'THEO ROBOT': 'FOLLOW ROBOT', 'KHÁN ĐÀI': 'BROADCAST', 'NHÌN TỪ TRÊN': 'TOP-DOWN', 'CAMERA ROBOT': 'ROBOT CAMERA', 'TỰ DO': 'FREE' };
var CAM = { 'Tự động': 'Auto', 'Khán đài': 'Broadcast', 'Theo robot': 'Follow robot', 'Camera robot': 'Robot camera', 'Từ trên': 'Top-down', 'Nhìn từ trên': 'Top-down', 'Tự do': 'Free', 'Khu lái': 'Driver station' };
var SKILL = { 'dễ': 'easy', 'vừa': 'normal', 'khó': 'hard' };
function lowerReason(x) { var u = L(x.toUpperCase()); return u === x.toUpperCase() ? x : u.toLowerCase(); }
function robotLine(mid) {
  return mid.split(' · ').map(function (p) {
    return p.replace(/súng cố định/g, 'fixed shooter').replace(/^arm dài$/, 'long arm').replace(/^arm ngắn$/, 'short arm');
  }).join(' · ');
}
function fouls(list) { return list.split('; ').map(function (p) { var q = p.match(/^(G\d+) (.+)$/); return q ? q[1] + ' ' + L(q[2]) : p; }).join('; '); }
var RULES = [
  // home / match setup
  [/^Trận nhanh: (.+) ở (ĐỎ|XANH) (\d), bot (dễ|vừa|khó)\. Đổi trong “Tùy chỉnh trận”\.$/, function (m) { return 'Quick match: ' + L(m[1]) + ' as ' + AL[m[2]] + ' ' + m[3] + ', ' + SKILL[m[4]] + ' bots. Change it in “Customize match”.'; }],
  [/^(Mecanum|Swerve|Tank) (\d+) rpm · (.+) · ([\d.]+) kg$/, function (m) { return m[1] + ' ' + m[2] + ' rpm · ' + robotLine(m[3]) + ' · ' + m[4] + ' kg'; }],
  [/^(Mecanum|Swerve|Tank) (\d+) rpm · ([\d.]+) kg$/, function (m) { return m[0]; }],
  [/^Khung (.+) in$/, function (m) { return 'Frame ' + m[1] + ' in'; }],
  [/^Hợp lệ (R\d+\/R\d+)$/, function (m) { return 'Legal ' + m[1]; }],
  [/^Motor (\d+)\/8$/, function (m) { return m[0]; }],
  // garage
  [/^Súng \((\d)\/3\)$/, function (m) { return 'Shooters (' + m[1] + '/3)'; }],
  [/^Súng (\d)$/, function (m) { return 'Shooter ' + m[1]; }],
  [/^Đây là robot mẫu\. Chỉnh bất kỳ thông số nào sẽ tạo bản sao của bạn\.(?: ([\s\S]*))?$/, function (m) { return 'This is a preset robot. Changing any setting makes your own copy.' + (m[1] ? ' ' + L(m[1]) : ''); }],
  [/^Đã nhập “(.+)”\.$/, function (m) { return 'Imported “' + L(m[1]) + '”.'; }],
  [/^Xóa “(.+)”\? Không khôi phục được\.$/, function (m) { return 'Delete “' + L(m[1]) + '”? This cannot be undone.'; }],
  [/^Không đọc được mã: (.+)$/, function (m) { return 'Could not read the code: ' + L(m[1]); }],
  [/^(.+) \(của bạn\)$/, function (m) { return L(m[1]) + ' (yours)'; }],
  [/^(.+) 2$/, function (m) { var t = L(m[1]); return t === m[1] ? undefined : t + ' 2'; }],
  // two players / controllers
  [/^Cần (\d) tay cầm \(đang thấy (\d+)\)\. Cắm vào rồi bấm một nút để trình duyệt nhận(, hoặc bật lái bằng bàn phím trong Cài đặt → Điều khiển)?\.$/, function (m) { return 'Needs ' + m[1] + ' controllers (' + m[2] + ' found). Plug them in and press a button so the browser detects them' + (m[3] ? ', or turn on keyboard driving in Settings → Controls' : '') + '.'; }],
  [/^(\d+) tay cầm sẵn sàng$/, function (m) { return m[1] + (m[1] === '1' ? ' controller ready' : ' controllers ready'); }],
  [/^Người (\d)( · driver| · operator)?$/, function (m) { return 'Player ' + m[1] + (m[2] || ''); }],
  [/^Tay cầm (\d+): ([\s\S]*)$/, function (m) { return 'Controller ' + m[1] + ': ' + m[2]; }],
  [/^Đã nhận tay cầm: (.*)$/, function (m) { return 'Controller connected: ' + m[1]; }],
  // AUTO planner checks and test-run log
  [/^Bước (\d+): điểm quá gần vạch giữa\. Trong AUTO robot không được qua vạch \(G402\) nên sẽ dừng cách vạch (\d+) in\.$/, function (m) { return 'Step ' + m[1] + ': the point is too close to the centre line. In AUTO the robot may not cross it (G402), so it will stop ' + m[2] + ' in short of the line.'; }],
  [/^Bước (\d+): điểm đè lên chân khung HIVE, robot chỉ tới được sát bên cạnh\.$/, function (m) { return 'Step ' + m[1] + ': the point is on a HIVE frame leg; the robot can only get right next to it.'; }],
  [/^dừng cách điểm (\d+) in$/, function (m) { return 'stopped ' + m[1] + ' in from the point'; }],
  [/^bắn (\d+) quả$/, function (m) { return 'shot ' + m[1] + (m[1] === '1' ? ' ball' : ' balls'); }],
  [/^nhặt (\d+) quả$/, function (m) { return 'picked up ' + m[1]; }],
  [/^nhặt (\d+) quả trong vòng tròn$/, function (m) { return 'pick up ' + m[1] + (m[1] === '1' ? ' ball' : ' balls') + ' inside the circle'; }],
  [/^không bắn được: (.+)$/, function (m) { return 'could not shoot: ' + lowerReason(m[1]); }],
  [/^chính xác (.+)$/, function (m) { return 'accuracy ' + m[1]; }],
  [/^Bị thổi: (.+)$/, function (m) { return 'Fouls called: ' + fouls(m[1]); }],
  [/^Bóng trong CELL lúc hết AUTO: (\d+) \(tính 2 điểm mỗi quả khi hết trận\)\. Trong trận thật có thêm 3 robot khác trên sân nên đường đi có thể bị chặn\.$/, function (m) { return 'Balls in CELL when AUTO ended: ' + m[1] + ' (2 points each at the end of the match). A real match has 3 more robots on the field, so the path may be blocked.'; }],
  [/^Tối đa (\d+) bước\.$/, function (m) { return 'At most ' + m[1] + ' steps.'; }],
  [/^cách tường liên minh (\d+) in · cách tường khán đài (\d+) in$/, function (m) { return m[1] + ' in from alliance wall · ' + m[2] + ' in from audience wall'; }],
  [/^Đã gán “(.+)” cho (.+)\. Chọn lại ở màn hình Đấu trận nếu muốn đổi\.$/, function (m) { return 'Assigned “' + L(m[1]) + '” to ' + L(m[2]) + '. Pick again on the Match screen to change it.'; }],
  // HUD
  [/^(TURRET|XOAY ROBOT) CÒN (\d+)° (TRÁI|PHẢI)$/, function (m) { return (m[1] === 'TURRET' ? 'TURRET' : 'TURN ROBOT') + ' ' + m[2] + '° ' + LR[m[3]]; }],
  [/^GIỚI HẠN TURRET · XOAY ROBOT (TRÁI|PHẢI)$/, function (m) { return 'TURRET LIMIT · TURN ROBOT ' + LR[m[1]]; }],
  [/^ĐANG PIN ([\d.]+) s$/, function (m) { return 'PINNING ' + m[1] + ' s'; }],
  [/^LỆCH ĐỊNH VỊ (\d+) in$/, function (m) { return 'POSE ERROR ' + m[1] + ' in'; }],
  [/^ĐẦY 4\/4$/, function () { return 'FULL 4/4'; }],
  [/^HP: (\d+) NECTAR( · KHÓA)?$/, function (m) { return 'HP: ' + m[1] + ' NECTAR' + (m[2] ? ' · LOCKED' : ''); }],
  [/^HIVE (ĐỎ|XANH) · CELL ngửa (phía khán đài|phía xa)$/, function (m) { return AL[m[1]] + ' HIVE · CELL up on the ' + (m[2] === 'phía xa' ? 'far side' : 'audience side'); }],
  [/^HIVE (ĐỎ|XANH)$/, function (m) { return AL[m[1]] + ' HIVE'; }],
  [/^(\d+)% tới TIP$/, function (m) { return m[1] + '% to TIP'; }],
  [/^BẮN (\d+) · VÀO (\d+)(?: · (\d+)%)?$/, function (m) { return 'SHOT ' + m[1] + ' · MADE ' + m[2] + (m[3] ? ' · ' + m[3] + '%' : ''); }],
  [/^(TRỐNG|POLLEN|NECTAR) · (TURRET|SÚNG CỐ ĐỊNH) · (.+)$/, function (m) { return L(m[1]) + ' · ' + L(m[2]) + ' · ' + m[3]; }],
  [/^NECTAR (ĐỎ|XANH) ·$/, function (m) { return AL[m[1]] + ' NECTAR ·'; }],
  [/^ĐƯỢC ĐƯA (\d+)$/, function (m) { return 'MAY FEED ' + m[1]; }],
  [/^LỖI (\d+)M (\d+)m$/, function (m) { return 'FOULS ' + m[1] + 'M ' + m[2] + 'm'; }],
  [/^(\d+) fps · ([\d.]+) ms · tệ nhất (\d+) ms · vật lý 300 Hz(?: · độ phân giải (\d+)%)?$/, function (m) { return m[1] + ' fps · ' + m[2] + ' ms · worst ' + m[3] + ' ms · physics 300 Hz' + (m[4] ? ' · resolution ' + m[4] + '%' : ''); }],
  [/^(ĐỎ|XANH) (\d) · (.+)$/, function (m) { return AL[m[1]] + ' ' + m[2] + ' · ' + m[3]; }],
  [/^(ĐỎ|XANH) (\d)$/, function (m) { return AL[m[1]] + ' ' + m[2]; }],
  [/^(KHU LÁI|THEO ROBOT|KHÁN ĐÀI|NHÌN TỪ TRÊN|CAMERA ROBOT|TỰ DO)(?: · (LÁI THEO SÂN|LÁI THEO ROBOT))?( · GÓC ĐÃ CHỈNH \(NHẤP ĐÚP ĐỂ ĐẶT LẠI\))? · (.+)$/, function (m) { return CAMU[m[1]] + (m[2] ? ' · ' + L(m[2]) : '') + (m[3] ? ' · ADJUSTED ANGLE (DOUBLE-CLICK TO RESET)' : '') + ' · ' + m[4]; }],
  [/^(G\d+) (MINOR|MAJOR) (ĐỎ|XANH): (.+)$/, function (m) { return m[1] + ' ' + m[2] + ' ' + AL[m[3]] + ': ' + L(m[4]); }],
  [/^(G\d+) · (MINOR|MAJOR) (ĐỎ|XANH): (.+)$/, function (m) { return m[1] + ' · ' + m[2] + ' ' + AL[m[3]] + ': ' + L(m[4]); }],
  [/^(.+) đang PIN (.+): ([\d.]+) s$/, function (m) { return m[1] + ' PINNING ' + m[2] + ': ' + m[3] + ' s'; }],
  // results
  [/^ĐỎ · XANH \((\d+) và (\d+) TIP\)$/, function (m) { return 'RED · BLUE (' + m[1] + ' and ' + m[2] + ' TIPs)'; }],
  [/^(ĐỎ|XANH) (\d) · (\d+) giây được lái$/, function (m) { return AL[m[1]] + ' ' + m[2] + ' · driven for ' + m[3] + ' s'; }],
  [/^(.+) vào CELL$/, function (m) { return m[1] + ' into CELL'; }],
  [/^([\d.]+) ft\/s trung bình$/, function (m) { return m[1] + ' ft/s average'; }],
  // replay camera label
  [/^TỰ ĐỘNG · (Khán đài|Theo robot|Camera robot|Từ trên|Tự do|Khu lái)(.*)$/, function (m) { return 'AUTO · ' + CAM[m[1]] + m[2]; }],
  [/^(Tự động|Khán đài|Theo robot|Camera robot|Từ trên|Nhìn từ trên|Tự do|Khu lái)( · .+)?$/, function (m) { return CAM[m[1]] + (m[2] || ''); }],
  // toasts and banners
  [/^Góc nhìn: (.+?)( \(góc bạn đã chỉnh\))?$/, function (m) { return 'View: ' + (CAM[m[1]] || L(m[1])) + (m[2] ? ' (your adjusted angle)' : ''); }],
  [/^(Tự bắn khi khóa|Quỹ đạo dự đoán|Camera AprilTag): (BẬT|TẮT)$/, function (m) { return ({ 'Tự bắn khi khóa': 'Auto-fire when locked', 'Quỹ đạo dự đoán': 'Predicted trajectory', 'Camera AprilTag': 'AprilTag camera' })[m[1]] + ': ' + (m[2] === 'BẬT' ? 'ON' : 'OFF'); }],
  [/^Human player đưa NECTAR vào LOADING ZONE \(còn (\d+)\)$/, function (m) { return 'Human player put NECTAR in the LOADING ZONE (' + m[1] + ' left)'; }],
  [/^không giới hạn thời gian · (.+) xếp lại sân$/, function (m) { return 'no time limit · ' + m[1] + ' resets the field'; }],
  [/^AUTO: (.+)$/, function (m) { var t = L(m[1]); return t === m[1] && /[À-ỹ]/.test(m[1]) ? undefined : 'AUTO: ' + t; }],
  [/^Lỗi khi khởi động: ([\s\S]+)\. Chụp màn hình này gửi lại để được sửa\.$/, function (m) { return 'Startup error: ' + m[1] + '. Send a screenshot of this so it can be fixed.'; }],
];
