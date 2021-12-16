const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// MongoDB SETUP
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const url = "mongodb://localhost:27017/";

// CREATE DATABASE
function createDatabase(dbName) {
  MongoClient.connect(url + dbName, (err, db) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Database named", dbName, "created.");
      db.close();
    }
  });
}

// CREATE COLLECTION
function createCollection(dbName = "testDB", cltName) {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      console.log(err);
    } else {
      const dbo = db.db(null);
      dbo.createCollection(cltName, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Collection named", cltName, "created.");
          db.close();
        }
      });
    }
  });
}

app
  .route("/items")

  // GET ALL ITEMS
  .get(function (req, res) {
    MongoClient.connect(url, (err, db) => {
      const dbo = db.db("testDB");
      dbo
        .collection("items")
        .find({})
        .toArray((err, results) => {
          console.log(results);
          res.send(results);
          db.close();
        });
    });
  })

  // ADD A NEW ITEM
  .post(function (req, res) {
    const itemName = req.body.name;
    const itemDes = req.body.des;

    MongoClient.connect(url, (err, db) => {
      const dbo = db.db("testDB");
      const newItem = { name: itemName, des: itemDes };
      dbo.collection("items").insertOne(newItem, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
          res.sendStatus(200);
          db.close();
        }
      });
    });
  });

// SPECIFIC ROUTE
app
  .route("/items/:itemId")

  // GET SPECIFIC ITEM
  .get(function (req, res) {
    const itemId = req.params.itemId;
    MongoClient.connect(url, (err, db) => {
      const dbo = db.db("testDB");
      dbo
        .collection("items")
        .findOne({ _id: ObjectId(itemId) }, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
            res.send(result);
            db.close();
          }
        });
    });
  })

  // DELETE SPECIFIC ITEM
  .delete(function (req, res) {
    const itemId = req.params.itemId;
    MongoClient.connect(url, (err, db) => {
      const dbo = db.db("testDB");
      dbo
        .collection("items")
        .deleteOne({ _id: ObjectId(itemId) }, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
            res.sendStatus(200);
            db.close();
          }
        });
    });
  })

  // UPDATE
  .patch(function (req, res) {
    const itemId = req.params.itemId;
    const newDescription = req.body.des;

    MongoClient.connect(url, (err, db) => {
      const dbo = db.db("testDB");
      dbo
        .collection("items")
        .updateOne(
          { _id: ObjectId(itemId) },
          { $set: { des: newDescription } },
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log(result);
              res.sendStatus(200);
              db.close();
            }
          }
        );
    });
  });

const port = process.env.port || 3000;
app.listen(port, () => console.log("running on", port));
