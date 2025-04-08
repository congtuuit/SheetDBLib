/**
 * SheetDBLib v1.0
 * Sử dụng Google Sheet như một cơ sở dữ liệu đơn giản
 * Author: [Your Name] - https://congtuuit.github.io
 */

/**
 * Hàm khởi tạo để gọi sử dụng thư viện
 * @returns {Object} Các hàm CRUD chính
 */
function init() {
  return getSheetDB();
}

/**
 * Trả về object chứa các hàm thao tác với SheetDB
 */
function getSheetDB() {
  return {
    createTable,  // Tạo bảng
    select,       // Truy vấn
    insert,       // Thêm
    update,       // Cập nhật
    upsert,       // Thêm hoặc cập nhật
    deleteRow     // Xoá
  };
}

/**
 * Tạo bảng mới (tạo sheet mới)
 * @param {string} tableName - Tên sheet (bảng)
 * @param {Array<string>} columns - Tên cột, không bao gồm "id" (id sẽ được thêm tự động)
 * @returns {boolean} true nếu tạo thành công, false nếu đã tồn tại
 */
function createTable(tableName, columns = []) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(tableName);
  if (sheet) return false;

  sheet = ss.insertSheet(tableName);
  const headers = columns.includes('id') ? columns : ['id', ...columns];
  sheet.appendRow(headers);
  return true;
}

/**
 * Truy vấn dữ liệu có điều kiện
 * @param {string} tableName - Tên sheet
 * @param {Object} where - Điều kiện truy vấn (giống MongoDB-style)
 * @param {Object} options - Tùy chọn (orderBy, limit)
 * @returns {Array<Object>} Mảng kết quả
 */
function select(tableName, where = {}, options = {}) {
  const sheet = getSheet(tableName);
  const [headers, ...rows] = sheet.getDataRange().getValues();

  const result = rows.map((row, idx) => toObject(headers, row, idx + 2))
    .filter(row => matchWhere(row, where));

  if (options.orderBy) {
    const key = options.orderBy;
    result.sort((a, b) => {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    });
  }

  if (options.limit) {
    return result.slice(0, options.limit);
  }

  return result;
}

/**
 * Thêm dòng mới vào bảng
 * @param {string} tableName - Tên sheet
 * @param {Object} data - Dữ liệu cần chèn, nếu không có `id` thì sẽ tự sinh
 * @returns {Object} Dữ liệu sau khi chèn (bao gồm id)
 */
function insert(tableName, data = {}) {
  const sheet = getSheet(tableName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (!data.id) data.id = generateId();

  const row = headers.map(h => data[h] || '');
  sheet.appendRow(row);
  return data;
}

/**
 * Cập nhật các dòng thỏa điều kiện
 * @param {string} tableName - Tên sheet
 * @param {Object} where - Điều kiện cập nhật
 * @param {Object} data - Trường cần cập nhật
 * @returns {number} Số dòng đã cập nhật
 */
function update(tableName, where = {}, data = {}) {
  const sheet = getSheet(tableName);
  const range = sheet.getDataRange();
  const [headers, ...rows] = range.getValues();

  let updated = 0;
  rows.forEach((row, i) => {
    const obj = toObject(headers, row, i + 2);
    if (matchWhere(obj, where)) {
      headers.forEach((h, j) => {
        if (h !== 'id' && data[h] !== undefined) {
          sheet.getRange(i + 2, j + 1).setValue(data[h]);
        }
      });
      updated++;
    }
  });
  return updated;
}

/**
 * Upsert: nếu tồn tại dòng thì cập nhật, không thì thêm mới
 * @param {string} tableName - Tên sheet
 * @param {Object} where - Điều kiện xác định dòng
 * @param {Object} data - Dữ liệu thêm hoặc cập nhật
 * @returns {number|Object} Số dòng cập nhật hoặc object mới thêm
 */
function upsert(tableName, where = {}, data = {}) {
  const found = select(tableName, where);
  if (found.length > 0) {
    return update(tableName, where, data);
  } else {
    return insert(tableName, { ...where, ...data });
  }
}

/**
 * Xoá các dòng thỏa điều kiện
 * @param {string} tableName - Tên sheet
 * @param {Object} where - Điều kiện xoá
 * @returns {number} Số dòng đã xoá
 */
function deleteRow(tableName, where = {}) {
  const sheet = getSheet(tableName);
  const range = sheet.getDataRange();
  const [headers, ...rows] = range.getValues();

  let deleted = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    const obj = toObject(headers, rows[i], i + 2);
    if (matchWhere(obj, where)) {
      sheet.deleteRow(i + 2);
      deleted++;
    }
  }
  return deleted;
}

// ========== Helpers ==========

/**
 * Lấy sheet theo tên
 * @param {string} name - Tên sheet
 * @returns {Sheet} Sheet object
 */
