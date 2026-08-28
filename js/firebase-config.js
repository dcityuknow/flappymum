// ============================================================
// firebase-config.js — Cấu hình project Firebase của BẠN.
// Tách riêng khỏi js/leaderboard.js để đổi project Firebase (hoặc tắt hẳn
// leaderboard toàn cục) mà không phải sờ vào logic game.
//
// Lấy các giá trị bên dưới ở:
// Firebase Console > (chọn project) > ⚙️ Project settings > General
// > mục "Your apps" > chọn app Web (biểu tượng </>) > SDK setup and
// configuration > Config.
//
// Xem README.md phần "Set up the global leaderboard (Firebase)" để biết
// đầy đủ các bước tạo project + Realtime Database + Rules.
// ============================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.YOUR_REGION.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
};

// `leaderboardDB` là biến global mà js/leaderboard.js đọc. Để nguyên giá trị
// placeholder ở trên thì leaderboardDB sẽ là null và game tự fallback về
// leaderboard local (localStorage riêng từng trình duyệt) — vẫn chơi được
// bình thường, chỉ là không dùng chung giữa mọi người.
let leaderboardDB = null;
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY') {
    firebase.initializeApp(firebaseConfig);
    leaderboardDB = firebase.database();
  } else {
    console.warn('[firebase-config] Chưa điền config Firebase — leaderboard sẽ chạy chế độ local-only. Xem README.md.');
  }
} catch (e) {
  console.warn('[firebase-config] Không khởi tạo được Firebase, fallback về local-only:', e);
}
