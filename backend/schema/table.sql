
-- Super Admin Table
CREATE TABLE super_admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Companies Table
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    number VARCHAR(20),
    address VARCHAR(255)
);

-- Vendors Table
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    number VARCHAR(20),
    package_type ENUM('normal','medium','hight') DEFAULT 'normal',

    FOREIGN KEY (company_id) REFERENCES companies(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE membership_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    name VARCHAR(100),
    duration VARCHAR(100),
    price DECIMAL(10,2),
   FOREIGN KEY (company_id) REFERENCES companies(id)
ON DELETE CASCADE
ON UPDATE CASCADE;
);
CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    gender ENUM('male','female','other'),
    age VARCHAR(10),
    address TEXT,
    join_date DATE,
    status ENUM('active','inactive') DEFAULT 'active',
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ALTER TABLE members ADD COLUMN schedule_id INT;
ALTER TABLE members ADD CONSTRAINT fk_members_schedule
FOREIGN KEY (schedule_id) REFERENCES member_schedules(id);
);
CREATE TABLE member_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    member_id INT,
    start_time TIME,
    end_time TIME,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
);