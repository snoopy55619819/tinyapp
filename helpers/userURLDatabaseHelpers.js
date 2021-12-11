//Generate random 6 lowercase letter string
function generateRandomString(urlDatabase) {
  let randomString = "";
  counter = 1;
  while (counter <= 6) {
    let randomASCIIChar = Math.floor(Math.random()*26)+97;
    randomString += String.fromCharCode(randomASCIIChar);
    counter++;
  }
  return (urlDatabase[randomString] ? generateRandomString() : randomString);
};

const getUserByEmail = (email, userDatabase) => {
  for (user in userDatabase) {
    if(email === userDatabase[user]['email']) {
      return userDatabase[user]['id'];
    }
  }
  return null;
};

const urlsForUser = (id, urlDatabase) => {
  const userURLs = {};

  for (const url in urlDatabase) {
    if (id === urlDatabase[url]['userID']) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
};


module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
}