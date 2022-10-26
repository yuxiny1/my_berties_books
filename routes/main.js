const bcrypt = require("bcrypt");

module.exports = function (app, shopData) {
  // Handle our routes
  app.get("/", function (req, res) {
    res.render("index.ejs", shopData);
  });
  app.get("/about", function (req, res) {
    res.render("about.ejs", shopData);
  });

  app.get("/search", function (req, res) {
    res.render("search.ejs", shopData);
  });
  app.get("/search-result", function (req, res) {
    //searching in the database
    //res.send("You searched for: " + req.query.keyword);

    let sqlquery =
      "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the books
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

  app.get("/register", function (req, res) {
    res.render("register.ejs", shopData);
  });

  app.post("/registered", function (req, res) {
    // saving data in database

    const saltRounds = 10;
    const plainPassword = req.body.password;

    //   var  password=req.body.password;
    let email = req.body.email;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;

    console.log(email);
    console.log(firstName);
    console.log(lastName);
    console.log(plainPassword);

    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
      // query database to get all the books
      console.log(hashedPassword);
      let sqlquery =
        "INSERT INTO users (firstName, lastName, emailAddress, password) VALUES ('" +
        firstName +
        "', '" +
        lastName +
        "', '" +
        email +
        "', '" +
        hashedPassword +
        "')";

      // query database to get all the books
      //         let sqlQuery = "INSERT INTO users(User_ID, lastName,firstName,emailAddress,username,password) VALUES(''),('"+req.body.lastName+"'),('"+req.body.firstName+"')('"+req.body.email+"'),('"+req.body.username+"'),('"+req.body.password+"');"  + req.body.

      let newUserRecord = [req.body.appuser, hashedPassword];
      console.log(sqlquery);
      db.query(sqlquery, newUserRecord, (err, result) => {
        if (err) {
          return console.error(err.message);
        } else {
          res.send(
            "You have successfully registered. Please <a href='/login'>login</a> to continue."

                 +
              firstName +
              "password" +
              hashedPassword
              //req.body.hashedPassword
          );
        }
        //store hashed password in your databse
      });
    });

  });

  app.get("/list", function (req, res) {
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

  app.get("/listusers",function(req,res){
    let sqlquery = "SELECT * FROM users"; // query database to get all the users
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

  app.get("/addbook", function (req, res) {
    res.render("addbook.ejs", shopData);
  });

  app.post("/bookadded", function (req, res) {
    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    // execute sql query
    let newrecord = [req.body.name, req.body.price];
    db.query(sqlquery, newrecord, (err, result) => {
      if (err) {
        return console.error(err.message);
      } else
        res.send(
          " This book is added to database, name: " +
            req.body.name +
            " price " +
            req.body.price
        );
    });
  });

  app.get("/bargainbooks", function (req, res) {
    let sqlquery = "SELECT * FROM books WHERE price < 20";
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect("./");
      }
      let newData = Object.assign({}, shopData, { availableBooks: result });
      console.log(newData);
      res.render("bargains.ejs", newData);
    });
  });
};
