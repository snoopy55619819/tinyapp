const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Add new url page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Redirect to longUrl page
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//Show details on shortURL:LongURL page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  
  const templateVars = { shortURL: shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

//If new longURL is submitted, process this on serverside.
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body['longURL'];
  //Add new shortURL:longURL to urlDatabase
  urlDatabase[shortURL] = longURL;

  const templateVars = { shortURL: shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
