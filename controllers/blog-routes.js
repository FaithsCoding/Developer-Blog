const router = require("express").Router();
const { User, Blog, Comment } = require("../models");

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
    const { title, excerpt, content, userId } = req.body;

    // Convert the userId to an integer
    const parsedUserId = parseInt(userId);

    // Create the new blog post in the database
    const newBlog = await Blog.create({
      title,
      excerpt,
      content,
      userId: parsedUserId,
    });

    // Redirect the user to the view blog post page for the newly created post
    res.redirect(`/post/${newBlog.id}`);
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error);
    res.status(500).json({ message: "Failed to create the blog post" });
  }
});

router.get("/post/:id", async (req, res) => {
  const blogId = req.params.id; // Get the blog post ID from the URL parameter
  try {
    // Fetch the blog post from the database based on the ID
    const blog = await Blog.findByPk(blogId, {
      include: [
        { model: User, as: "user" },
        {
          model: Comment,
          as: "comments",
          include: { model: User, as: "user" },
        }, // Include User model with the "user" alias
      ],
    });

    if (!blog) {
      // If the blog post is not found, you can handle the error or redirect to a 404 page
      return res.status(404).render("error", { error: "Blog post not found" });
    }

    // Extract the required properties from the blog and author objects
    const { title, excerpt, content, createdAt, updatedAt } = blog;
    const authorUsername = blog.user.username; // Access the author's username from the user association

    // Extract the comments from the blog object
    const comments = blog.comments.map((comment) => ({
      content: comment.content,
      username: comment.user.username,
      createdAt: formatDate(comment.createdAt),
    }));

    // Check if the user is authenticated
    const loggedIn = req.isAuthenticated();

    // Get the currently logged-in user ID
    const userId = req.user ? req.user.id : null;

    // Render the blog post view and pass the blog properties, author's username, blog post ID, and the user ID to the template
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

router.put("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;

    const post = await Post.findByPk(postId);

    if (!post) {
      // Handle post not found error
      return res.status(404).render("error", { error: "Post not found" });
    }

    // Update the post with the new data
    post.title = title;
    post.content = content;
    await post.save();

    // Redirect to the updated post
    res.redirect(`/posts/${postId}`);
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { error: "Server error" });
  }
});

router.post("/deletepost/:id", async (req, res) => {
  const blogId = req.params.id; // Get the blog post ID from the URL parameter

  try {
    // Find the blog post in the database based on the ID
    const blog = await Blog.findByPk(blogId);

    if (!blog) {
      // If the blog post is not found, you can handle the error or redirect to a 404 page
      return res.status(404).render("error", { error: "Blog post not found" });
    }

    // Delete the blog post from the database
    await blog.destroy();

    // Redirect the user to the dashboard page after successful deletion
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { error: "Server error" });
  }
});

router.put("/editpost/:id", async (req, res) => {
  const blogId = req.params.id; // Get the blog post ID from the URL parameter
  const { title, excerpt, content } = req.body; // Get the updated blog post data from the request body

  try {
    // Find the blog post in the database based on the ID
    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      // If the blog post is not found, you can handle the error or redirect to a 404 page
      return res.status(404).render("error", { error: "Blog post not found" });
    }

    // Update the blog post with the new data
    blog.title = title;
    blog.excerpt = excerpt;
    blog.content = content;
    blog.modified = new Date(); // Update the modified timestamp

    // Save the updated blog post to the database
    await blog.save();

    // Redirect the user to the edited blog post
    res.redirect(`/post/${blogId}`);
  } catch (err) {
    // Handle any errors that occur during the process
    console.error(err);
    res
      .status(500)
      .render("error", { error: "Failed to update the blog post" });
  }
});

router.get("/editpost/:id", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id; // Retrieve the user ID from the authenticated user
    const blogId = req.params.id; // Get the blog post ID from the URL parameter

    // Fetch the blog post from the database based on the ID and the user ID
    const blog = await Blog.findOne({
      where: { id: blogId, userId: userId },
      attributes: ["id", "title", "excerpt", "content"], // Specify the attributes you want to retrieve
    });

    if (!blog) {
      // If the blog post is not found, you can handle the error or redirect to a 404 page
      return res.status(404).render("error", { error: "Blog post not found" });
    }

    // Render the editpost view and pass the blog post data to the template
    res.render("editpost", { blog: blog.toJSON() }); // Convert blog object to JSON and pass it to the view
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { error: "Server error" });
  }
});

module.exports = router;
