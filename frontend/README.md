# G06 – React Email Client Frontend (Week 3 Updated)

<p align="center">
  Single Page Application (SPA) quản lý <b>Email Client</b> tích hợp <b>AI</b> và quy trình làm việc dạng <b>Kanban</b>.
  <br />
  Phiên bản <b>G06</b> bổ sung <b>Fuzzy Search</b> và <b>Filtering / Sorting</b> nâng cao trên bảng Kanban.
</p>

---

## 🚀 Tính năng mới (Tuần 3)

### F2 – Fuzzy Search UI (Giao diện tìm kiếm mờ)

* **Thanh tìm kiếm:** Tích hợp trên Header, cho phép tìm kiếm nhanh email.
* **Chế độ kết quả:**

  * Hiển thị danh sách dạng thẻ dọc.
  * Thông tin gồm: Người gửi, Tiêu đề, Snippet.
  * Click để xem chi tiết email và tự động cập nhật trạng thái **Đã đọc**.
* **UX States:**

  * Loading
  * Empty State: *Không tìm thấy kết quả*
  * Error Handling
* **Navigation:** Quay lại Kanban bằng nút **Back to Board** hoặc xóa từ khóa tìm kiếm.

### F3 – Filtering & Sorting Kanban

* **Toolbar:** Hiển thị trực tiếp trên Kanban Board.
* **Filtering:**

  * *Unread Only* – Chỉ email chưa đọc
  * *Has Attachments* – Chỉ email có đính kèm
* **Sorting:**

  * Mới nhất
  * Cũ nhất
* **Server-side Processing:**

  * Gọi trực tiếp API Backend để đảm bảo dữ liệu chính xác khi phân trang.
* **Real-time Update:** UI cập nhật ngay khi thay đổi bộ lọc.

---

## 🌟 Tính năng cốt lõi (Tuần 1 & 2)

### Dashboard (Kanban + AI)

* Kéo & thả email giữa các cột: Inbox, To Do, Done, Snoozed.
* AI Summary (Mock hoặc LLM) giúp đọc nhanh nội dung.
* Snooze email và tự động khôi phục theo thời gian.

### Thao tác Email

* Soạn thảo, Trả lời, Chuyển tiếp.
* Hiển thị nội dung HTML an toàn.
* Tải file đính kèm.

---

## 🛠 Công nghệ sử dụng

* **Core:** React 19, Vite, TypeScript
* **Styling:** Tailwind CSS, Shadcn/UI
* **State Management:** React Hooks, Context API
* **HTTP Client:** Axios (Interceptor xử lý Refresh Token)
* **Drag & Drop:** @hello-pangea/dnd

---

## ⚙️ Cài đặt & Chạy dự án

### Yêu cầu tiên quyết

* Node.js v18+
* Backend G06 đang chạy tại `http://localhost:3000`

### Cài đặt

```bash
cd frontend
npm install
```

### Cấu hình môi trường (`.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/login/oauth/google/callback
```

### Chạy ứng dụng

```bash
npm run dev
```

Truy cập: **[http://localhost:5173](http://localhost:5173)**

---

## 💡 Hướng dẫn kiểm thử (Demo Flow)

### 1. Tìm kiếm (F1 & F2)

* Nhập từ khóa (ví dụ: `marrketing`).
* Nhấn **Enter** để xem kết quả fuzzy search.

### 2. Lọc Kanban (F3)

* Quay lại màn hình chính.
* Tick **Unread Only**.
* Kiểm tra các cột chỉ hiển thị email chưa đọc.

### 3. Sắp xếp (F3)

* Chọn **Date: Oldest**.
* Thứ tự email trong cột sẽ đảo ngược.

---

## 🔒 Bảo mật Frontend

* **Access Token:** Lưu trong Memory.
* **Refresh Token:** Lưu trong LocalStorage để duy trì session.
* **Concurrency Guard:** Hàng đợi request khi token hết hạn, tránh spam API refresh.
