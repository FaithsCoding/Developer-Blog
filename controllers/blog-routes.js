const router = require("express").Router();
const express = require("express");
const { User, Blog, Comment } = require("../models");
const methodOverride = require("method-override");

router.use(express.urlencoded({ extended: false }));
router.use(methodOverride("_method"));

//ensures user is aunthenticated before being able to add blogs
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
}

//uses a get method to create a blog
router.get("/createblog", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id; // Retrieves the user ID from the authenticated user
    const loggedIn = req.isAuthenticated();
    return res.render("createblog", { userId, loggedIn }); // Passes the user ID to the view & verifies whether the user is logged in
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//uses a post method to add a blog
router.post("/addblog", async (req, res) => {
  try {
    // Extracts the blog data from the request body
    const { title, excerpt, content, userId } = req.body;

    // Converts the userId to an integer
    const parsedUserId = parseInt(userId);

    // Creates the new blog post in the database
    const newBlog = await Blog.create({
      title,
      excerpt,
      content,
      userId: parsedUserId,
    });

    // Redirects the user to the view blog post page for the newly created post
    res.redirect(`/post/${newBlog.id}`);
  } catch (error) {
    // Handles any errors that occur during the process
    console.error(error);
    res.status(500).json({ message: "Failed to create the blog post" });
  }
});

router.get("/post/:id", async (req, res) => {
  const blogId = req.params.id; // Gets the blog post IDs from the URL parameter
  try {
    // Fetchs the blog posts from the database based on the ID
    const blog = await Blog.findByPk(blogId, {
      include: [
        { model: User, as: "user" },
        {
          model: Comment,
          as: "comments",
          include: { model: User, as: "user" },
        }, // Includes User model with the "user" alias
      ],
    });

    if (!blog) {
      // If the blog post is not found this handles the errors
      return res.status(404).render("error", { error: "Blog post not found" });
    }

    // Extracts the required properties from the blog and author objects
    const { title, excerpt, content, createdAt, updatedAt } = blog;
    const authorUsername = blog.user.username; // Access the author's username from the user association

    // Extracts the comments from the blog object
    const comments = blog.comments.map((comment) => ({
      content: comment.content,
      username: comment.user.username,
      createdAt: formatDate(comment.createdAt),
    }));

    // Checks if the user is authenticated
    const loggedIn = req.isAuthenticated();

    // Gets the currently logged-in user ID
    const userId = req.user ? req.user.id : null;

    // Renders the blog post view and pass the blog properties, author's username, blog post ID, and the user ID to the template
    res.render("post", {
      title,
      excerpt,
      content,
      createdAt,
      updatedAt,
      authorUsername,
      blogId, // Pass the blog post ID to the view
      comments, // Pass the comments to the view
      userId, // Pass the user ID to the view
      loggedIn, //check if site user is logged in
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { error: "Server error" });
  }
});

//uses a put method to update posts
router.put("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;

    const post = await Post.findByPk(postId);

    if (!post) {
      // Handle post not found error
      return res.status(404).render("error", { error: "Post not found" });
    }

    // Updates the post with the new data
    post.title = title;
    post.content = content;
    await post.save();

    // Redirects to the updated post
    res.redirect(`/posts/${postId}`);
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { error: "Server error" });
  }
});

//uses a post method to delete posts
router.post("/deletepost/:id", async (req, res) => {
  const blogId = req.params.id; // Gets the blog post ID from the URL parameter

  try {
    // Finds the blog post in the database based on the ID
    const blog = await Blog.findByPk(blogId);

    if (!blog) {
      // If the blog post is not found this handles the error
      return res.status(404).render("error", { error: "Blog post not found" });
    }

    // Deletes the blog post from the database
    await blog.destroy();

    // Redirects the user to the dashboard page after successful deletion
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { error: "Server error" });
  }
});

router.put("/editpost/:id", async (req, res) => {
  const blogId = req.params.id; // Gets the blog post ID from the URL parameter
  const { title, excerpt, content } = req.body; // Gets the updated blog post data from the request body

  try {
    // Finds the blog post in the database based on the ID
    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return res.status(404).render("error", { error: "Blog post not found" });
    }

    // Updates the blog post with the new data
    blog.title = title;
    blog.excerpt = excerpt;
    blog.content = content;
    blog.modified = new Date(); // Updates the modified timestamp

    // Saves the updated blog post to the database
    await blog.save();

    // Redirects the user to the edited blog post
    res.redirect(`/post/${blogId}`);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .render("error", { error: "Failed to update the blog post" });
  }
});

router.get("/editpost/:id", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const blogId = req.params.id;
    const loggedIn = req.isAuthenticated();

    const blog = await Blog.findOne({
      where: { id: blogId, userId: userId },
      attributes: ["id", "title", "excerpt", "content"],
    });

    if (!blog) {
      return res.status(404).render("error", { error: "Blog post not found" });
    }

    res.render("editpost", { blog: blog.toJSON(), loggedIn }); // Passes the `loggedIn` constant to the view
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { error: "Server error" });
  }
});

module.exports = router;
