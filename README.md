# 📦 SheetDBLib

**SheetDBLib** giúp bạn sử dụng **Google Sheets như một cơ sở dữ liệu**, hỗ trợ các thao tác như `select`, `insert`, `update`, `upsert`, `delete`,... với cú pháp đơn giản, tương tự như SQL hoặc MongoDB query.

---

## 🚀 Cài đặt thư viện (Import vào project Google Apps Script)

1. Mở Google Apps Script tại [https://script.google.com](https://script.google.com)
2. Vào menu **Resources → Libraries...**
3. Dán `Script ID` sau đây vào:

```
1sCtJ1RZTVI2CsI3foYFod0PiBhEdgJLl5jknAfpjGiS710rNOGSMi6AZ
```

4. Chọn phiên bản (VD: v1.0), đặt bí danh là: `SheetDB`
5. Nhấn **Add**, sau đó **Save**

---

## 🧠 Khởi tạo sử dụng

```javascript
const db = SheetDB.getSheetDB(); // Truy cập thư viện
```

---

## 📚 Các hàm hỗ trợ

### 🧱 `createTable(tableName, columns)`
Tạo mới một bảng (sheet) với tên và các cột mong muốn.

```javascript
db.createTable('tasks', ['title', 'status', 'priority']);
```

---

### ➕ `insert(tableName, data)`
Thêm mới một dòng dữ liệu. Tự động sinh `id`.

```javascript
db.insert('tasks', {
  title: 'Fix bug',
  status: 'open',
  priority: 'high'
});
```

---

### 🔍 `select(tableName, where, options)`
Lấy danh sách dòng phù hợp với điều kiện.

```javascript
const results = db.select('tasks', {
  status: { $ne: 'done' },
  priority: 'high'
}, {
  orderBy: 'priority',
  limit: 10
});
```

---

### 🔁 `update(tableName, where, data)`
Cập nhật dòng phù hợp với điều kiện.

```javascript
db.update('tasks', { status: 'open' }, { status: 'in progress' });
```

---

### 🔃 `upsert(tableName, where, data)`
Cập nhật nếu tồn tại, không thì thêm mới.

```javascript
db.upsert('tasks', { title: 'New Task' }, { status: 'open', priority: 'low' });
```

---

### ❌ `deleteRow(tableName, where)`
Xoá dòng phù hợp với điều kiện.

```javascript
db.deleteRow('tasks', { status: 'archived' });
```

---

## 🔧 Các toán tử điều kiện (`where`)

| Toán tử       | Mô tả                           | Ví dụ                                           |
|---------------|----------------------------------|--------------------------------------------------|
| `$eq`         | Bằng                             | `{ status: { $eq: 'open' } }`                   |
| `$ne`         | Khác                             | `{ status: { $ne: 'closed' } }`                 |
| `$gt`         | Lớn hơn                          | `{ score: { $gt: 5 } }`                         |
| `$lt`         | Nhỏ hơn                          | `{ score: { $lt: 10 } }`                        |
| `$gte`        | Lớn hơn hoặc bằng                | `{ score: { $gte: 3 } }`                        |
| `$lte`        | Nhỏ hơn hoặc bằng                | `{ score: { $lte: 9 } }`                        |
| `$in`         | Thuộc trong danh sách            | `{ status: { $in: ['open', 'pending'] } }`     |
| `$nin`        | Không thuộc danh sách            | `{ status: { $nin: ['archived'] } }`           |
| `$contains`   | Chuỗi chứa                       | `{ title: { $contains: 'bug' } }`              |
| `$startsWith` | Bắt đầu bằng chuỗi               | `{ title: { $startsWith: 'Fix' } }`            |
| `$endsWith`   | Kết thúc bằng chuỗi              | `{ title: { $endsWith: 'error' } }`            |
| `$regex`      | Biểu thức chính quy (regex)      | `{ title: { $regex: '^Bug.*Fix$' } }`          |

---

## 📘 Ví dụ tổng hợp

```javascript
const db = SheetDB.getSheetDB();

db.createTable('users', ['name', 'email', 'status']);

db.insert('users', { name: 'Alice', email: 'alice@example.com', status: 'active' });

const activeUsers = db.select('users', { status: 'active' });

db.update('users', { email: 'alice@example.com' }, { status: 'inactive' });

db.deleteRow('users', { name: { $startsWith: 'A' } });
```

---

## 📄 License

MIT License © [tu.van]
