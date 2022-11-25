const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;

// middlewares
app.use(cors());
app.use(express.json());

// Database Connection
const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const homesCollection = client.db("usedPhones").collection("home");
    const usersCollection = client.db("usedPhones").collection("users");
    const buyersCollection = client.db("usedPhones").collection("buyers");
    const sellersCollection = client.db("usedPhones").collection("sellers");
    const categoriesCollection = client
      .db("usedPhones")
      .collection("categories");
    const categoriesProductsCollection = client
      .db("usedPhones")
      .collection("categoriesProducts");
    const sellOldPhonesGuideCollection = client
      .db("usedPhones")
      .collection("sellOldPhones");

    // Get guide for used phone resale
    app.get("/usedPhonesGuide", async (req, res) => {
      const query = {};
      const usedPhonesGuide = await sellOldPhonesGuideCollection
        .find(query)
        .toArray();
      res.send(usedPhonesGuide);
    });

    // Get categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const categories = await categoriesCollection.find(query).toArray();
      res.send(categories);
    });

    //Get specific post by id
    app.get("/categoriesProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { categoryId: id };

      if (id === query.categoryId) {
        const products = await categoriesProductsCollection
          .find(query)
          .toArray();
        res.send(products);
      }
    });

    // Update users
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const option = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const updateUser = await usersCollection.updateOne(
        filter,
        updateDoc,
        option
      );

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ updateUser, token });
    });
    console.log("Database Connected...");
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Used Phones Resel Server is running...");
});

app.listen(port, () => {
  console.log(`Server is running...on ${port}`);
});
