DROP DATABASE employeesDB;
CREATE DATABASE employeesDB;
use employeesDB;
CREATE TABLE department (
	id int auto_increment primary key,
    name varchar(30)
);

CREATE TABLE role (
	id int auto_increment primary key,
    salary decimal(8,2),
    department_id int,
    FOREIGN KEY (department_id)
		REFERENCES department(id)
        ON UPDATE SET NULL
        ON DELETE SET NULL
);

CREATE TABLE employee (
	id int auto_increment primary key,
    first_name varchar(30),
    last_name varchar(30),
    role_id int,
    manager_id int,
    foreign key (role_id) REFERENCES role(id)
    ON UPDATE SET NULL
    ON DELETE SET NULL,
    foreign key (manager_id) REFERENCES employee(id)
    ON UPDATE SET NULL
    ON DELETE SET NULL
);