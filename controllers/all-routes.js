const router = require("express").Router();
const bcrypt = require("bcrypt");
const { User } = require("../models");

router.get("/", async (req, res) => {
  return res.render("home", { title: "homepage" });
});

router.get("/user/:num", async (req, res) => {
  return res.render("user", Users[req.params.num - 1]);
});

router.get("/login", async (req, res) => {
  return res.render("login", { title: "login" });
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login");
  });
});

router.get("/register", async (req, res) => {
  return res.render("register", { title: "Register" });
});

router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  return res.render("dashboard");
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
module.exports = router;
