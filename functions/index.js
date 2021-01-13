const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const express = require("express");
const app = express();

app.get("/shouts", (req, res) => {
  admin
    .firestore()
    .collection("shouts")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let shouts = [];
      data.forEach((doc) => {
        shouts.push({
          shoutId: doc.id,
          ...doc.data(),
        });
      });
      return res.json(shouts);
    })
    .catch((error) => console.error(error));
});

app.post("/shout", (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method Not Allowed" });
  }
  const newShout = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  admin
    .firestore()
    .collection("shouts")
    .add(newShout)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully ` });
    })
    .catch((err) => {
      res.status(500).json({ error: `somthing went wrong` });
      console.error(err);
    });
});

exports.api = functions.https.onRequest(app);
