// ============================================================
// leaderboard.js — Bảng xếp hạng Top 10 CHUNG cho mọi người chơi (mọi trình
// duyệt/máy), dựa trên Firebase Realtime Database. Cấu hình project ở file
// riêng js/firebase-config.js (xem README.md để lấy config + tạo Rules).
//
// Tự động cập nhật real-time nhờ listener .on('value', ...) bên dưới — khi
// đang mở bảng leaderboard mà có người khác vừa ghi điểm mới, danh sách tự
// vẽ lại ngay, không cần đóng/mở lại hay tải lại trang.
//
// Nếu Firebase CHƯA được cấu hình (js/firebase-config.js còn để giá trị mẫu),
// leaderboardDB sẽ là null và code tự fallback về leaderboard local
// (localStorage riêng từng trình duyệt), y hệt hành vi cũ — nên game vẫn
// chơi được ngay cả khi chưa setup backend.
// ============================================================

const LEADERBOARD_MAX_ENTRIES = 10;
// Chỉ dọn bớt các hạng ngoài Top 10 khi số entry đang lưu vượt ngưỡng này,
// để đỡ phải đọc/ghi Database liên tục mỗi lần có 1 điểm mới.
const LEADERBOARD_TRIM_THRESHOLD = 30;
const LOCAL_LEADERBOARD_KEY = 'flappyGameLeaderboardV1';

// Bản sao Top 10 mới nhất nhận từ Firebase, dùng để vẽ UI ngay lập tức mà
// không cần đọc lại Database mỗi lần mở bảng.
let currentLeaderboardList = [];

// Điểm cao hơn luôn xếp trên.
function compareLeaderboardEntries(a, b) {
  return b.score - a.score;
}

function getLeaderboardRef() {
  if (typeof leaderboardDB === 'undefined' || !leaderboardDB) return null;
  return leaderboardDB.ref('leaderboard');
}

// ---- Fallback local (chỉ dùng khi Firebase chưa được cấu hình) ----
function loadLocalLeaderboard() {
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function saveLocalLeaderboard(list) {
  try {
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(list));
  } catch (e) {
    // Bỏ qua nếu trình duyệt chặn localStorage (vd chế độ ẩn danh nghiêm ngặt)
  }
}

// Lưu điểm của 1 lượt chơi vừa kết thúc — lên Firebase nếu đã cấu hình,
// hoặc lưu local nếu chưa.
function addScoreToLeaderboard(name, scoreValue, charNum) {
  const entry = { name: name || 'Anonymous', score: scoreValue, charNum: charNum, date: Date.now() };

  const ref = getLeaderboardRef();
  if (!ref) {
    console.warn('[leaderboard] Firebase chưa được cấu hình — xem js/firebase-config.js. Điểm này chỉ lưu local.');
    const list = loadLocalLeaderboard();
    list.push(entry);
    list.sort(compareLeaderboardEntries);
    saveLocalLeaderboard(list.slice(0, LEADERBOARD_MAX_ENTRIES));
    renderLeaderboard();
    return;
  }

  ref.push(entry)
    .then(() => trimLeaderboardIfNeeded())
    .catch(err => console.warn('[leaderboard] Không ghi được lên Firebase:', err));
}

// Dọn bớt các hạng bị rớt ngoài Top 10 khỏi Database khi đã vượt
// LEADERBOARD_TRIM_THRESHOLD, để Database không phình to vô hạn theo thời gian.
function trimLeaderboardIfNeeded() {
  const ref = getLeaderboardRef();
  if (!ref) return;
  ref.once('value').then(snapshot => {
    const raw = snapshot.val();
    if (!raw) return;
    const keys = Object.keys(raw);
    if (keys.length <= LEADERBOARD_TRIM_THRESHOLD) return;
    const list = keys.map(k => ({ key: k, ...raw[k] }));
    list.sort(compareLeaderboardEntries);
    const toDelete = list.slice(LEADERBOARD_MAX_ENTRIES);
    toDelete.forEach(entry => ref.child(entry.key).remove().catch(() => {}));
  }).catch(err => console.warn('[leaderboard] Không dọn được Database:', err));
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderLeaderboard() {
  const ref = getLeaderboardRef();
  const list = ref ? currentLeaderboardList : loadLocalLeaderboard();

  leaderboardListEl.innerHTML = '';
  if (list.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No scores yet. Be the first!';
    leaderboardListEl.appendChild(li);
    return;
  }
  list.forEach((entry, idx) => {
    const li = document.createElement('li');
    const charLabel = entry.charNum === 2 ? 'Scotti' : 'Keng';
    li.innerHTML =
      '<span class="rank">#' + (idx + 1) + '</span>' +
      '<span class="name">' + escapeHtml(entry.name) + '</span>' +
      '<span class="char-badge">' + charLabel + '</span>' +
      '<span class="pts">' + entry.score + '</span>';
    leaderboardListEl.appendChild(li);
  });
}

function openLeaderboard() {
  renderLeaderboard();
  leaderboardOverlay.classList.remove('hidden');
}

function closeLeaderboard() {
  leaderboardOverlay.classList.add('hidden');
}

leaderboardBtn.addEventListener('click', openLeaderboard);
openLeaderboardFromSetupBtn.addEventListener('click', openLeaderboard);
closeLeaderboardBtn.addEventListener('click', closeLeaderboard);
leaderboardOverlay.addEventListener('click', (e) => {
  if (e.target === leaderboardOverlay) closeLeaderboard();
});

// ---- Lắng nghe Firebase real-time ----
// Bất cứ khi nào Database thay đổi (ai đó vừa ghi điểm, có thể ở máy khác),
// danh sách được sắp xếp lại, cắt còn Top 10, và vẽ lại UI ngay nếu bảng
// đang mở — không cần tải lại trang.
function initLeaderboardListener() {
  const ref = getLeaderboardRef();
  if (!ref) return; // chế độ local-only: renderLeaderboard() tự đọc localStorage mỗi lần gọi

  ref.on('value', snapshot => {
    const raw = snapshot.val();
    const list = raw ? Object.values(raw) : [];
    list.sort(compareLeaderboardEntries);
    currentLeaderboardList = list.slice(0, LEADERBOARD_MAX_ENTRIES);
    if (!leaderboardOverlay.classList.contains('hidden')) {
      renderLeaderboard();
    }
  }, err => {
    console.warn('[leaderboard] Mất kết nối tới Firebase:', err);
  });
}

initLeaderboardListener();
