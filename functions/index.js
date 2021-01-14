const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/FBAuth");
const { db } = require("./util/admin");
const {
  getAllShouts,
  postOneShout,
  getShout,
  commentOnShout,
  likeShout,
  unlikeShout,
  deleteShout,
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
app.delete("/shout/:shoutId", FBAuth, deleteShout);
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

exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate((snapshot) => {
    db.doc(`/shouts/${snapshot.data().shoutId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            shoutId: doc.id,
          });
        }
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.deleteNotificationOnUnlike = functions.firestore
  .document("likes/{id}")
  .onDelete((snapshot) => {
    db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate((snapshot) => {
    db.doc(`/shouts/${snapshot.data().shoutId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            shoutId: doc.id,
          });
        }
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
