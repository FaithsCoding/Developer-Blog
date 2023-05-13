const router = require("express").Router();
const { User } = require("../models");
const { Blog } = require("../models");

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

router.get("/createblog", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id; // Retrieve the user ID from the authenticated user
    return res.render("createblog", { userId }); // Pass the user ID to the view
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/addblog", async (req, res) => {
  try {
    // Extract the blog data from the request body
    const { title, excerpt, content, image, userId } = req.body;

    // Convert the userId to an integer
    const parsedUserId = parseInt(userId);

    // Create the new blog post in the database
    const newBlog = await Blog.create({
      title,
      excerpt,
      content,
      image,
      userId: parsedUserId,
    });

    // Redirect or send a response indicating the success
    res
      .status(201)
      .json({ message: "Blog post created successfully", blog: newBlog });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error);
    res.status(500).json({ message: "Failed to create the blog post" });
  }
});

module.exports = router;
