const { pool } = require('../database/db');

const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*,
             d.name        AS department_name,
             COUNT(e.id)   AS employee_count
      FROM   roles r
      LEFT   JOIN departments d ON d.id = r.department_id
      LEFT   JOIN employees   e ON e.role_id = r.id
      GROUP  BY r.id
      ORDER  BY r.title ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, d.name AS department_name, COUNT(e.id) AS employee_count
       FROM   roles r
       LEFT   JOIN departments d ON d.id = r.department_id
       LEFT   JOIN employees   e ON e.role_id = r.id
       WHERE  r.id = ?
       GROUP  BY r.id`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, description, department_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO roles (title, description, department_id) VALUES (?, ?, ?)',
      [title, description || null, department_id || null]
    );
    const [created] = await pool.query(
      `SELECT r.*, d.name AS department_name FROM roles r
       LEFT JOIN departments d ON d.id = r.department_id
       WHERE r.id = ?`,
      [result.insertId]
    );
    res.status(201).json({ success: true, message: 'Role created.', data: created[0] });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { title, description, department_id, is_active } = req.body;
    const [existing] = await pool.query('SELECT id FROM roles WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }

    await pool.query(
      'UPDATE roles SET title = ?, description = ?, department_id = ?, is_active = ? WHERE id = ?',
      [title, description || null, department_id || null, is_active !== undefined ? is_active : 1, req.params.id]
    );
    const [updated] = await pool.query(
      `SELECT r.*, d.name AS department_name FROM roles r
       LEFT JOIN departments d ON d.id = r.department_id
       WHERE r.id = ?`,
      [req.params.id]
    );
    res.json({ success: true, message: 'Role updated.', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const [existing] = await pool.query('SELECT id FROM roles WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }

    const [empCount] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM employees WHERE role_id = ?',
      [req.params.id]
    );
    if (empCount[0].cnt > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete: ${empCount[0].cnt} employee(s) hold this role.`,
      });
    }

    await pool.query('DELETE FROM roles WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Role deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
