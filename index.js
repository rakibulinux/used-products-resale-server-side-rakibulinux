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
    const homesCollection = client.db("usedProducts").collection("homes");
    const usersCollection = client.db("usedProducts").collection("users");
    const buyersCollection = client.db("usedProducts").collection("buyers");
    const sellersCollection = client.db("usedProducts").collection("sellers");

    console.log("Database Connected...");
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Used Products Resel Server is running...");
});

app.listen(port, () => {
  console.log(`Server is running...on ${port}`);
});
