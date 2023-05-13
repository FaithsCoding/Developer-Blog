const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { User } = require("../models");

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

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

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
    },
    async (providedUsername, password, done) => {
      try {
        const user = await User.findOne({
          where: { username: providedUsername },
        });
        if (!user) {
          console.log("Username not found:", providedUsername);
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          console.log("Invalid password for username:", providedUsername);
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }
        console.log("Successfully authenticated username:", providedUsername);

        // Add the username to the user object
        const { id, email, username } = user;
        const authenticatedUser = { id, email, username };

        return done(null, authenticatedUser);
      } catch (error) {
        done(error);
      }
    }
  )
);
