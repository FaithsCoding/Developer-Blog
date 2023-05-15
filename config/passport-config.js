const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { User } = require("../models");

// Serializes the user object to store in the session, seralizing is when it is converted into a format which is stored in the session
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// Deserialize the user object from the session, deserializing is converting it back and retrieving the full object from the DB
//this is used to make the information re-availble so it can be altered
passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return done(new Error("User not found"));
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Configures the local strategy for passport authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
    },
    async (providedUsername, password, done) => {
      try {
        // Finds the user in the database based on the provided username
        const user = await User.findOne({
          where: { username: providedUsername },
        });
        if (!user) {
          console.log("Username not found:", providedUsername);
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }
        // Compares the provided password with the stored bcrypted password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          console.log("Invalid password for username:", providedUsername);
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }
        console.log("Successfully authenticated username:", providedUsername);

        // Creates an authenticated user object with the below properties
        const { id, email, username } = user;
        const authenticatedUser = { id, email, username };

        // Passes the authenticated user object to the next middleware
        return done(null, authenticatedUser);
      } catch (error) {
        done(error);
      }
    }
  )
);

// Exports the passport configuration
module.exports = passport;
