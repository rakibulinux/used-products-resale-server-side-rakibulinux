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

//Verify JWT function
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  // console.log(authHeader);
  if (!authHeader) {
    return res.status(403).send("Not authorization");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
    if (error) {
      return res.status(403).send({ message: "Forbidden" });
    }
    req.decoded = decoded;
    next();
  });
}

// Database Connection
const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const advertiseCollection = client.db("usedPhones").collection("advertise");
    const usersCollection = client.db("usedPhones").collection("users");
    const bookingsCollection = client.db("usedPhones").collection("bookings");
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

    // Verfy Admin function
    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const admin = await usersCollection.findOne(query);
      if (admin?.role !== "admin") {
        return res.status(403).send(`You dosen't have access to edit this`);
      }
      next();
    };

    // Verfy Seller function
    const verifySeller = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const seller = await usersCollection.findOne(query);
      if (seller?.role !== "seller") {
        return res.status(403).send(`You dosen't have access to edit this`);
      }
      next();
    };

    // Verfy Buyer function
    const verifyBuyer = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const buyer = await usersCollection.findOne(query);
      if (buyer?.role !== "buyer") {
        return res.status(403).send(`You dosen't have access to edit this`);
      }
      next();
    };

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

    //Post a products
    app.post(
      "/categoriesProducts",
      verifyJWT,
      verifySeller,
      async (req, res) => {
        const doc = req.body;
        const product = await categoriesProductsCollection.insertOne(doc);
        res.send(product);
      }
    );
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

    //Get specific post by email
    app.get(
      "/categoriesProducts",
      verifyJWT,
      verifySeller,
      async (req, res) => {
        const email = req.query.email;
        const decoedEmail = req.decoded.email;
        if (email !== decoedEmail) {
          return res.status(403).send({ message: "forbidden access" });
        }
        const query = { email: email };
        console.log(query);
        const products = await categoriesProductsCollection
          .find(query)
          .toArray();
        res.send(products);
      }
    );

    //Update advertise
    app.put(
      "/categoriesProducts/:id",
      verifyJWT,
      verifySeller,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const option = { upsert: true };
        const updateDoc = {
          $set: {
            advertise: "advertise",
          },
        };
        const updateProduct = await categoriesProductsCollection.updateOne(
          filter,
          updateDoc,
          option
        );

        res.send(updateProduct);
      }
    );

    //Post for advertise
    app.post("/advertise", verifyJWT, verifySeller, async (req, res) => {
      const doc = req.body;
      console.log(doc);
      const product = await advertiseCollection.insertOne(doc);
      res.send(product);
    });

    // Get All users
    app.get("/users", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
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

    // Get admin user permission
    app.get("/users/admin/:email", verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const adminUser = await usersCollection.findOne(query);
      res.send({ isAdmin: adminUser?.role === "admin" });
    });
    // Get seller user permission
    app.get(
      "/users/seller/:email",
      verifyJWT,
      verifySeller,
      async (req, res) => {
        const email = req.params.email;
        const query = { email };
        const sellerUser = await usersCollection.findOne(query);
        res.send({ isSeller: sellerUser?.role === "seller" });
      }
    );
    // Get buyer user permission
    app.get("/users/buyer/:email", verifyJWT, verifyBuyer, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const buyerUser = await usersCollection.findOne(query);
      res.send({ isBuyer: buyerUser?.role === "buyer" });
    });

    // Delete buyers or sellers
    app.delete("/users/admin/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const email = req.body.email;
      const filter = { _id: ObjectId(id) };
      const query = { email };
    });

    //Post booking
    app.post("/bookings", async (req, res) => {
      const book = req.body;
      const booking = await bookingsCollection.insertOne(book);
      res.send(booking);
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
