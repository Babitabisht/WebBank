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

/* Implementing client sessions */
var sessions = require("client-sessions");
app.use(
  sessions({
    cookieName: "mySession", // cookie name dictates the key name added to the request object
    secret: "blargadeeblargblarg", // should be a large unguessable string
    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
/*     cookie: {
      path: "/api", // cookie will only be sent to requests under '/api'
      maxAge: 60000, // duration of the cookie in milliseconds, defaults to duration above
      ephemeral: false, // when true, cookie expires when the browser closes
      httpOnly: true, // when true, cookie is not accessible from javascript
      secure: false, // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
    }, */
  })
);

/* app.use(function (req, res, next) {
  if (req.mySession.seenyou) {
    res.setHeader("X-Seen-You", "true");
  } else {
    // setting a property will automatically cause a Set-Cookie response
    // to be sent
    req.mySession.seenyou = true;
    res.setHeader("X-Seen-You", "false");
  }
}); */


// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  console.log(
    "req.mySession.username",
    req.mySession.username
  );
  
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
        accountNumbers= Object.keys(accountsData)  
        if  (accountNumbers[0]="lastID") accountNumbers.shift();
            res.render("home", {
              username: req.mySession.username,
              accountNumbers: accountNumbers,
            });
      });
 


  // if (req.query.accountType == "saving") {
  //   console.log("-- req.mySession.username", req.mySession.username);
    
  //   res.render("home", {
  //     username: req.mySession.username,
  //     savingAccountNumber: accntNo,
  //   });
  // } else if (req.query.accountType == "chequing") {
  //   res.render("home", {
  //     username: req.query.username,
  //     chequingAccountNumber: accntNo,
  //   });
  // } else {
  //   res.render("home");
  // }
});

app.get("/account-type",sessionChecker, (req, res) => {
  console.log("--accountNumber",req.query.accountNumber);
  fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    accountsData = JSON.parse(jsonString);
    
  });
 
  
  res.render("account-type");
});

app.get("/createChequing",sessionChecker, (req, res) => {
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
app.get("/balance",sessionChecker, (req, res) => {
    console.log("--accountNumber", req.query.accountNumber);
    fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
      if (err) {
        console.log("File read failed:", err);
        return;
      }
     let  accountsData = JSON.parse(jsonString);
      let  accountInfo;
      for (var key in accountsData ){
         if (accountsData.hasOwnProperty(key)) {
           if (key==req.query.accountNumber) accountInfo = accountsData[key];
         }
      }
      res.render("balance", {
        accountNumber: req.query.accountNumber,
        accountInfo: accountInfo,
      });

    });
});

app.get("/deposit", (req, res) => {
  res.render("deposit", { accountNumber: req.query.accountNumber });
});

app.get("/withdrawal", (req, res) => {
  res.render("withdrawal");
});


/* post endpoints */
app.post("/deposit",sessionChecker, (req, res) => {
  console.log('---depoisr post---',req.body);
  let { depositAmount, accountNumber } = req.body;
      fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
        if (err) {
          console.log("File read failed:", err);
          return;
        }
        let accountsData = JSON.parse(jsonString);
        let accountInfo;
        for (var  key in accountsData) {
          if (accountsData.hasOwnProperty(key)) {
            if (key == req.body.accountNumber) {
              accountInfo = accountsData[key];
              accountInfo.accountBalance =
                parseFloat(accountInfo.accountBalance) +
                parseFloat(depositAmount);
                console.log(
                  "-accountInfo.accountBalance ",
                  accountInfo.accountBalance
                );
                
            };
          }
        }
        console.log("----------sww---", accountsData);
        
         fs.writeFile(
           "./accounts.json",
           JSON.stringify(accountsData),
           (err) => {
             if (err) console.log("Error writing file:", err);
           }
         );
        res.redirect(`balance?accountNumber=${accountNumber}`);
        // res.render("balance", {
        //   accountNumber: accountNumber
        // });
      });
  // res.render("balance");
});

app.post("/createAccount",sessionChecker, (req, res) => {
  console.log("---createAccount post---", req.body);
  fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    console.log("File data:",typeof jsonString);
    accountsData = JSON.parse(jsonString);
    accountNumber = `000000${Object.keys(accountsData).length}`;
    accountsData[accountNumber] = {
      accountType: req.body.accountType,
      accountBalance:0,
    };
      fs.writeFile("./accounts.json", JSON.stringify(accountsData), (err) => {
        if (err) console.log("Error writing file:", err);
      });
  });
  res.json({ statusCode: 1, msg: "Account created" });
  // res.render("balance");
});

app.post("/withdrawal",sessionChecker, (req, res) => {
   console.log("---withdrawal post---", req.body);

});



//Makes the app listen to port 3000
app.listen(port, () => console.log(`App listening to port ${port}`));
