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
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: err.code });
    });
};

exports.postOneShout = (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method Not Allowed" });
  }

  const newShout = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };

  db.collection("shouts")
    .add(newShout)
    .then((doc) => {
      const resShout = newShout;
      resShout.shoutId = doc.id;
      res.json(resShout);
    })
    .catch((err) => {
      res.status(500).json({ error: `Something went wrong` });
      console.error(err);
    });
};

exports.getShout = (req, res) => {
  let shoutData = {};
  db.doc(`/shouts/${req.params.shoutId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Shout not found" });
      }
      shoutData = doc.data();
      shoutData.shoutId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("shoutId", "==", req.params.shoutId)
        .get();
    })
    .then((data) => {
      shoutData.comments = [];
      data.forEach((doc) => {
        shoutData.comments.push(doc.data());
      });
      return res.json(shoutData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
// comment on a shout

exports.commentOnShout = (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ comment: "Must not be empty" });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    shoutId: req.params.shoutId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
  };

  db.doc(`/shouts/${req.params.shoutId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "shout not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    });
};

exports.likeShout = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("shoutId", "==", req.params.shoutId)
    .limit(1);

  const shoutDocument = db.doc(`/shouts/${req.params.shoutId}`);

  let shoutData;

  shoutDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        shoutData = doc.data();
        shoutData.shoutId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Shout not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            shoutId: req.params.shoutId,
            userHandle: req.user.handle,
          })
          .then(() => {
            shoutData.likeCount++;
            return shoutDocument.update({ likeCount: shoutData.likeCount });
          })
          .then(() => {
            return res.json(shoutData);
          });
      } else {
        return res.status(400).json({ error: "Shout already liked" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.unlikeShout = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("shoutId", "==", req.params.shoutId)
    .limit(1);

  const shoutDocument = db.doc(`/shouts/${req.params.shoutId}`);

  let shoutData;

  shoutDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        shoutData = doc.data();
        shoutData.shoutId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Shout not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: "Shout not liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            shoutData.likeCount--;
            return shoutDocument.update({ likeCount: shoutData.likeCount });
          })
          .then(() => {
            res.json(shoutData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.deleteShout = (req, res) => {
  const document = db.doc(`/shouts/${req.params.shoutId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Shout not found" });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: "Not Authorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "Shout deleleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
