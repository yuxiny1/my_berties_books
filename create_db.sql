CREATE DATABASE myBookshop;
USE myBookshop;
CREATE TABLE books (id INT AUTO_INCREMENT,name VARCHAR(50),price DECIMAL(5, 2) unsigned,PRIMARY KEY(id));
INSERT INTO books (name, price)VALUES('database book', 40.25),('Node.js book', 25.00), ('Express book', 31.99) ;
CREATE TABLE users( User_ID int(50) NOT NULL, LastName varchar(50) NOT NULL, firstName varchar(50) NOT NULL, emailAddress varchar(50) NOT NULL, username varchar(50)NOT NULL , password varchar(50) NOT NULL, PRIMARY KEY(User_ID));

CREATE USER 'appuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';
GRANT ALL PRIVILEGES ON myBookshop.* TO 'appuser'@'localhost';