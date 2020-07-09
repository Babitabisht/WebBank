//Loads the express module
const express = require("express");
let path = require("path");
let bodyParser = require("body-parser");
let fs = require("fs");
//Creates our express server
const app = express();
const port = 3000;

//Loads the handlebars module
const exphbs = require("express-handlebars");
app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
// app.engine("hbs", exphbs());
app.set("view engine", "hbs");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Serves static files (we need it to import a css file)
app.use(express.static(__dirname + "/public"));

/* Implementing client sessions */
var sessions = require("client-sessions");
app.use(
  sessions({
    cookieName: "mySession", // cookie name dictates the key name added to the request object
    secret: "blargadeeblargblarg", // should be a large unguessable string
    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
  })
);

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.mySession.username) {
    next();
  } else {
    res.render("login");
  }
};

//Sets a basic route
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/home", sessionChecker, (req, res) => {
  let accountsData;
  let accountNumbers;
  fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    accountsData = JSON.parse(jsonString);
    accountNumbers = Object.keys(accountsData);
    if ((accountNumbers[0] = "lastID")) accountNumbers.shift();
    res.render("home", {
      username: req.mySession.username,
      accountNumbers: accountNumbers,
    });
  });
});

app.get("/account-type", sessionChecker, (req, res) => {
  fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    accountsData = JSON.parse(jsonString);
  });
  res.render("account-type", {
    username: req.mySession.username
  });
});

app.get("/createChequing", sessionChecker, (req, res) => {
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
          req.mySession.username = req.body.username;
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
app.get("/balance", sessionChecker, (req, res) => {
  if (req.query.accountNumber == "0000000") {
    res.render("home", {
      msg: "Account number is missing",
      username: req.mySession.username,
    });
  } else {
    fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
      if (err) {
        console.log("File read failed:", err);
        return;
      }
      let accountsData = JSON.parse(jsonString);
      let accountInfo;
      for (var key in accountsData) {
        if (accountsData.hasOwnProperty(key)) {
          if (key == req.query.accountNumber) accountInfo = accountsData[key];
        }
      }
     
      console.log("accountInfo", accountInfo);
      if (accountInfo == "" || accountInfo == undefined) {
        res.render("home", {
          msg: "Invalid account number",
          username: req.mySession.username
        });
      } else {
         accountsData.lastID = req.query.accountNumber;
        fs.writeFile("./accounts.json", JSON.stringify(accountsData), (err) => {
          if (err) console.log("Error writing file:", err);
        });
        res.render("balance", {
          accountNumber: req.query.accountNumber,
          accountInfo: accountInfo,
          username: req.mySession.username,
        });
      }
    });
  }
});

app.get("/deposit", sessionChecker, (req, res) => {
  if (req.query.accountNumber == "0000000") {
    res.render("home", {
      msg: "Account number is missing",
      username: req.mySession.username,
    });
  } else {

     fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
       if (err) {
         console.log("File read failed:", err);
         return;
       }
       let accountsData = JSON.parse(jsonString);
       let accountInfo;
       for (var key in accountsData) {
         if (accountsData.hasOwnProperty(key)) {
           if (key == req.query.accountNumber) {
             accountInfo = accountsData[key];
           }
         }
       }
       if (accountInfo == "" || accountInfo == undefined) {
         res.render("home", {
           msg: "Invalid account number",
           username: req.mySession.username,
         });
       } else {
            res.render("deposit", {
              accountNumber: req.query.accountNumber,
              username: req.mySession.username,
            });
       }
     });
  }
});

app.get("/withdrawal", sessionChecker, (req, res) => {
  if (req.query.accountNumber == "0000000") {
    res.render("home", {
      msg: "Account number is missing",
      username: req.mySession.username,
    });
  } else {
     fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
       if (err) {
         console.log("File read failed:", err);
         return;
       }
       let accountsData = JSON.parse(jsonString);
       let accountInfo;
       for (var key in accountsData) {
         if (accountsData.hasOwnProperty(key)) {
           if (key == req.query.accountNumber) {
             accountInfo = accountsData[key];
           }
         }
       }
       if (accountInfo == "" || accountInfo == undefined) {
         res.render("home", {
           msg: "Invalid account number",
           username: req.mySession.username,
         });
       } else {
          res.render("withdrawal", {
            accountNumber: req.query.accountNumber,
            username: req.mySession.username,
          });
       }
     });   
  }
});

