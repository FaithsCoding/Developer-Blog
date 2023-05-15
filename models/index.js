const User = require("./User");
const Blog = require("./Blog");
const Comment = require("./Comment");

// Define associations so sequelize can determine relationships between tables
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

//exports the models so they can be used globally
module.exports = { User, Blog, Comment };
