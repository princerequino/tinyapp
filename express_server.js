const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080



//===============================================************* Middlewares **************=================================================
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

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
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//===============================================**********    Create Random Strings     **********=================================================
const generateRandomString = function (length = 6) {
  return Math.random().toString(20).substr(2, length);
};

//===============================================****************************************=================================================
//===============================================*************** REGISTER ***************=================================================
//===============================================****************************************=================================================

// Register // Get /register
app.get("/register", (req, res) => {
  const templateVars = {
    "user_id": req.cookies.user_id,
    "users": users
  };

  res.render("register_index", templateVars);
});

// new User / Post /
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Please fill in the Email and Password');
  }
// Email Duplication Check
  for (const user in users) {
    if (req.body.email === users[user].email) {
      res.status(400);
      res.send("Email Address has already been registered!");
    }
  }

  const newID = generateRandomString();
  const newUser = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  };

  users[newID] = newUser;
  console.log('all users:', users);

  res.cookie("user_id", newID);
  res.redirect("/urls");
});

//===============================================****************************************=================================================
//===============================================*************** LOGIN ***************=================================================
//===============================================****************************************=================================================


// Login render page // GET /login
app.get("/login", (req, res) => {
  const templateVars = {
    "user_id": req.cookies.user_id,
    users: users
  };

  res.render("login_index", templateVars);
});



// Login Cookie // POST /login
app.post("/login", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Please fill in the Email and Password');
  }
  for (const user in users) {
    if (req.body.email === users[user].email && req.body.password === users[user].password) {
      res.cookie("user_id", users[user].id);
      return res.redirect("/urls");
    }
  }
  res.status(403); 
  res.send('Wrong email/password! Try again');
});

//===============================================****************************************=================================================
//===============================================*************** LOG OUT ***************=================================================
//===============================================****************************************=================================================


// Logout Cookie / POST / logout
app.post("/logout", (req, res) => {
const templateVars = {
  "user_id": req.body.user_id,
  users: users
};

  res.clearCookie("user_id", templateVars);
  res.redirect("/urls");
});

//===============================================****************************************=================================================
//===============================================*************** URLS ***************=================================================
//===============================================****************************************=================================================



// List of urls in Database
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    "user_id": req.cookies.user_id,
    "users": users
  };
  res.render("urls_index", templateVars);
})


// Create new URL. Redirects to /login if not logged in.
app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id === undefined) {
    res.redirect("/login");
  } else {
    const templateVars = {
      "user_id": req.cookies.user_id,
      users: users
    };
    res.render("urls_new", templateVars);
  }
});


// new URL redirect page
app.post("/urls", (req, res) => {
  console.log(req.body); 

  if (req.cookies.user_id === undefined) {
    res.status(403);
    res.send("Please login first!");
  } else {
    const newShortURL = generateRandomString();
    urlDatabase[newShortURL] = {
      "longURL": req.body.longURL,
      "userID": req.body.userID
    }; // the value of the new short URL ID/key

    res.redirect(`/urls/${newShortURL}`);
  }
});


// parameter based on the database ID
app.get("/urls/:shortURL", (req, res) => {

  if (req.cookies.user_id === undefined) {
    res.status(403);
    res.send("Please login first!");
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      "user_id": req.cookies.user_id,
      users: users
    };
    res.render("urls_show", templateVars);
  }
});



// redirect to Original LongURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404);
    res.send("You have requested a non-existent shortURL!");
  } else {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});



// EDIT / POST /urls/:shortURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.updateURL; 
//take whatever is put in the form (updateURL) and changes the value of urlDatabase[shortURL] after.
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});



//DELETE / POST /urls/:shortURL/delete
//(after deletion, redirect back to urls_index page (/urls))                                      
app.post("/urls/:shortURL/delete", (req, res) => {
  



  
  if (req.cookies.user_id === undefined) {
    res.status(403);
    res.send("Please login first!");
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      "user_id": req.cookies.user_id,
      users: users
    };
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
});






// MISC 

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





