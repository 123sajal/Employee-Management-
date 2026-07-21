const express = require('express');
const { body } = require('express-validator');
const multer   = require('multer');
const path     = require('path');
const { getAll, getById, create, update, remove, getStats } = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `emp_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed.'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticate);

const empValidation = [
  body('first_name').trim().notEmpty().withMessage('First name is required.'),
  body('last_name').trim().notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('salary').isNumeric().withMessage('Salary must be a number.'),
  body('date_of_joining').isISO8601().withMessage('Valid date is required (YYYY-MM-DD).'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive.'),
];

router.get('/stats', getStats);
router.get('/',      getAll);
router.get('/:id',   getById);
router.post('/',     upload.single('photo'), empValidation, validate, create);
router.put('/:id',   upload.single('photo'), empValidation, validate, update);
router.delete('/:id', remove);

module.exports = router;
