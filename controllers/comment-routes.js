const router = require("express").Router();
const {Comment } = require("../models");

//this is a function to ensure the user is authenticated before being able to add comments
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

router.post("/addcomment", async (req, res) => {
  try {
    // Extracts the comment data from the request body
    const { content, userId, blogId } = req.body;

    // Ensure that userId and blogId are valid integers before being used
    const parsedUserId = parseInt(userId);
    const parsedBlogId = parseInt(blogId);

    // Checks if userId and blogId are valid numbers
    if (isNaN(parsedUserId) || isNaN(parsedBlogId)) {
      // Returns an error response if userId or blogId are not a valid number
      return res.status(400).json({ error: "Invalid userId or blogId" });
    }

    // Createa the new comment in the database and saves the content, userID and blogID
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
