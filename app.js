//dependencies
const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const sequelize = require("./config/connection");
const passport = require("passport");
//session already has a default idle time built in however we have specified a longer time period below
const session = require("express-session");
const initializePassport = require("./config/passport-config");


// Sets up the Express App
const app = express();
const PORT = process.env.PORT || 3040;

// Set Handlebars as the default template engine and includes a helper to format date.
const hbs = exphbs.create({
  helpers: {
    formatDate: function (date) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString(undefined, options);
    },
  },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

//tells app to use session whilst specifiying the time the user can be idle for before being logged out
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      // maxAge: 60 * 1000, // 1 minute in milliseconds uncomment for testing
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds - for production
    },
  })
);

// this is express middleware that allows for serving of static files so we can incorporate images/logos.
app.use(express.json());
app.use(express.static(path.join(__dirname, "assets")));
app.use(express.urlencoded({ extended: true }));

// Initializes Passport and configures Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connects to DB, starts the server and console logs where it is listening
sequelize.sync({ force: false }).then(() => {
  console.log("Database connected!");
  app.listen(PORT, () =>
    console.log("Server listening on: http://localhost:" + PORT)
  );
});

// calling in route files
app.use([
  require("./controllers/all-routes"),
  require("./controllers/register-routes"),
  require("./controllers/blog-routes"),
  require("./controllers/login-routes"),
  require("./controllers/comment-routes"),
]);

module.exports = app;
