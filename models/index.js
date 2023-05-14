const User = require("./User");
const Blog = require("./Blog");
const Comment = require("./Comment");

// Define associations
User.hasMany(Comment, {
  foreignKey: "userId",
  as: "comments",
});

Comment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Blog.hasMany(Comment, {
  foreignKey: "blogId",
  as: "comments",
});

Comment.belongsTo(Blog, {
  foreignKey: "blogId",
  as: "blog",
});

module.exports = { User, Blog, Comment };
