const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/FBAuth");
const {
  getAllShouts,
  postOneShout,
  getShout,
  commentOnShout,
  likeShout,
  unlikeShout,
} = require("./handlers/shouts");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");

// Shout routes
app.post("/shout", FBAuth, postOneShout);
app.get("/shouts", getAllShouts);
app.get("/shout/:shoutId", getShout);
// TODO delete shout
app.get("/shout/:shoutId/like", FBAuth, likeShout);
app.get("/shout/:shoutId/unlike", FBAuth, unlikeShout);
// TODO unlike shout
app.post("/shout/:shoutId/comment", FBAuth, commentOnShout);

// user route
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);