/* post endpoints */
app.post("/deposit", sessionChecker, (req, res) => {
  let { depositAmount, accountNumber } = req.body;
  fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    let accountsData = JSON.parse(jsonString);
    let accountInfo;
    for (var key in accountsData) {
      if (accountsData.hasOwnProperty(key)) {
        if (key == req.body.accountNumber) {
          accountInfo = accountsData[key];
          accountInfo.accountBalance =
            parseFloat(accountInfo.accountBalance) + parseFloat(depositAmount);
          // accountInfo = accountsData[key];
        }
      }
    }
     if (accountInfo == "" || accountInfo == undefined) {
       res.render("home", {
         msg: "Invalid account number",
         username: req.mySession.username,
       });
     } else{
            accountsData.lastID = req.body.accountNumber;
            fs.writeFile(
              "./accounts.json",
              JSON.stringify(accountsData),
              (err) => {
                if (err) console.log("Error writing file:", err);
              }
            );
            res.render("balance", {
              accountNumber: accountNumber,
              accountInfo: accountInfo,
              username: req.mySession.username,
            });
     }

  });
});

app.post("/createAccount", sessionChecker, (req, res) => {
  let accountNumber;
  fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }

    accountsData = JSON.parse(jsonString);
    // let strLength = accountsData.length;
    let numZero = "";
    let accountNumber;
    totalAccounts = Object.keys(accountsData).length;
    str = totalAccounts.toString();
    str.length < 7
      ? (numZero = "0".repeat(7 - str.length))
      : (numZero = numZero);
    accountNumber = numZero.concat(totalAccounts);
    accountsData[accountNumber] = {
      accountType: req.body.accountType,
      accountBalance: 0,
    };
    accountsData.lastID = accountNumber;
    fs.writeFile("./accounts.json", JSON.stringify(accountsData), (err) => {
      if (err) console.log("Error writing file:", err);
    });
    res.render("home", {
      msg: `Account type ${req.body.accountType} with account number ${accountNumber} is created`,
      username: req.mySession.username,
    });
  });
});

app.post("/withdrawal", sessionChecker, (req, res) => {
  let { withdrawalAmount, accountNumber } = req.body;
  fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    let accountsData = JSON.parse(jsonString);
    let accountInfo;
    for (var key in accountsData) {
      if (accountsData.hasOwnProperty(key)) {
        if (key == req.body.accountNumber) {
          accountInfo = accountsData[key];
          if (
            parseFloat(withdrawalAmount) >
            parseFloat(accountInfo.accountBalance)
          ) {
            res.render(`withdrawal`, {
              accountNumber: accountNumber,
              msg: "Insufficient Funds",
              username: req.mySession.username,
            });
            return;
          }
          accountInfo.accountBalance =
            parseFloat(accountInfo.accountBalance) -
            parseFloat(withdrawalAmount);
        }
      }
    }
    accountsData.lastID = req.body.accountNumber;
    fs.writeFile("./accounts.json", JSON.stringify(accountsData), (err) => {
      if (err) console.log("Error writing file:", err);
    });
    res.redirect(`balance?accountNumber=${accountNumber}`);
  });
});

app.post("/home", sessionChecker, (req, res) => {
  let { accountNumber, serviceType } = req.body;
  let strLength = accountNumber.length;
  let numZero;
  let modifiedAccountNumber;
  strLength < 7 ? (numZero = "0".repeat(7 - strLength)) : (numZero = numZero);
  strLength < 7
    ? (modifiedAccountNumber = numZero.concat(accountNumber))
    : (modifiedAccountNumber = accountNumber);
  switch (serviceType) {
    case "balance":
      res.redirect(`/balance?accountNumber=${modifiedAccountNumber}`);
      break;
    case "deposit":
      res.redirect(`/deposit?accountNumber=${modifiedAccountNumber}`);
      break;
    case "withdrawal":
      res.redirect(`/withdrawal?accountNumber=${modifiedAccountNumber}`);
      break;
    case "openAccount":
      res.render("account-type", {
        accountNumber: modifiedAccountNumber,
        username: req.mySession.username,
      });
      break;
  }
});

app.get("/logout", sessionChecker, (req, res) => {
  req.mySession.reset();
  res.render("login");
});

//Makes the app listen to port 3000
app.listen(port, () => console.log(`App listening to port ${port}`));
