const express = require('express');
const { body } = require('express-validator');
const { getAll, getById, create, update, remove } = require('../controllers/departmentController');
const { authenticate } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

const deptValidation = [
  body('name').trim().notEmpty().withMessage('Department name is required.'),
  body('description').optional().trim(),
];

router.get('/',       getAll);
router.get('/:id',    getById);
router.post('/',      deptValidation, validate, create);
router.put('/:id',    deptValidation, validate, update);
router.delete('/:id', remove);

module.exports = router;
