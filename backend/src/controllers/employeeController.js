const { pool } = require('../database/db');
const path = require('path');
const fs   = require('fs');

async function generateEmployeeId() {
  const [rows] = await pool.query(
    "SELECT employee_id FROM employees ORDER BY id DESC LIMIT 1"
  );
  if (rows.length === 0) return 'EMP001';
  const last = rows[0].employee_id;
  const num  = parseInt(last.replace(/\D/g, ''), 10) + 1;
  return 'EMP' + String(num).padStart(3, '0');
}

const BASE_SELECT = `
  SELECT e.*,
         d.name  AS department_name,
         r.title AS role_title
  FROM   employees e
  LEFT   JOIN departments d ON d.id = e.department_id
  LEFT   JOIN roles       r ON r.id = e.role_id
`;

const getAll = async (req, res, next) => {
  try {
    const {
      search       = '',
      department   = '',
      role         = '',
      status       = '',
      sortBy       = 'e.created_at',
      sortOrder    = 'DESC',
      page         = 1,
      limit        = 10,
    } = req.query;

    const allowedSort = {
      first_name:      'e.first_name',
      last_name:       'e.last_name',
      salary:          'e.salary',
      date_of_joining: 'e.date_of_joining',
      created_at:      'e.created_at',
      employee_id:     'e.employee_id',
    };

    const orderCol = allowedSort[sortBy] || 'e.created_at';
    const orderDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const conditions = [];
    const params     = [];

    if (search) {
      conditions.push(`(
        e.first_name  LIKE ? OR e.last_name    LIKE ? OR
        e.email       LIKE ? OR e.employee_id  LIKE ? OR
        e.phone       LIKE ?
      )`);
      const like = `%${search}%`;
      params.push(like, like, like, like, like);
    }
    if (department) { conditions.push('e.department_id = ?'); params.push(department); }
    if (role)       { conditions.push('e.role_id = ?');       params.push(role);       }
    if (status)     { conditions.push('e.status = ?');        params.push(status);     }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM employees e ${where}`,
      params
    );

    const offset   = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const pageSize = parseInt(limit, 10);

    const [rows] = await pool.query(
      `${BASE_SELECT} ${where} ORDER BY ${orderCol} ${orderDir} LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page:       parseInt(page, 10),
        limit:      pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `${BASE_SELECT} WHERE e.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const {
      first_name, last_name, email, phone,
      department_id, role_id, salary, date_of_joining,
      address, status = 'active',
    } = req.body;

    const employee_id = await generateEmployeeId();
    const photo       = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO employees
         (employee_id, first_name, last_name, email, phone,
          department_id, role_id, salary, date_of_joining, address, status, photo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, first_name, last_name, email, phone || null,
       department_id || null, role_id || null, salary, date_of_joining,
       address || null, status, photo]
    );

    const [created] = await pool.query(`${BASE_SELECT} WHERE e.id = ?`, [result.insertId]);
    res.status(201).json({ success: true, message: 'Employee created.', data: created[0] });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const [existing] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const {
      first_name, last_name, email, phone,
      department_id, role_id, salary, date_of_joining,
      address, status,
    } = req.body;

    let photo = existing[0].photo;
    if (req.file) {
      if (photo) {
        const oldPath = path.join(__dirname, '../../uploads', path.basename(photo));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      photo = `/uploads/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE employees SET
         first_name = ?, last_name = ?, email = ?, phone = ?,
         department_id = ?, role_id = ?, salary = ?, date_of_joining = ?,
         address = ?, status = ?, photo = ?
       WHERE id = ?`,
      [first_name, last_name, email, phone || null,
       department_id || null, role_id || null, salary, date_of_joining,
       address || null, status, photo, req.params.id]
    );

    const [updated] = await pool.query(`${BASE_SELECT} WHERE e.id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Employee updated.', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const [existing] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (existing[0].photo) {
      const photoPath = path.join(__dirname, '../../uploads', path.basename(existing[0].photo));
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Employee deleted.' });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const [[totals]] = await pool.query(`
      SELECT
        COUNT(*)                                        AS total_employees,
        SUM(status = 'active')                          AS active_employees,
        SUM(status = 'inactive')                        AS inactive_employees,
        ROUND(AVG(salary), 2)                           AS avg_salary,
        (SELECT COUNT(*) FROM departments)              AS total_departments,
        (SELECT COUNT(*) FROM roles)                    AS total_roles
      FROM employees
    `);

    const [byDept] = await pool.query(`
      SELECT d.name AS department, COUNT(e.id) AS count
      FROM   departments d
      LEFT   JOIN employees e ON e.department_id = d.id
      GROUP  BY d.id
      ORDER  BY count DESC
    `);

    const [recent] = await pool.query(`
      ${BASE_SELECT}
      ORDER BY e.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: { totals, byDepartment: byDept, recentEmployees: recent },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove, getStats };
