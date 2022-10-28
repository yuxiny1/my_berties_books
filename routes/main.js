const bcrypt = require("bcrypt");
const { application } = require("express");

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
    // execute sql query to get similar keyword books
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect("./");
      }
      let newData = Object.assign({}, shopData, { availableBooks: result });
      console.log(newData);
      res.render("list.ejs", newData);
    });
  });


  // login page to input useranme and password
  app.get("/login", function(req, res){
    res.render("login.ejs", shopData);
  });

  // verify the password and username
  app.post("/loggedin", function(req, res){

    const username= req.body.userName;
    console.log(username);
    const plainpassword= req.body.password;
    console.log(plainpassword);

    let nameCheck= false;
    let sql_nameCheck= "SELECT *FROM users";

    db.query(sql_nameCheck, (err, result) => {
      if (err) {
        res.redirect("./");
      }
      for (let i=0; i<result.length; i++){
        if (result[i].userName==username){
          nameCheck=true;
          break;
        }
      }
      if (nameCheck==false){
        res.redirect(404,"./login");
      }
      else{
        let sqlquery_username_passowrd= "SELECT PASSWORD FROM users WHERE username = '" + username + "'"; // query database to get users and password
        db.query(sqlquery_username_passowrd, (err, result) => {
          if (err) {
            res.redirect("./");
          }
          console.log(result[0].PASSWORD);
          let hashedPassword= result[0].PASSWORD;
          bcrypt.compare(plainpassword, hashedPassword, function(err, result) {
            if (result==true){
              res.send("you have successfully login !");
            }
            else{
              res.redirect(200,"./login");
            }
          });
        });
      }
    }
    );
  });

  // delete an user in the bookshop
  app.get("/deleteuser", function(req, res){
    res.render("deleteuser.ejs", shopData);
  });

  // delte the user in the databse 
  app.post("/userdeleted", function(req,res){
    
    let delteUser = req.body.userName;

    let sqlquery = "DELETE FROM users WHERE userName = ? "; 
    let sql_delete=[req.body.userName];
    // query database to get users and password
    // execute sql query
    db.query(sqlquery,sql_delete, (err, result) => {
        if(err){
            res.redirect("./");
        }else{
let nweData= Object.assign({}, shopData, {availableUsers: result});
          console.log("test1: " + nweData);
          for(let i=0; i<result.length; i++){
            if(result[i].userName==req.body.userName){
              res.send("You are deleted");
            }
          }
          console.log("test2: " +sqlquery);
          console.log("test3: " +sql_delete);

            res.send("You have successfully deleted user " + delteUser+ " from the database");
        }
    });
  });



  app.get("/register", function (req, res) {
    res.render("register.ejs", shopData);
  });

  app.post("/registered", function (req, res) {
    // saving data in database
    // using name variables to store the input data
    const saltRounds = 10;
    const plainPassword = req.body.password;
    let email = req.body.email;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let userName= req.body.userName;
    //check wether or not get those data
    console.log(email);
    console.log(firstName);
    console.log(lastName);
    console.log(plainPassword);

    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
      // query database to get all the books
      console.log(hashedPassword);

      let sqlquery =
        "INSERT INTO users (firstName, lastName, userName, emailAddress, password) VALUES ('" +
        firstName +
        "', '" +
        lastName +
        "', '" +
        userName +
        "', '"+
        email +
        "', '" +
        hashedPassword +
        "')";

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

