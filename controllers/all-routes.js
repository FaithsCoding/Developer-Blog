const router = require("express").Router();
const { Blog } = require("../models");

router.get("/", async (req, res) => {
  try {
    // Fetch all blog posts from the database
    const blogPosts = await Blog.findAll({
      attributes: ["id", "title", "excerpt", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    // Extracts the required properties from each blog post
    const formattedBlogPosts = blogPosts.map((blog) => ({
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      createdAt: blog.createdAt,
    }));

    // Checks if the user is authenticated
    const loggedIn = req.isAuthenticated();

    // Renders the home page and pass the formatted blog posts, loggedIn status, and username to the template
    res.render("home", { blogPosts: formattedBlogPosts, loggedIn });
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

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/dashboard", async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  try {
    // Fetchs the user's blog posts from the database
    const userId = req.user.id;
    const userBlogs = await Blog.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    // Extracts the title, excerpt, and createdAt from each blog post
    const blogPosts = userBlogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      createdAt: blog.createdAt, // Include the createdAt value
    }));

    const username = req.user.username;

    // Renders the dashboard page and pass the extracted blog posts and username to the views
    res.render("dashboard", { blogPosts, loggedIn: true, username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
