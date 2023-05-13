const router = require("express").Router();
const bcrypt = require("bcrypt");
const { User } = require("../models");
const { Blog } = require("../models");

router.get("/", async (req, res) => {
  return res.render("home", { title: "homepage" });
});

router.get("/user/:num", async (req, res) => {
  return res.render("user", Users[req.params.num - 1]);
});

router.get("/login", async (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }

  return res.render("login", { title: "login" });
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login");
  });
});

router.get("/register", ensureAuthenticated, async (req, res) => {
  return res.render("register", { title: "Register" });
});

router.get("/dashboard", async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  try {
    // Fetch the user's blog posts from the database
    const userId = req.user.id; // Assuming you have set up authentication and the user ID is available in the request object
    const userBlogs = await Blog.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]], // Optional: Order the blog posts by createdAt timestamp in descending order
    });

    // Render the dashboard page and pass the user's blog posts to the template
    res.render("dashboard", { blogs: userBlogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
module.exports = router;
