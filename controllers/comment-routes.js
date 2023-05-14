const router = require("express").Router();
const { User, Blog, Comment } = require("../models");

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

router.post("/addcomment", async (req, res) => {
  try {
    // Extract the comment data from the request body
    const { content, userId, blogId } = req.body;

    // Ensure that userId and blogId are valid integers
    const parsedUserId = parseInt(userId);
    const parsedBlogId = parseInt(blogId);

    // Check if userId and blogId are valid numbers
    if (isNaN(parsedUserId) || isNaN(parsedBlogId)) {
      // Return an error response if userId or blogId is not a valid number
      return res.status(400).json({ error: "Invalid userId or blogId" });
    }

    // Create the new comment in the database
    const newComment = await Comment.create({
      content,
      userId: parsedUserId,
      blogId: parsedBlogId,
    });

    // Redirect the user to the blog post page or any other desired route
    res.redirect(`/post/${parsedBlogId}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
