const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyCBXY9AAdiMD7tUkwVhXuTzt3IpJDEKWoQ",
  authDomain: "socialportfolio-155d8.firebaseapp.com",
  databaseURL: "https://socialportfolio-155d8-default-rtdb.firebaseio.com",
  projectId: "socialportfolio-155d8",
  storageBucket: "socialportfolio-155d8.appspot.com",
  messagingSenderId: "376488967565",
  appId: "1:376488967565:web:fa2b6b42d90de5e63951c4",
  measurementId: "G-1RLL1J2BZS",
};

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/shouts", (req, res) => {
  db.collection("shouts")
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

  db.collection("shouts")
    .add(newShout)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully ` });
    })
    .catch((err) => {
      res.status(500).json({ error: `somthing went wrong` });
      console.error(err);
    });
});

const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

const isEmail = (email) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
};

// signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = "Email is required";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(newUser.password)) errors.password = "Password is required";
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(newUser.handle)) errors.handle = "Handle is required";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);
  // TODO validate data
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.https.onRequest(app);