function getSheet(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error(`Sheet "${name}" not found.`);
  return sheet;
}

/**
 * Sinh ID duy nhất (UUID)
 * @returns {string} ID
 */
function generateId() {
  return Utilities.getUuid();
}

/**
 * Chuyển hàng thành object
 * @param {Array<string>} headers - Tên cột
 * @param {Array<any>} row - Dữ liệu
 * @param {number} rowIndex - Số thứ tự dòng
 * @returns {Object}
 */
function toObject(headers, row, rowIndex) {
  const obj = {};
  headers.forEach((h, i) => obj[h] = row[i]);
  obj._row = rowIndex; // nội bộ dùng để xác định dòng
  return obj;
}

/**
 * Kiểm tra điều kiện `where`
 * @param {Object} obj - Dòng dữ liệu
 * @param {Object} where - Điều kiện
 * @returns {boolean}
 */
// Các toán tử có thể sử dụng trong điều kiện truy vấn (where)
// {
//   // So sánh cơ bản
//   status: { $eq: "ACTIVE" },             // bằng
//   score: { $ne: 0 },                     // khác
//   age:   { $gt: 18 },                    // lớn hơn
//   age:   { $lt: 65 },                    // nhỏ hơn
//   age:   { $gte: 21 },                   // lớn hơn hoặc bằng
//   age:   { $lte: 60 },                   // nhỏ hơn hoặc bằng

//   // So sánh mảng
//   status: { $in: ["OPEN", "REVIEW"] },   // nằm trong danh sách
//   status: { $nin: ["CLOSED"] },          // không nằm trong danh sách

//   // So khớp chuỗi
//   title:       { $contains: "urgent" },     // chứa chuỗi con
//   name:        { $startsWith: "John" },     // bắt đầu bằng
//   fileName:    { $endsWith: ".pdf" },       // kết thúc bằng
//   email:       { $regex: "^[a-z]+@gmail\\.com$" }, // biểu thức chính quy

//   // Ngoài ra, hỗ trợ biểu thức chuỗi đơn giản:
//   // (nếu không muốn dùng object)
//   priority: "!= HIGH",                     // tương đương với $ne
//   score: ">= 90"                           // tương đương với $gte
// }

// const db = init();
// const results = db.select("tasks", {
//   status: { $ne: "CLOSED" },
//   priority: { $in: ["HIGH", "CRITICAL"] },
//   score: ">= 90"
// }, {
//   orderBy: "createdAt",
//   limit: 10
// });

function matchWhere(obj, where) {
  if (!where || Object.keys(where).length === 0) return true;

  for (const key in where) {
    const condition = where[key];
    const value = obj[key];

    // Nếu là object nâng cao
    if (typeof condition === 'object' && condition !== null) {
      if ('$eq' in condition && value != condition['$eq']) return false;
      if ('$ne' in condition && value == condition['$ne']) return false;
      if ('$gt' in condition && !(value > condition['$gt'])) return false;
      if ('$lt' in condition && !(value < condition['$lt'])) return false;
      if ('$gte' in condition && !(value >= condition['$gte'])) return false;
      if ('$lte' in condition && !(value <= condition['$lte'])) return false;
      if ('$in' in condition && !condition['$in'].includes(value)) return false;
      if ('$nin' in condition && condition['$nin'].includes(value)) return false;
      if ('$contains' in condition && !String(value).includes(condition['$contains'])) return false;
      if ('$startsWith' in condition && !String(value).startsWith(condition['$startsWith'])) return false;
      if ('$endsWith' in condition && !String(value).endsWith(condition['$endsWith'])) return false;
      if ('$regex' in condition && !(new RegExp(condition['$regex']).test(String(value)))) return false;
    }
    // Nếu là chuỗi có thể là biểu thức (ví dụ "!= CLOSED", ">= 90")
    else if (typeof condition === 'string' && /^[!<>=]=?|==/.test(condition)) {
      const match = condition.match(/^([!<>=]=?|==)\s*(.+)$/);
      if (!match) {
        if (value != condition) return false;
      } else {
        const [, operator, operandRaw] = match;
        const operand = isNaN(operandRaw) ? operandRaw : parseFloat(operandRaw);
        switch (operator) {
          case '==': case '=': if (value != operand) return false; break;
          case '!=': if (value == operand) return false; break;
          case '>': if (!(value > operand)) return false; break;
          case '>=': if (!(value >= operand)) return false; break;
          case '<': if (!(value < operand)) return false; break;
          case '<=': if (!(value <= operand)) return false; break;
          default: if (value != condition) return false;
        }
      }
    }
    // Trường hợp mặc định: so sánh bằng
    else {
      if (value != condition) return false;
    }
  }

  return true;
}
