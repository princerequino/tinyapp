const express = require("express");
const cookieSession = require('cookie-session');
const morgan = require("morgan");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080
const {getUserByEmail, generateRandomString, urlsForUser, urlDatabase, users} = require("./helpers");


//===============================================************* Middlewares **************=================================================

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['secret key', 'other secret key']
}));


//===============================================****************************************=================================================
//===============================================*************** REGISTER ***************=================================================
//===============================================****************************************=================================================

// Register // Get /register
app.get("/register", (req, res) => {
  const templateVars = {
    "user": null
  };
  res.render("register_index", templateVars);
});

// new User / Post /register
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Please fill in the Email and Password');
  }
// Email Duplication Check
  if (getUserByEmail(req.body.email, users)) {
    res.send("Email Address has already been registered!");
  }

// newID
  const newID = generateRandomString();
  const newUser = {
    id: newID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };

  users[newID] = newUser;
  req.session["user_id"] = newID;
  res.redirect("/urls");
});

//===============================================****************************************=================================================
//===============================================*************** LOGIN ***************=================================================
//===============================================****************************************=================================================


// Login render page // GET /login
app.get("/login", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("login_index", templateVars);
});



// Login CookieSession // POST /login
app.post("/login", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(403).send('Please fill in the Email and Password');
  }

 const user = getUserByEmail(req.body.email, users);
 if (!user) {
   res.status(403).send('Email is not registered!')
 }
   
 if (!bcrypt.compareSync(req.body.password, user.password)) {
   res.status(403).send('Passwords do not match! Please try again.')
 }
 req.session["user_id"] = user.id;
 res.redirect("/urls");
});

//===============================================****************************************=================================================
//===============================================*************** LOG OUT ***************=================================================
//===============================================****************************************=================================================


// Logout Cookie / POST / logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//===============================================****************************************=================================================
//===============================================*************** URLS ***************=================================================
//===============================================****************************************=================================================

// localhost:8080 leads to /urls page
app.get("/", (req, res) => {
  res.redirect("/urls");
});


// List of urls in Database
app.get("/urls", (req, res) => {
  const userDatabase = urlsForUser(req.session.user_id);
  const user = users[req.session.user_id];
  const templateVars = {
    urls: userDatabase,
    user: user
  };
  res.render("urls_index", templateVars);
});


// Create new URL. Redirects to /login if not logged in.
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});


// new URL redirect page
app.post("/urls", (req, res) => {
  if (req.session.user_id === undefined) {
    res.status(404);
    res.send("Please login first!");
  } else {
    const newShortURL = generateRandomString();
    urlDatabase[newShortURL] = {
      "longURL": req.body.longURL,
      "userID": req.session.user_id
    };
    res.redirect(`/urls/${newShortURL}`);
  }
});


// parameter based on the database ID
app.get("/urls/:shortURL", (req, res) => {
  const userDatabase = urlsForUser(req.session.user_id);
  const userShortUrl = req.params.shortURL;

//validate user with registered url
  if (userDatabase[userShortUrl] === undefined) {
    res.status(404).send(`<html><body><p><b> Please <a href='/login'>log in</a> with a valid account. If not registered, click <a href='/register'>register</a> here!<b></body></html>`);
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  }
});



// redirect to Original LongURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404).send("You have requested a non-existent shortURL!  </br><html><body><a href=/>HOME</a></body></html>");
  } else {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});



// EDIT / POST /urls/:shortURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    res.status(404).send('You are not authorized to Edit!');
  }

  const newLongURL = req.body.updateURL; 
//take whatever is put in the form (updateURL) and changes the value of urlDatabase[shortURL] after.
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});



//DELETE / POST /urls/:shortURL/delete
//(after deletion, redirect back to urls_index page (/urls))                                      
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    res.status(404).send('You are not authorized to delete!');
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});






// MISC 



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





