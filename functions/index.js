const functions = require("firebase-functions");
const app = require("express")();
const { getAllShouts, postOneScream } = require("./handlers/shouts");
const { signup, login, uploadImage } = require("./handlers/users");

const firebase = require("firebase");
const FBAuth = require("./util/FBAuth");

// Shout routes
app.post("/shout", FBAuth, postOneScream);
app.get("/shouts", getAllShouts);

// user route
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);
