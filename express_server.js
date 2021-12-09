const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  username: {
    id: 'username',
    email: 'email@gmail.com',
    password: 'password'
  },
  username2: {
    id: 'username2',
    email: 'email2@gmail.com',
    password: 'password2'
  }
};

//Root directory page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Urls database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Current urls page
app.get("/urls", (req, res) => {
  const userInCookies = req.cookies["user_id"];
  
  const templateVars = { user: userDatabase[userInCookies], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Add new url page
app.get("/urls/new", (req, res) => {
  const userInCookies = req.cookies["user_id"];
  const templateVars = { user: userDatabase[userInCookies], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

//Redirect to longUrl page
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//Show details on shortURL:LongURL page
app.get("/urls/:shortURL", (req, res) => {
  const userInCookies = req.cookies["user_id"];
  
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  const templateVars = { user: userDatabase[userInCookies], shortURL: shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const userInCookies = req.cookies["user_id"];
  const errorMessage = false;

  const templateVars = { user: userDatabase[userInCookies], urls: urlDatabase, errorMessage: errorMessage};
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const userInCookies = req.cookies["user_id"];
  const errorMessage = false;

  const templateVars = { user: userDatabase[userInCookies], urls: urlDatabase, errorMessage: errorMessage};
  res.render("urls_login", templateVars);
});

//If new longURL is submitted, process this on serverside.
app.post("/urls/new", (req, res) => {
  const userInCookies = req.cookies["user_id"];
  const randomURL = generateRandomString();
  const shortURL = randomURL;
  const longURL = req.body['longURL'];
  // console.log(shortURL, longURL);
  //Add new shortURL:longURL to urlDatabase
  urlDatabase[shortURL] = longURL;

  const templateVars = { user: userDatabase[userInCookies], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Update URLs
app.post("/urls/:shortURL/update", (req, res) => {
  const userInCookies = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  const longURL = req.body['longURL'];
  //Add new shortURL:longURL to urlDatabase
  delete urlDatabase[shortURL];
  
  urlDatabase[shortURL] = longURL;

  const templateVars = { user: userDatabase[userInCookies], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Delete urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const userInCookies = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  //Take back to urls page.
  const templateVars = { user: userDatabase[userInCookies], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls/user_id", (req, res) => {
  const currUser = req.body['user_id'];
  res.cookie('user_id', currUser);
  const userInCookies = req.cookies["user_id"];

  const templateVars = { user: userDatabase[userInCookies], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  const userInCookies = req.cookies["user_id"];

  const templateVars = { user: userDatabase[userInCookies], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const email = req.body['email'];
  const password = req.body['password'];
  const emailInUse = checkIfEmailInUse(email);
  const errorMessage = true;
  
  if(email === "" || password === "" || emailInUse) {
    const templateVars = { 
      user: userDatabase[user_id],
      urls: urlDatabase,
      errorMessage: errorMessage
    };
    res.render("urls_register", templateVars);
  } else {
    userDatabase[user_id] = {
      id: username,
      email: email,
      password: password
    };
    res.cookie('user_id', userDatabase[user_id].id);
    
    const templateVars = { user: userDatabase[user_id], urls: urlDatabase };
    res.render("urls_index", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body['email'];
  const password = req.body['password'];
  const userInCookies = req.cookies["user_id"];
  
  const errorMessage = true;
  
  if(email === "" || password === "") {
    const templateVars = { 
      user: userDatabase[userInCookies],
      urls: urlDatabase,
      errorMessage: errorMessage
    };
    res.render("urls_login", templateVars);
  } else {
    const currUserId = getUserId(email);
    if(userDatabase[currUserId]['password'] === password) {
      res.cookie('user_id', currUserId);
      
      const templateVars = { user: userDatabase[currUserId], urls: urlDatabase };
      res.render("urls_index", templateVars);
    } else {
      const templateVars = { 
        user: userDatabase[userInCookies],
        urls: urlDatabase,
        errorMessage: errorMessage
      };
      res.render("urls_login", templateVars);
    }
  }
});

//TO-DO: deal with edge cases and error handeling.

//Generate random 6 lowercase letter string
function generateRandomString() {
  let randomString = "";
  counter = 1;
  while (counter <= 6) {
    let randomASCIIChar = Math.floor(Math.random()*26)+97;
    randomString += String.fromCharCode(randomASCIIChar);
    counter++;
  }
  return (urlDatabase[randomString] ? generateRandomString() : randomString);
};

const checkIfEmailInUse = (emailToVerify) => {
  for (user in userDatabase) {
    if(emailToVerify === userDatabase[user]['email']) {
      return true;
    }
  }
  return false;
};

const getUserId = (email) => {
  for (user in userDatabase) {
    if(email === userDatabase[user]['email']) {
      return userDatabase[user]['id'];
    }
  }
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


