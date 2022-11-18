module.exports = function (app, shopData) {
  const bcrypt = require("bcrypt");
  const { application } = require("express");
  const { check, validationResult } = require("express-validator");

  // GET route for the home page
  const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
      //res.redirect("/login");
      res.redirect("https://www.doc.gold.ac.uk/usr/666/login");
    } else {
      next();
    }
  };

  function afterLogin(message, url) {
    // this function is used to redirect the user to the login page after a successful login
    let msg =
      "<script>alert('" +
      message +
      "');window.location.href='https://www.doc.gold.ac.uk/usr/666/" +
      url +
      "';</script>";
    // another local version should be ./
    return msg;
  }

  // Handle our routes
  app.get("/", function (req, res) {
    res.render("index.ejs", shopData);
  });
  // GET route for the login page
  app.get("/about", function (req, res) {
    res.render("about.ejs", shopData);
  });

  // GET route for the login page
  app.get("/search", redirectLogin, function (req, res) {
    res.render("search.ejs", shopData);
  });

  app.get("/search-result", function (req, res) {
    //searching in the database
    //res.send("You searched for: " + req.query.keyword);
    let keyword = req.sanitize(req.body.keyword);
    let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + keyword + "%'"; // query database to get all the books
    // execute sql query to get similar keyword books
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect("./");
      }
      // get the books from the database
      let newData = Object.assign({}, shopData, { availableBooks: result });
      console.log(newData);
      res.render("list.ejs", newData);
    });
  });

  // login page to input useranme and password
  app.get("/login", function (req, res) {
    res.render("login.ejs", shopData);
  });

  // login page to input useranme and password
  app.post("/loggedin", function (req, res) {
    //sanitize the input
    let username = req.sanitize(req.body.userName);
    let password = req.sanitize(req.body.password);
    if (username == "" || password == "") {
      console.log("Empty fields");
      res.send("Please enter a valid username and password");
    } else {
      // check if the username exists in the database
      let sqlquery = "SELECT *FROM users WHERE username =? ";
      let sql_v = [username];
      db.query(sqlquery, sql_v, (err, result) => {
        if (err) {
          console.log("not getting the username from our database");
          res.redirect("./");
        } else {
          let checkUsername = false;
          let index = 0;
          for (let i = 0; i < result.length; ++i) {
            console.log(result);
            // check if the username exists in the database
            if (result[i].userName == username) {
              checkUsername = true;
              index = i;
              break;
            }
          }
          if (checkUsername) {
            // check if the password is correct
            const plainpassword = password;
            const hashedPassword = result[0].password;
            console.log(plainpassword);
            console.log(hashedPassword);
            bcrypt.compare(
              plainpassword,
              hashedPassword,
              function (err, result) {
                if (err) {
                  console.log(err);
                  res.redirect("./loggedin");
                } else {
                  if (result == true) {
                    // if the password is correct, redirect to the the page
                    // pass the santized username to the session
                    req.session.userId = sql_v;
                    let msg = "you are successfully logged in";
                    res.send(afterLogin(msg, "about"));
                  }
                }
              }
            );
          }
        }
      });
    }
  });

  // delete an user in the bookshop
  app.get("/deleteuser", redirectLogin, function (req, res) {
    res.render("deleteuser.ejs", shopData);
  });

  // delte the user in the databse
  app.post("/userdeleted", function (req, res) {
    let delteUser = req.body.userName;
    let sqlquery = "DELETE FROM users WHERE userName = ? ";
    let sql_delete = [req.body.userName];
    // query database to get users and password
    // execute sql query
    db.query(sqlquery, sql_delete, (err, result) => {
      if (err) {
        console.log("Error deleting user from database");
        res.redirect("./");
      } else {
        // if the user is deleted, redirect to the login page
        let nweData = Object.assign({}, shopData, { availableUsers: result });
        console.log("test1: " + nweData);
        console.log("test2: " + sqlquery);
        console.log("test3: " + sql_delete);
        //check if the user exist
        if (result.affectedRows == 0) {
          console.log("user doesnot exist");
          res.send(
            "Please reenter an exist username, " +
              delteUser +
              " does not exist or you could sign up with us"
          );
        } else {
          console.log(" user: " + delteUser + " is deleted");
          res.send(
            "You have successfully deleted user " +
              delteUser +
              " from the database"
          );
        }
      }
    });
  });

  // GET route for the register page
  app.get("/register", function (req, res) {
    res.render("register.ejs", shopData);
  });

  // POST route for the register page, validate the input and add the user to the database
  app.post(
    "/registered",
    [check("email").isEmail().withMessage("Invalid email")],
    [check("userName").isLength({ min: 5 }).withMessage("Username too short")],
    [check("password").isLength({ min: 5 })],
    function (req, res) {
      // saving data in database
      // using name variables to store the input data
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.redirect("./register");
      } else {
        // sanitize the input
        let email = req.sanitize(req.body.email);
        let firstName = req.sanitize(req.body.firstName);
        let lastName = req.sanitize(req.body.lastName);
        let userName = req.sanitize(req.body.userName);
        let password = req.sanitize(req.body.password);
        if (
          firstName == "" ||
          lastName == "" ||
          userName == "" ||
          password == "" ||
          email == ""
        ) {
          res.send("Please fill the register form all ");
        } else {
          let sqlQueryRegister =
            "SELECT * FROM users WHERE userName = '" +
            req.body.userName +
            "' OR emailAddress='" +
            email +
            "'";
    // query database to get users and password
          db.query(sqlQueryRegister, (err, result) => {
            if (result.length == 0) {
              const saltRounds = 10;
              const plainPassword = req.body.password;
              // hash the password
              bcrypt.hash(
                plainPassword,
                saltRounds,
                function (err, hashedPassword) {
                  if (err) {
                    console.log(err);
                    res.redirect("/");
                  }
                  let sqlquery =
                    "INSERT INTO users (firstName, lastName, userName, emailAddress, password) VALUES ('" +
                    firstName +
                    "', '" +
                    lastName +
                    "', '" +
                    userName +
                    "', '" +
                    email +
                    "', '" +
                    hashedPassword +
                    "')";
                  db.query(sqlquery, (err, result) => {
                    if (err) {
                      console.log("error inserting into database");
                      res.redirect("./");
                    }
                    console.log(
                      "New registered user info are inserted into databse"
                    );
                    result =
                      "Hello " +
                      req.body.firstName +
                      " " +
                      req.body.lastName +
                      " you are registered";
                    res.send(result);
                  });
                }
              );
            } else {
              console.log(" user or email already exists");
              res.send(
                "useranme or email address alread exists, please enter a valid username and email address"
              );
            }
          });
        }
      }
    }
  );
    // GET route for the list page
  app.get("/list", redirectLogin, function (req, res) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books

    // execute sql query
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect("./");
      }
      let newData = Object.assign({}, shopData, { availableBooks: result });
      console.log(newData);
      res.render("list.ejs", newData);
    });
  });

  // GET route for the list users page
  app.get("/listusers", redirectLogin, function (req, res) {
    // query database to get all the users' username
    let sqlquery = "SELECT * FROM users";
    // execute sql query
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect("./");
      }
      let newData = Object.assign({}, shopData, { availableUsers: result });
      console.log(newData);
      res.render("listusers.ejs", newData);
    });
  });

    // GET route for the add book page
  app.get("/addbook", redirectLogin, function (req, res) {
    res.render("addbook.ejs", shopData);
  });

  // POST route for the add book page, validate the input and add the book to the database
  app.post("/bookadded", function (req, res) {
    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    // execute sql query
    let price = req.sanitize(req.body.price);
    let name = req.sanitize(req.body.name);
    let newrecord = [name, price];
    db.query(sqlquery, newrecord, (err, result) => {
      if (err) {
        return console.error(err.message);
      } else
        res.send(
          " This book is added to database, name: " + name + " price " + price
        );
    });
  });

  // GET route for the bargain books page
  app.get("/bargainbooks", redirectLogin, function (req, res) {
    let sqlquery = "SELECT * FROM books WHERE price < 20";
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect("./");
      }
      // get the data from the database and pass it to the bargainbooks.ejs
      let newData = Object.assign({}, shopData, { availableBooks: result });
      console.log(newData);
      res.render("bargains.ejs", newData);
    });
  });

  // GET route for the logout page and redirect to the login page
  app.get("/logout", redirectLogin, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        res.send("You are logged out");
      }
    });
  });
};
