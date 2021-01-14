const { db } = require("../util/admin");

exports.getAllShouts = (req, res) => {
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
};

exports.postOneScream = (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method Not Allowed" });
  }
  const newShout = {
    body: req.body.body,
    userHandle: req.user.handle,
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
};
