show databases;
use myBookshop;
show tables;

DROP TABLE books;
DROP TABLE USERS;

CREATE TABLE books (id INT AUTO_INCREMENT,name VARCHAR(50),price DECIMAL(5, 2) unsigned,PRIMARY KEY(id));
INSERT INTO books (name, price)VALUES('database book', 40.25),('Node.js book', 25.00), ('Express book', 31.99) ;
CREATE TABLE users(firstName varchar(100) NOT NULL, lastName varchar(100) NOT NULL, userName varchar(255) NOT NULL unique, emailAddress varchar(255) NOT NULL, password varchar(255) NOT NULL, PRIMARY KEY(userName));

CREATE USER 'appuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';
GRANT ALL PRIVILEGES ON myBookshop.* TO 'appuser'@'localhost';