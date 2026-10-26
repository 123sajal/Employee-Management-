INSERT IGNORE INTO users (username, email, password, role) VALUES
INSERT IGNORE INTO departments (name, description) VALUES
INSERT IGNORE INTO roles (title, description, department_id) VALUES
INSERT IGNORE INTO employees (employee_id, first_name, ...

CREATE TABLE IF NOT EXISTS users (
  id         INT          NOT NULL AUTO_INCREMENT,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('admin','manager') NOT NULL DEFAULT 'admin',
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS departments (
  id          INT          NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_dept_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roles (
  id            INT          NOT NULL AUTO_INCREMENT,
  title         VARCHAR(100) NOT NULL UNIQUE,
  description   TEXT,
  department_id INT,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_roles_dept FOREIGN KEY (department_id)
    REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_roles_title (title)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employees (
  id              INT           NOT NULL AUTO_INCREMENT,
  employee_id     VARCHAR(20)   NOT NULL UNIQUE,
  first_name      VARCHAR(50)   NOT NULL,
  last_name       VARCHAR(50)   NOT NULL,
  email           VARCHAR(100)  NOT NULL UNIQUE,
  phone           VARCHAR(20),
  department_id   INT,
  role_id         INT,
  salary          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  date_of_joining DATE          NOT NULL,
  address         TEXT,
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
  photo           VARCHAR(255),
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_emp_dept FOREIGN KEY (department_id)
    REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_emp_role FOREIGN KEY (role_id)
    REFERENCES roles(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_emp_email  (email),
  INDEX idx_emp_status (status),
  INDEX idx_emp_dept   (department_id),
  INDEX idx_emp_role   (role_id)
) ENGINE=InnoDB;

INSERT INTO users (username, email, password, role) VALUES
('admin',   'admin@ems.com',   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/lSOwX5M6y', 'admin'),
('manager', 'manager@ems.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/lSOwX5M6y', 'manager');

INSERT INTO departments (name, description) VALUES
('Engineering',      'Software development and infrastructure'),
('Human Resources',  'Employee management and recruitment'),
('Finance',          'Accounting, payroll and financial planning'),
('Marketing',        'Brand management and digital marketing'),
('Sales',            'Business development and customer relations'),
('Operations',       'Day-to-day business operations'),
('Design',           'UI/UX and graphic design'),
('Customer Support', 'Client support and success');

INSERT INTO roles (title, description, department_id) VALUES
('Software Engineer',        'Develops and maintains software applications',   1),
('Senior Software Engineer', 'Leads software design and architecture',         1),
('DevOps Engineer',          'Manages CI/CD pipelines and infrastructure',     1),
('HR Manager',               'Manages HR processes and team',                  2),
('HR Executive',             'Handles recruitment and onboarding',             2),
('Finance Manager',          'Oversees financial operations',                  3),
('Accountant',               'Manages accounts and bookkeeping',               3),
('Marketing Manager',        'Plans and executes marketing strategy',          4),
('Digital Marketing Exec',   'Handles social media and digital campaigns',     4),
('Sales Manager',            'Leads the sales team',                           5),
('Sales Executive',          'Manages client accounts and new sales',          5),
('Operations Manager',       'Oversees operational workflows',                 6),
('UI/UX Designer',           'Designs user interfaces and experiences',        7),
('Support Engineer',         'Provides technical support to clients',          8);

INSERT INTO employees (employee_id, first_name, last_name, email, phone, department_id, role_id, salary, date_of_joining, address, status) VALUES
('EMP001', 'Alice',  'Johnson', 'alice.johnson@ems.com',  '555-0101', 1, 2,  105000.00, '2021-03-15', '123 Maple St, New York, NY 10001',         'active'),
('EMP002', 'Bob',    'Smith',   'bob.smith@ems.com',      '555-0102', 1, 1,   85000.00, '2022-01-10', '456 Oak Ave, Los Angeles, CA 90001',       'active'),
('EMP003', 'Carol',  'White',   'carol.white@ems.com',    '555-0103', 2, 4,   90000.00, '2020-07-20', '789 Pine Rd, Chicago, IL 60601',           'active'),
('EMP004', 'David',  'Brown',   'david.brown@ems.com',    '555-0104', 3, 6,   95000.00, '2019-11-05', '321 Elm St, Houston, TX 77001',            'active'),
('EMP005', 'Eva',    'Davis',   'eva.davis@ems.com',      '555-0105', 4, 8,   88000.00, '2022-06-01', '654 Cedar Ln, Phoenix, AZ 85001',          'active'),
('EMP006', 'Frank',  'Miller',  'frank.miller@ems.com',   '555-0106', 5, 10,  80000.00, '2021-09-15', '987 Birch Blvd, Philadelphia, PA 19101',   'active'),
('EMP007', 'Grace',  'Wilson',  'grace.wilson@ems.com',   '555-0107', 7, 13,  78000.00, '2023-02-20', '159 Walnut St, San Antonio, TX 78201',     'active'),
('EMP008', 'Henry',  'Moore',   'henry.moore@ems.com',    '555-0108', 1, 3,   92000.00, '2020-04-10', '753 Spruce Dr, San Diego, CA 92101',       'active'),
('EMP009', 'Iris',   'Taylor',  'iris.taylor@ems.com',    '555-0109', 2, 5,   65000.00, '2023-08-01', '246 Chestnut Ct, Dallas, TX 75201',        'active'),
('EMP010', 'Jack',   'Anderson','jack.anderson@ems.com',  '555-0110', 3, 7,   70000.00, '2022-11-15', '135 Poplar Way, San Jose, CA 95101',       'active'),
('EMP011', 'Karen',  'Thomas',  'karen.thomas@ems.com',   '555-0111', 4, 9,   72000.00, '2021-05-30', '864 Ash St, Austin, TX 78701',             'active'),
('EMP012', 'Leo',    'Jackson', 'leo.jackson@ems.com',    '555-0112', 5, 11,  68000.00, '2022-03-22', '579 Magnolia Ave, Jacksonville, FL 32201', 'inactive'),
('EMP013', 'Mia',    'Harris',  'mia.harris@ems.com',     '555-0113', 6, 12,  82000.00, '2020-10-18', '426 Willow Rd, San Francisco, CA 94101',   'active'),
('EMP014', 'Noah',   'Martin',  'noah.martin@ems.com',    '555-0114', 8, 14,  60000.00, '2023-01-09', '317 Hickory Ln, Columbus, OH 43201',       'active'),
('EMP015', 'Olivia', 'Garcia',  'olivia.garcia@ems.com',  '555-0115', 1, 1,   87000.00, '2022-07-14', '208 Sycamore Blvd, Charlotte, NC 28201',   'active');
