const mongoose = require("mongoose");
let Schema = mongoose.Schema;

// connect to the localhost mongo running on default port 27017
mongoose.createConnection(
  "mongodb://USER-NAME:PASSWORD@ds141786.mlab.com:41786/web322_week8"
);

//create Schema
var contentSchema = new Schema({
  authorName: String,
  authorEmail: String,
  subject: String,
  commentText: String,
  postedDate: Date,
  replies: [
    {
      comment_id: String,
      authorName: String,
      authorEmail: String,
      commentText: String,
      repliedDate: Date
    }
  ]
});
//create a model called Comment
//create it in the collection web322_week8
//bassed on this schema contentSchema
var Comment = mongoose.model("web322_week8", contentSchema);
module.exports.initialize = function() {
  return new Promise(function(resolve, reject) {
    let db = mongoose.createConnection(
      "mongodb://USER-NAME:PASSWORD@ds141786.mlab.com:41786/web322_week8"
    );
    db.on("error", err => {
      console.log("db error!".red);
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      console.log("db success!".blue);
      Comment = db.model("comments", contentSchema);
      resolve();
    });
  });
};

module.exports.addComment = data => {
  return new Promise((resolve, reject) => {
    data.postedDate = Date.now();
    let newComment = new Comment(data);
    console.log(data);
    newComment.save(err => {
      if (err) {
        reject("There was an error saving the comment: ${err}");
      } else {
        resolve(newComment._id);
      }
    });
  });
};

module.exports.getAllComments = () => {
  return new Promise((resolve, reject) => {
    Comment.find({})
      .sort({ postedDate: 1 })

      .exec()
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject("Error message: ${err}");
      });
  });
};

module.exports.addReply = data => {
  return new Promise((resolve, reject) => {
    data.repliedDate = Date.now();
    Comment.update(
      { _id: data.comment_id },
      { $addToSet: { replies: data } },
      { multi: false }
    )
      .exec()
      .then(() => {
        resolve();
      })
      .catch(err => {
        console.log(err);
      });
  });
};
