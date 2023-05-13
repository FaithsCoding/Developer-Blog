const router = require("express").Router();
const bcrypt = require("bcrypt");
const { User } = require("../models");
const { Blog } = require("../models");

router.get("/", async (req, res) => {
  try {
    // Fetch all blog posts from the database
    const blogPosts = await Blog.findAll({
      attributes: ["id", "title", "excerpt", "createdAt"], // Specify the attributes you want to retrieve
      order: [["createdAt", "DESC"]], // Optional: Order the blog posts by createdAt timestamp in descending order
    });

    // Extract the required properties from each blog post
    const formattedBlogPosts = blogPosts.map((blog) => ({
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      createdAt: blog.createdAt,
    }));

    // Render the home page and pass the formatted blog posts to the template
    res.render("home", { blogPosts: formattedBlogPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
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
    res.redirect("/");
  });
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
      order: [["createdAt", "DESC"]],
    });

    // Extract the title, excerpt, and createdAt from each blog post
    const blogPosts = userBlogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      createdAt: blog.createdAt, // Include the createdAt value
    }));

    // Pass the username to the template
    const username = req.user.username;

    // Render the dashboard page and pass the extracted blog posts and username to the template
    res.render("dashboard", { blogPosts, loggedIn: true, username });
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
