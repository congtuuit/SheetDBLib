
# 📦 SheetDBLib

**SheetDBLib** helps you use **Google Sheets as a simple database**, supporting operations like `select`, `insert`, `update`, `upsert`, `delete`, etc., with a simple syntax inspired by SQL or MongoDB query.

---

## 🚀 Install the library (Import into Google Apps Script project)

1. Open Google Apps Script at [https://script.google.com](https://script.google.com)
2. Go to menu **Resources → Libraries...**
3. Paste the following `Script ID`:

```
<YOUR_SCRIPT_ID_HERE>
```

4. Choose a version (e.g., v1.0), set alias to: `SheetDB`
5. Click **Add**, then **Save**

---

## 🧠 Initialize usage

```javascript
const db = SheetDB.getSheetDB(); // Access the library
```

---

## 📚 Available Functions

### 🧱 `createTable(tableName, columns)`
Create a new table (sheet) with a given name and columns.

```javascript
db.createTable('tasks', ['title', 'status', 'priority']);
```

---

### ➕ `insert(tableName, data)`
Insert a new row. Auto-generates `id`.

```javascript
db.insert('tasks', {
  title: 'Fix bug',
  status: 'open',
  priority: 'high'
});
```

---

### 🔍 `select(tableName, where, options)`
Select rows matching the conditions.

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
Update existing rows matching the condition.

```javascript
db.update('tasks', { status: 'open' }, { status: 'in progress' });
```

---

### 🔃 `upsert(tableName, where, data)`
Update if found, otherwise insert.

```javascript
db.upsert('tasks', { title: 'New Task' }, { status: 'open', priority: 'low' });
```

---

### ❌ `deleteRow(tableName, where)`
Delete rows matching the condition.

```javascript
db.deleteRow('tasks', { status: 'archived' });
```

---

## 🔧 Query Operators (`where`)

| Operator       | Description                     | Example                                           |
|----------------|----------------------------------|--------------------------------------------------|
| `$eq`          | Equal                            | `{ status: { $eq: 'open' } }`                   |
| `$ne`          | Not equal                        | `{ status: { $ne: 'closed' } }`                 |
| `$gt`          | Greater than                     | `{ score: { $gt: 5 } }`                         |
| `$lt`          | Less than                        | `{ score: { $lt: 10 } }`                        |
| `$gte`         | Greater than or equal            | `{ score: { $gte: 3 } }`                        |
| `$lte`         | Less than or equal               | `{ score: { $lte: 9 } }`                        |
| `$in`          | In list                          | `{ status: { $in: ['open', 'pending'] } }`     |
| `$nin`         | Not in list                      | `{ status: { $nin: ['archived'] } }`           |
| `$contains`    | Contains substring               | `{ title: { $contains: 'bug' } }`              |
| `$startsWith`  | Starts with substring            | `{ title: { $startsWith: 'Fix' } }`            |
| `$endsWith`    | Ends with substring              | `{ title: { $endsWith: 'error' } }`            |
| `$regex`       | Regular expression               | `{ title: { $regex: '^Bug.*Fix$' } }`          |

---

## 📘 Sample Usage

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
