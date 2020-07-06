//Loads the express module
const express = require("express");
let path = require("path");
let bodyParser = require("body-parser");
let fs = require("fs");
//Creates our express server
const app = express();
const port = 3000;
let accntNo = 12345678;

//Loads the handlebars module
const exphbs = require("express-handlebars");

app.engine("hbs", exphbs());
app.set("view engine", "hbs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Serves static files (we need it to import a css file)
app.use(express.static(__dirname + "/public"));

//Sets a basic route
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/home", (req, res) => {
  if (req.query.accountType == "saving") {
    res.render("home", {
      username: req.query.username,
      savingAccountNumber: accntNo,
    });
  } else if (req.query.accountType == "chequing") {
    res.render("home", {
      username: req.query.username,
      chequingAccountNumber: accntNo,
    });
  } else {
    res.render("home");
  }
});

app.get("/account-type", (req, res) => {
    console.log("account---");
  res.render("account-type");
});

app.get("/createChequing", (req, res) => {
  accntNo++;
  let username = req.session.username;
  if (username) {
    res.render("home", {
      username: username,
      chequingAccountNumber: accntNo,
    });
  } else {
    res.render("unauthorised");
  }
});

app.post("/login", (req, res) => {
  fs.readFile("user.json", (err, data) => {
    if (err) throw err;
    let users = JSON.parse(data);
    let count = 0;
    for (key in users) {
      if (req.body.username == users[key].username) { 
        if (req.body.password == users[key].password) {
          return res.json({
            statusCode: 1,
            msg: "Login Success",
            username: req.body.username,
          });
        } else {
          return res.json({ statusCode: 0, msg: "Invalid password" });
        }
      } else {
        if (count == Object.keys(users).length - 1) {
          return res.json({ statusCode: 0, msg: "Not a registered username" });
        }
      }
      count++;
    }
  });
});

app.get("/unauthorised", (req, res) => {
  res.render("unauthorised");
});

app.get("/register", (req, res) => {
  res.render("register");
});

/* get endpints  */
app.get("/balance", (req, res) => {
  res.render("balance");
});

app.get("/deposit", (req, res) => {
  res.render("deposit");
});

app.get("/withdrawal", (req, res) => {
  res.render("withdrawal");
});


/* post endpoints */
app.post("/deposit", (req, res) => {

  console.log('---depoisr post---',req.body);
  
  // res.render("balance");
});

app.post("/createAccount", (req, res) => {
  console.log("---createAccount post---", req.body);

  // res.render("balance");
});

app.post("/withdrawal", (req, res) => {
   console.log("---withdrawal post---", req.body);

});



//Makes the app listen to port 3000
app.listen(port, () => console.log(`App listening to port ${port}`));
