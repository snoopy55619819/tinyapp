const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers/userURLDatabaseHelpers')

//Middleware:
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['random secret key']
}));

//samples added.
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "username"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "username2"
  }
};

//samples added.
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

//Root directory page. Redirect to homepage.
app.get("/", (req, res) => {
  return res.redirect("/urls");
});

//HOMEPAGE: show urls of current user.
app.get("/urls", (req, res) => {
  const userInCookies = req.session.user_id;

  const templateVars = { 
    user: userDatabase[userInCookies],
    urls: urlsForUser(userInCookies, urlDatabase)
  };
  return res.render("urls_index", templateVars);
});

//Add new url page
app.get("/urls/new", (req, res) => {
  const userInCookies = req.session.user_id;

  if(!userInCookies || !userDatabase[userInCookies]) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: userDatabase[userInCookies],
    errorMessage: null
  };
  return res.render("urls_new", templateVars);
});

//Redirect to longUrl page
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]['longURL'];
  return res.redirect(longURL);
});

//Show details about shortURL. ShortURL owners can edit.
app.get("/urls/:shortURL", (req, res) => {
  const userInCookies = req.session.user_id;
  const shortURL = req.params.shortURL;
  const loggedInUser = userDatabase[userInCookies];
  const shortURLExists = urlDatabase[shortURL];
  let longURL = "";
  let showEditSection = false;

  if(shortURLExists) {
    const ownerOfShortURL = urlDatabase[shortURL]['userID'];
    longURL = urlDatabase[shortURL]['longURL'];

    if (loggedInUser && loggedInUser['id'] === ownerOfShortURL) {
      showEditSection = true;
    }
  }
  
  const templateVars = {
    user: userDatabase[userInCookies],
    shortURL,
    longURL,
    shortURLExists,
    showEditSection,
    errorMessage: null
  };
  return res.render("urls_show", templateVars);
});

//Go to register page
app.get("/register", (req, res) => {
  const userInCookies = req.session.user_id;

  const templateVars = {
    user: userDatabase[userInCookies],
    errorMessage: null
  };
  return res.render("urls_register", templateVars);
});

//Go to login page
app.get("/login", (req, res) => {
  const userInCookies = req.session.user_id;
  const errorMessage = null;

  const templateVars = {
    user: userDatabase[userInCookies],
    errorMessage: errorMessage
  };
  return res.render("urls_login", templateVars);
});


//If new longURL is submitted, process this on serverside.
app.post("/urls/new", (req, res) => {
  const userInCookies = req.session.user_id;
  const randomURL = generateRandomString(urlDatabase);
  const shortURL = randomURL;
  const longURL = req.body['longURL'];
  
  if (longURL === "") {
    const errorMessage = 'Invalid URL entered. URL must not be empty';

    const templateVars = {
      user: userDatabase[userInCookies],
      errorMessage
    };
    return res.render("urls_new", templateVars);
  }

  //Add new shortURL:longURL to urlDatabase
  urlDatabase[shortURL] = {
    longURL,
    userID: userInCookies
  };
  return res.redirect("/urls");
});

//Update URLs
app.post("/urls/:shortURL/update", (req, res) => {
  const userInCookies = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body['longURL'];

  if (longURL === "") {
    const errorMessage = 'Invalid URL entered. URL must not be empty';

    const templateVars = {
      user: userDatabase[userInCookies],
      shortURL,
      longURL: urlDatabase[shortURL]['longURL'],
      shortURLExists: true,
      showEditSection: true,
      errorMessage
    };
    return res.render("urls_show", templateVars);
  }

  //Add new shortURL:longURL to urlDatabase
  delete urlDatabase[shortURL];
  
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userInCookies
  };

  return res.redirect("/urls");
});

//Delete urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  //Take back to urls page.
  return res.redirect("/urls");
});

//Logout and remove session cookie.
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/urls");
});

//AProcess regristration request and send to home page.
app.post("/register", (req, res) => {
  const user_id = generateRandomString(urlDatabase);
  const email = req.body['email'];
  const password = req.body['password'];
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  if(!email || !password || getUserByEmail(email, userDatabase)) {
    const errorMessage = (!email || !password ? 'Email/Password cannot be empty.' : 'Email already exists.');
    
    const templateVars = { 
      user: userDatabase[user_id],
      urls: urlDatabase,
      errorMessage: errorMessage
    };
    return res.render("urls_register", templateVars);
  }

  userDatabase[user_id] = {
    id: user_id,
    email: email,
    password: hashedPassword
  };
  req.session.user_id = userDatabase[user_id].id;
  
  return res.redirect("/urls");
});

//Process login request and send to homepage.
app.post("/login", (req, res) => {
  const userInCookies = req.session.user_id;
  const email = req.body['email'];
  const password = req.body['password'];
  
  if(!email|| !password || !getUserByEmail(email, userDatabase)) {
    const errorMessage = (!email || !password ? 'Email/Password cannot be empty.' : 'Email does not exist.');

    const templateVars = { 
      user: userDatabase[userInCookies],
      urls: urlDatabase,
      errorMessage: errorMessage
    };
    return res.render("urls_login", templateVars);
  }

  const currUserId = getUserByEmail(email, userDatabase);
  const hashedPassword = userDatabase[currUserId]['password'];

  if(bcrypt.compareSync(password, hashedPassword)) {
    req.session.user_id = currUserId;
    
    return res.redirect("/urls");
  }

  const errorMessage = 'Incorrect password.'
  const templateVars = { 
    user: userDatabase[userInCookies],
    urls: urlDatabase,
    errorMessage: errorMessage
  };

  return res.render("urls_login", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


