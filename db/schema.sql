-- DROP DATABASE
DROP DATABASE IF EXISTS developer_cms;

-- CREATE DATABASE
CREATE DATABASE developer_cms;

USE developer_cms;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(30),
    password VARCHAR(60)
);
