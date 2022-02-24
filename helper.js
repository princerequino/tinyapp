const bcrypt = require('bcryptjs');

//===============================================****************************************=================================================
//===============================================*************** DATABASE ***************=================================================
//===============================================****************************************=================================================

//===============================================**********    URL Database    **********=================================================
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  }
};
//===============================================**********    User Database   **********===============================================
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "a@a.com", 
    password: bcrypt.hashSync("1234", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "s@s.com", 
    password: bcrypt.hashSync("qwer", 10)
  }
}

//===============================================**********   Functions   **********=================================================


const getUserByEmail = (email, database) => {
  for (const userID in database) {
    if (email === database[userID].email) {
      return database[userID];
    }
  }
  return undefined;
};

const generateRandomString = function (length = 6) {
  return Math.random().toString(20).substr(2, length);
};

// returns the URLs where the userID is equal to the id of current logged-in user
// Loop through urlDatabase (for-in), match id & urlDatabaseID, if match,  return object
const urlsForUser = (id) => {
  const userObj = {};
  for (const data in urlDatabase) {
    if (id === urlDatabase[data].userID) {
      userObj[data] = urlDatabase[data];
    }
  }
  return userObj;
};




module.exports = {getUserByEmail, generateRandomString, urlsForUser, urlDatabase, users}