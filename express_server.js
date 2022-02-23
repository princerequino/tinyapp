const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080



//                                                ************* Middlewares *************
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");





//                                               **********    URL Database    **********
const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};
//                                               **********    User Database     **********
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



//                                            **********    Create Random Strings     **********
const generateRandomString = function (length = 6) {
  return Math.random().toString(20).substr(2, length);
};


//                                            ********** / Register / GET /register \ **********
app.get("/register", (req, res) => {
  const templateVars = {
    // username: req.cookies.username
    "user_id": req.cookies.user_id,
    "users": users
  };

  res.render("register_index", templateVars);
});


//                                            ********** / Register / POST /register \ **********

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Please fill in the Email and Password');
  }
  // no duplicated email addresses.
  for (const user in users) {
    if (req.body.email === users[user].email) {
      res.status(400);
      res.send("You have already registered with the same email address!");
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

//                                               ********** / URL / GET /urls \ **********
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    // username: req.cookies.username
    "user_id": req.cookies.user_id,
    "users": users
  };
  res.render("urls_index", templateVars);
})



//                                            ********** / URL / GET /urls/new \ **********
//                                            url new page ----> This has to be defined 
//                                        before /urls/:id. -------> Routes should be ordered 
//                                                   from MOST specific to least.
app.get("/urls/new", (req, res) => {
  const templateVars = {
    // username: req.cookies.username
    "user_id": req.cookies.user_id,
    "users": users
  };
  res.render("urls_new", templateVars);
});



//                                            ********** / COOKIE / POST /login \ **********
app.post("/login", (req, res) => {
  const username = req.body.username;

  res.cookie("user_id", templateVars); // (name, value)
  res.redirect("/urls");            // redirects back to /urls page
});


//                                            ********** / COOKIE / POST /logout \ **********
app.post("/logout", (req, res) => {
const templateVars = {
  "user_id": req.body.user_id,
  users: users
};

  res.clearCookie("user_id", templateVars);
  res.redirect("/urls");
});










//                                            ********** / URL / POST /urls \ **********   
//                                                     (new url redirect page)
app.post("/urls", (req, res) => {
  console.log(req.body); 

  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL; // the value of the new short URL ID/KEY

  res.redirect(`/urls/${newShortURL}`);
});

//                                            ********** / URL / GET /urls/:shortURL \ **********   
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    // req.params.shortURL ---> points to the KEYS in urlDatabase
    shortURL: req.params.shortURL, 
    // urlDatabase[req.params.shortURL] ---> points to the Value of my Keys (longURLS)
    longURL: urlDatabase[req.params.shortURL],
    // username: req.cookies.username
    "user_id": req.cookies.user_id,
    "users": users
  };
  res.render("urls_show", templateVars);
});

//                                            ********** / URL / GET /u/:shortURL \ **********   
//                                                    (redirect to Original LongURL)
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404);
    res.send("You have requested a non-existent shortURL!");
  } else {
    res.redirect(urlDatabase[req.params.shortURL]);
  }
});



//                                            ********** / EDIT / POST /urls/:shortURL \ **********   
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.updateURL; 
  //take whatever is put in the form (updateURL) and changes the value of urlDatabase[shortURL] after.
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

//                                ********** / DELETE / POST /urls/:shortURL/delete \ **********   
//                                      (after deletion, redirect back to urls_index page (/urls))
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect('/urls');
});








app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});




//                                               ********** App Listening on Port **********  
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





