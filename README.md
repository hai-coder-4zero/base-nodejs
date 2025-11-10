## 🚀 Cài đặt và chạy

```bash
# Install dependencies
npm install

# Copy .env.example to .env
cp .env.example .env

# Cập nhật thông tin database trong file .env
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=mydb
# DB_PORT=3306

# Tạo database và table (chạy file SQL)
mysql -u root -p < schema.sql

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## 🔌 Test API với các endpoint

```bash
# Get all users
curl http://localhost:3000/api/users

# Get user by ID
curl http://localhost:3000/api/users/1

# Create new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'

# Update user
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"John Updated","email":"john.updated@example.com"}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/1
```

## 📌 Lưu ý quan trọng

1. **`"type": "module"`** trong package.json để sử dụng ES6 import/export
2. **File extension `.js`** bắt buộc khi import trong ES6 modules
3. **`__dirname` và `__filename`** không có sẵn trong ES6 modules, cần tạo thủ công nếu cần
4. Cấu trúc tuân theo pattern **MVC** và **separation of concerns**
5. Middleware xử lý authentication, validation và error handling riêng biệt
6. **MySQL2**: Sử dụng Promise-based API để làm việc với async/await
7. **Connection Pool**: Tối ưu performance với connection pooling
8. **Prepared Statements**: Tránh SQL Injection với parameterized queries

## 🛡️ Security Best Practices

- ✅ Sử dụng prepared statements (?) để chống SQL Injection
- ✅ Validate input với Joi trước khi query database
- ✅ Hash password nếu có thêm authentication
- ✅ Giới hạn connection pool để tránh exhaust database
- ✅ Error handling đầy đủ cho database operations
