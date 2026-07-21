const express = require('express');
const { body } = require('express-validator');
const { getAll, getById, create, update, remove } = require('../controllers/roleController');
const { authenticate } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

const roleValidation = [
  body('title').trim().notEmpty().withMessage('Role title is required.'),
  body('description').optional().trim(),
  body('department_id').optional().isInt().withMessage('department_id must be an integer.'),
];

router.get('/',       getAll);
router.get('/:id',    getById);
router.post('/',      roleValidation, validate, create);
router.put('/:id',    roleValidation, validate, update);
router.delete('/:id', remove);

module.exports = router;
