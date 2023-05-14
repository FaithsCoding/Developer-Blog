const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { User } = require("../models");
const saltRounds = 10;

router.get("/register", async (req, res) => {
  return res.render("register");
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Create a new user with the provided details and hashed password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Log in and authenticate the newly registered user
    req.login(newUser, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).render("error", { error: "Server error" });
      }
      // Redirect the user to a protected route or homepage
      return res.redirect("/dashboard");
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { error: "Server error" });
  }
});

module.exports = router;
