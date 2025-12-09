# Hệ thống Tutor/Mentor (MVP)

Đây là sản phẩm MVP (Minimum Viable Product) cho bài tập lớn môn học Software Engineering. Dự án xây dựng một MVP đơn giản cho phép sinh viên tham gia buổi tư vấn hoặc hủy buổi tư vấn.

## 📂 Cấu trúc thư mục

Dự án được tổ chức với các thư mục chính sau:

-   `backend/`: Chứa toàn bộ mã nguồn cho phần máy chủ (server), bao gồm API, logic xử lý và kết nối cơ sở dữ liệu.
-   `frontend/`: Chứa toàn bộ mã nguồn cho phần giao diện người dùng (client) được xây dựng bằng React.
-   `docker-compose.yml`: File cấu hình để triển khai toàn bộ ứng dụng (backend, frontend, database) bằng Docker.

## ✨ Các chức năng chính (MVP)

Phiên bản MVP này tập trung vào các chức năng cốt lõi sau:

1.  **Đăng nhập:** Người dùng có thể đăng nhập vào hệ thống bằng tài khoản đã được cấp.
2.  **Đăng xuất:** Cho phép người dùng kết thúc phiên làm việc và đăng xuất khỏi hệ thống một cách an toàn.
3.  **Tham gia buổi học:** Sau khi đăng nhập, sinh viên có thể xem danh sách các buổi học và đăng ký tham gia.
4.  **Hủy tham gia:** Nếu đổi ý, sinh viên có thể hủy đăng ký tham gia một buổi học đã chọn.
5.  **Xem trang cá nhân:** Người dùng có thể xem thông tin cá nhân cơ bản của mình.

## 🛠️ Công nghệ sử dụng

-   **Backend:**
    -   Node.js & Express.js
    -   MongoDB (Cơ sở dữ liệu)
-   **Frontend:**
    -   React.js
    -   Tailwind CSS
-   **Deployment:**
    -   Docker

## 🚀 Hướng dẫn cài đặt và chạy dự án

Bạn có thể chạy dự án theo hai cách: sử dụng Docker (khuyến khích) hoặc chạy thủ công từng thành phần.

### Cách 1: Chạy bằng Docker (Khuyến khích)

Đây là cách đơn giản nhất để khởi chạy toàn bộ hệ thống.

1.  **Yêu cầu:** Cài đặt Docker và Docker Compose.

2.  **Khởi chạy:** Mở terminal tại thư mục gốc của dự án và chạy lệnh sau:

    ```bash
    docker build -t tutor-support-system .
    docker run -p 4000:4000 tutor-support-system
    ```

3.  Ứng dụng sẽ có sẵn tại: `http://localhost:4000`

### Cách 2: Chạy thủ công

Nếu bạn không muốn sử dụng Docker, bạn có thể chạy backend và frontend một cách riêng biệt.

#### Chạy Backend

1.  Di chuyển vào thư mục `backend`:
    ```bash
    cd backend
    ```
2.  Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```
3.  Khởi động server (đảm bảo MongoDB của bạn đang chạy):
    ```bash
    npm start
    ```

#### Chạy Frontend

1.  Mở một terminal khác, di chuyển vào thư mục `frontend`:
    ```bash
    cd frontend
    ```
2.  Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```
3.  Khởi động ứng dụng React:
    ```bash
    npm start
    ```

---
