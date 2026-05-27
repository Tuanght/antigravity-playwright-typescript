# OrangeHRM E2E Web UI Automation Framework

Framework kiểm thử tự động Web UI E2E được xây dựng bằng **Playwright Test** & **TypeScript** (Strict Mode) áp dụng mô hình **Page Object Model (POM)**.

## 🚀 Tính năng nổi bật
- **TypeScript Strict Mode**: Đảm bảo an toàn kiểu dữ liệu và code chuẩn mực.
- **Page Object Model**: Tách biệt rõ ràng giữa locator/action UI và kịch bản test.
- **Custom Fixtures**: Tối ưu hóa khởi tạo Page Objects tự động per-test.
- **Environment Management**: Quản lý cấu hình linh hoạt thông qua file `.env`.
- **Allure & HTML Report**: Báo cáo kiểm thử sinh động, chụp ảnh màn hình/quay video tự động khi kiểm thử thất bại.
- **CI/CD Integration**: Thiết lập sẵn GitHub Actions workflow.

---

## 📋 Yêu cầu hệ thống (Prerequisites)
- **Node.js**: Phiên bản LTS mới nhất (v18 trở lên).
- **npm**: Thường đi kèm với Node.js.

---

## 🛠️ Hướng dẫn cài đặt (Installation)

1. **Cài đặt thư viện dependencies:**
   ```bash
   npm install
   ```

2. **Cài đặt các trình duyệt Playwright:**
   ```bash
   npx playwright install
   ```

3. **Cấu hình môi trường:**
   Tạo file `.env` ở thư mục gốc (nếu chưa có) và thiết lập các thông số (hoặc sao chép từ `.env.example`):
   ```properties
   BASE_URL=https://opensource-demo.orangehrmlive.com
   TEST_USERNAME=Admin
   TEST_PASSWORD=admin123
   ```

---

## 🏃 Hướng dẫn chạy Test (Running Tests)

### 1. Chạy tất cả các test (Headless Mode):
```bash
npm run test
```

### 2. Chạy test với giao diện (Headed Mode):
```bash
npm run test:headed
```

### 3. Chạy test trên một trình duyệt cụ thể:
```bash
npx playwright test --project=chromium
```

### 4. Mở giao diện tương tác Playwright UI Mode:
```bash
npm run test:ui
```

### 5. Debug test step-by-step:
```bash
npm run test:debug
```

---

## 📊 Xem Báo cáo kiểm thử (Reporting)

### 1. Playwright HTML Report
Sau khi chạy test, báo cáo HTML mặc định của Playwright sẽ được sinh ra ở thư mục `playwright-report/`. Để mở báo cáo:
```bash
npx playwright show-report
```

### 2. Allure Report
Allure results được lưu tại `allure-results/`.
- **Sinh báo cáo Allure HTML:**
  ```bash
  npm run allure:generate
  ```
- **Mở báo cáo Allure trên trình duyệt:**
  ```bash
  npm run allure:open
  ```
- **Xóa kết quả và báo cáo cũ:**
  ```bash
  npm run allure:clear
  ```

---

## 📁 Cấu trúc thư mục dự án (Project Structure)
```
d:\Wordplace\Antigravity\Antigravity-CI/
├── playwright.config.ts        # Cấu hình Playwright Test
├── tsconfig.json               # Cấu hình TypeScript compiler
├── package.json                # Định nghĩa dependencies và test scripts
├── .env                        # Chứa các biến cấu hình cục bộ (chạy local)
├── .env.example                # File mẫu cấu hình biến môi trường
├── .gitignore                  # Chỉ định các file/thư mục Git bỏ qua
├── README.md                   # Hướng dẫn setup và vận hành framework
├── src/
│   ├── pages/                  # Lớp đối tượng màn hình (Page Objects)
│   │   ├── base.page.ts        # Base page chứa các hàm tương tác cơ bản
│   │   ├── login.page.ts       # Định nghĩa locator và action của trang Login
│   │   └── dashboard.page.ts   # Định nghĩa locator và action của trang Dashboard
│   ├── fixtures/               # Định nghĩa các custom fixtures của Playwright
│   │   └── base.fixture.ts     # fixture gộp tự động khởi tạo loginPage, dashboardPage
│   ├── utils/                  # Thư viện tiện ích và cấu hình
│   │   ├── env.config.ts       # Trích xuất và định kiểu các biến môi trường
│   │   └── test-data.ts        # Hàm helper sinh test data ngẫu nhiên
│   └── tests/                  # Thư mục chứa các file kiểm thử tự động
│       └── auth/
│           └── login.spec.ts   # Kịch bản kiểm thử tự động cho Login
└── .github/
    └── workflows/
        └── playwright.yml      # Cấu hình GitHub Actions CI workflow
```
