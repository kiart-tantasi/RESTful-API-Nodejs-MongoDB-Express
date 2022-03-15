require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// MongoDB SETUP
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const url = process.env.DB_URL;

// CREATE DATABASE
function createDatabase(dbName) {
  MongoClient.connect(url + dbName, (err, db) => {
    if (err) {
      db.close();
      console.log(err);
    } else {
      db.close();
      console.log("Database named", dbName, "created.");
    }
  });
}

// CREATE COLLECTION
function createCollection(dbName = "nameDB", cltName) {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      console.log(err);
    } else {
      const dbo = db.db(null);
      dbo.createCollection(cltName, (err, res) => {
        if (err) {
          db.close();
          console.log(err);
        } else {
          db.close();
          console.log("Collection named", cltName, "created.");
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
      const dbo = db.db(process.env.DB);
      dbo
        .collection("items")
        .find({})
        .toArray((err, results) => {
          db.close();
          res.send(results);
        });
    });
  })

  // ADD A NEW ITEM
  .post(function (req, res) {
    const itemName = req.body.name;
    const itemDesc = req.body.desc;

    MongoClient.connect(url, (err, db) => {
      const dbo = db.db(process.env.DB);
      const newItem = { name: itemName, desc: itemDesc };
      dbo.collection("items").insertOne(newItem, (err, result) => {
        if (err) {
          db.close();
          console.log(err);
        } else {
          db.close();
          res.sendStatus(200);
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
      const dbo = db.db(process.env.DB);
      dbo
        .collection("items")
        .findOne({ _id: ObjectId(itemId) }, (err, result) => {
          if (err) {
            db.close();
            console.log(err);
          } else {
            db.close();
            res.send(result);
          }
        });
    });
  })

  // DELETE SPECIFIC ITEM
  .delete(function (req, res) {
    const itemId = req.params.itemId;
    MongoClient.connect(url, (err, db) => {
      const dbo = db.db(process.env.DB);
      dbo
        .collection("items")
        .deleteOne({ _id: ObjectId(itemId) }, (err, result) => {
          if (err) {
            db.close();
            console.log(err);
          } else {
            db.close();
            res.sendStatus(200);
          }
        });
    });
  })

  // UPDATE
  .patch(function (req, res) {
    const itemId = req.params.itemId;
    const newDescription = req.body.desc;

    MongoClient.connect(url, (err, db) => {
      const dbo = db.db(process.env.DB);
      dbo
        .collection("items")
        .updateOne(
          { _id: ObjectId(itemId) },
          { $set: { desc: newDescription } },
          (err, result) => {
            if (err) {
              db.close();
              console.log(err);
            } else {
              db.close();
              res.sendStatus(200);
            }
          }
        );
    });
  });

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("running on", port));
