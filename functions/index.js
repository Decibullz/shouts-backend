const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { firestore } = require("firebase-admin");

admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello World!");
});

exports.getShouts = functions.https.onRequest((req, res) => {
  admin
    .firestore()
    .collection("shouts")
    .get()
    .then((data) => {
      let shouts = [];
      data.forEach((doc) => {
        shouts.push(doc.data());
      });
      return res.json(shouts);
    })
    .catch((error) => console.error(error));
});

exports.createShout = functions.https.onRequest((req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method Not Allowed" });
  }
  const newShout = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
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
