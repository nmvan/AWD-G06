<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  Backend RESTful API được xây dựng bằng <b>NestJS</b>, phục vụ cho ứng dụng <b>Email Client</b>.
  <br />
  Hệ thống hoạt động như một <b>Proxy Server</b> bảo mật giao tiếp với <b>Gmail API</b>, đồng thời đồng bộ dữ liệu vào <b>MongoDB</b> để phục vụ tìm kiếm nâng cao và quản lý quy trình.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank">
    <img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank">
    <img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" />
  </a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank">
    <img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" />
  </a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank">
    <img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord" />
  </a>
</p>

---

# G06 – NestJS Email Client Backend (Week 3 Updated)

## 🚀 Tính năng mới (Tuần 3)

### F1 – Fuzzy Search Engine (Công cụ tìm kiếm mờ)

* **Cơ chế:** Tìm kiếm trên MongoDB đã được đồng bộ hóa, không gọi trực tiếp Gmail API nhằm tối ưu hiệu năng.
* **Phạm vi:**

  * Tiêu đề (Subject)
  * Người gửi (Sender Name / Email)
  * Tóm tắt (Snippet)
* **Typo Tolerance:** Hỗ trợ sai chính tả, tìm kiếm không dấu.
* **Partial Matching:** Sử dụng Regex (case-insensitive).

  * Ví dụ: `Nguy` → `Nguyễn`, `marketing` → email liên quan marketing.
* **Xếp hạng:** Ưu tiên email mới hơn và độ liên quan cao hơn.

### Filtering & Sorting (Server-side)

* `filterUnread=true` – Chỉ email chưa đọc
* `filterHasAttachments=true` – Chỉ email có đính kèm
* `sortBy=date-asc | date-desc` – Sắp xếp theo ngày

---

## 🌟 Các tính năng cốt lõi (Tuần 1 & 2)

### Xác thực & Phân quyền

* JWT Authentication (Access & Refresh Token)
* Google OAuth 2.0 (Authorization Code Flow)
* Route Guards

### Gmail Proxy & Đồng bộ

* Tự động refresh Google Access Token (server-side)
* Đồng bộ email Gmail → MongoDB
* Chức năng:

  * Gửi email
  * Lấy danh sách / chi tiết email
  * Tải file đính kèm
  * Đánh dấu đã đọc / gắn sao

---

## 🛠 Công nghệ sử dụng

* **Framework:** NestJS
* **Database:** MongoDB, Mongoose
* **Search:** MongoDB Regex & Aggregation
* **Google API:** googleapis (Official Node.js Client)
* **Auth:** Passport, JWT, Bcrypt

---

## ⚙️ Cài đặt & Chạy dự án

### Yêu cầu tiên quyết

* Node.js v18+
* MongoDB (Local hoặc Atlas)
* Google Cloud Project (đã bật Gmail API)

### Cài đặt

```bash
cd backend
npm install
```

### Cấu hình môi trường (`.env`)

```env
PORT=3000
DATABASE_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/db

JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/login/oauth/google/callback

FRONTEND_URL=http://localhost:5173
```

### Chạy server

```bash
npm run start:dev
```

Server chạy tại: **[http://localhost:3000](http://localhost:3000)**

---

## 📡 API Endpoints chính

### Authentication

| Method | Endpoint      | Mô tả            |
| ------ | ------------- | ---------------- |
| POST   | /auth/login   | Đăng nhập thường |
| POST   | /auth/google  | Đăng nhập Google |
| POST   | /auth/refresh | Refresh Token    |

### Mail & Search

| Method | Endpoint                        | Mô tả                       |
| ------ | ------------------------------- | --------------------------- |
| GET    | /mail/search                    | Fuzzy Search (`?q=keyword`) |
| GET    | /mail/mailboxes/:id/emails      | Lấy email (filter/sort)     |
| GET    | /mail/attachments/:msgId/:attId | Tải đính kèm                |
| POST   | /mail/send                      | Gửi email                   |
| POST   | /mail/emails/:id/reply          | Trả lời email               |

---

## 🔐 Bảo mật

* Google Refresh Token được **mã hóa** trong database
* Frontend **không bao giờ** truy cập trực tiếp token Google
* Backend đóng vai trò **Proxy**, tự động refresh token thông qua `googleapis`
