const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// If the server is live, this Database will keep on adding up.
const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};

// Create random Strings
const generateRandomString = function (length = 6) {
  return Math.random().toString(20).substr(2, length);
};

// List of Urls in the data base object
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; // uses the urlDatabase above.
  res.render("urls_index", templateVars); //for Express, it searches in the view file with .ejs automatically
});

//url new page ----> This has ot be defined before /urls/:id. -------> Routes should be ordfered from Most specific to least.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// new url redirect page
app.post("/urls", (req, res) => {
  console.log(req.body); 

  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL; // the value of the new short URL ID/KEY

  res.redirect(`/urls/${newShortURL}`);
});

// req.params.shortURL ---> points to the KEYS in urlDatabase
// urlDatabase[req.params.shortURL] ---> points to the Value of my Keys (longURLS)

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

// Redirect to Original longURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404);
    res.send("You have requested a non-existent shortURL!");
  } else {
    res.redirect(urlDatabase[req.params.shortURL]);
  }
});

// DELETE / POST /urls/:shortURL/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
// After deletion, redirect back to urls_index page (/urls)
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


// app listening on Port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





