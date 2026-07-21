const { pool } = require('../database/db');

const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*,
             COUNT(e.id) AS employee_count
      FROM   departments d
      LEFT   JOIN employees e ON e.department_id = d.id
      GROUP  BY d.id
      ORDER  BY d.name ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, COUNT(e.id) AS employee_count
       FROM   departments d
       LEFT   JOIN employees e ON e.department_id = d.id
       WHERE  d.id = ?
       GROUP  BY d.id`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    const [created] = await pool.query('SELECT * FROM departments WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Department created.', data: created[0] });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, description, is_active } = req.body;
    const [existing] = await pool.query('SELECT id FROM departments WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    await pool.query(
      'UPDATE departments SET name = ?, description = ?, is_active = ? WHERE id = ?',
      [name, description || null, is_active !== undefined ? is_active : 1, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Department updated.', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const [existing] = await pool.query('SELECT id FROM departments WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const [empCount] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM employees WHERE department_id = ?',
      [req.params.id]
    );
    if (empCount[0].cnt > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete: ${empCount[0].cnt} employee(s) are assigned to this department.`,
      });
    }

    await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Department deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
