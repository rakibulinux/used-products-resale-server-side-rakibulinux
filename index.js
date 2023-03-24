const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { connectToServer } = require("./utils/dbConnect");
const { verifyAdmin } = require("./middleware/verifyAdmin");
const { verifyJWT } = require("./middleware/verifyJWT");
const { verifySeller } = require("./middleware/verifySeller");
const { verifyBuyer } = require("./middleware/verifyBuyer");
const getUsedPhoneGuide = require("./routes/usedPhonesGuide.route");
const getCategories = require("./routes/categories.route");
const errorHandler = require("./middleware/errorHandler");
const products = require("./routes/products.route");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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

connectToServer((err) => {
  if (!err) {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } else {
    console.log(err);
  }
});

// Get Used Phones Guide
app.use("/usedPhonesGuide", getUsedPhoneGuide);

// Get Categories
app.use("/categories", getCategories);

//Products Route
app.use("/products", products);

async function run() {
  try {
    const usersCollection = client.db("usedPhones").collection("users");
    const bookingsCollection = client.db("usedPhones").collection("bookings");
    const categoriesCollection = client
      .db("usedPhones")
      .collection("categories");
    const productsCollection = client.db("usedPhones").collection("products");
    const paymentsCollection = client.db("usedPhones").collection("payments");

    //Post a products
    app.post("/products", verifyJWT, verifySeller, async (req, res) => {
      const doc = req.body;
      const product = await productsCollection.insertOne(doc);
      res.send(product);
    });
    //Get specific post by id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { categoryId: id };

      if (id === query.categoryId) {
        const products = await productsCollection.find(query).toArray();
        res.send(products);
      }
    });

    //Get specific post by email

    //Delete specific post by id
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const products = await productsCollection.deleteOne(query);
      res.send(products);
    });

    //Update advertise
    app.put("/products/:id", verifyJWT, verifySeller, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          advertise: true,
        },
      };

      const updateProduct = await productsCollection.updateOne(
        filter,
        updateDoc,
        option
      );
      res.send(updateProduct);
    });

    //Get advertise Post
    app.get("/advertise", async (req, res) => {
      const advertise = req.query.advertise;
      const filter = { advertise: true };

      const product = await productsCollection.find(filter).toArray();
      res.send(product);
    });

    //Update advertise
    app.put("/statusChange/:id", verifyJWT, verifySeller, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Available",
        },
      };

      const updateProduct = await productsCollection.updateOne(
        filter,
        updateDoc,
        option
      );
      res.send(updateProduct);
    });
    app.put("/reportProduct/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          report: true,
        },
      };

      const updateProduct = await productsCollection.updateOne(
        filter,
        updateDoc,
        option
      );
      res.send(updateProduct);
    });

    // Get report product
    app.get("/reportProduct", async (req, res) => {
      const report = req.query.report;

      const query = { report: true };

      const reportProduct = await productsCollection.find(query).toArray();
      res.send(reportProduct);
    });

    // Get All users
    app.get("/users", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.put("/user/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          verify: true,
        },
      };

      const updateUser = await usersCollection.updateOne(
        filter,
        updateDoc,
        option
      );
      res.send(updateUser);
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

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1d",
        });
        return res.send({ usedPhoneToken: token });
      }
      res.status(401).send({ message: "Unauthorized" });
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

    app.get("/usersBuyer", async (req, res) => {
      const query = { role: "buyer" };

      const userRole = await usersCollection.find(query).toArray();
      res.send(userRole);
    });
    app.get("/usersSeller", async (req, res) => {
      const query = { role: "seller" };

      const userRole = await usersCollection.find(query).toArray();
      res.send(userRole);
    });

    // Delete buyers or sellers
    app.delete("/users/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const userDelete = await usersCollection.deleteOne(filter);
      res.send(userDelete);
    });

    //Get My orders
    app.get("/my-orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const orders = await bookingsCollection.find(query).toArray();
      res.send(orders);
    });
    app.post(
      "/create-payment-intent",
      verifyJWT,
      verifyBuyer,
      async (req, res) => {
        const booking = req.body;
        const price = booking.resalePrice;

        const amount = price * 100;
        const paymentIntent = await stripe.paymentIntents.create({
          currency: "usd",
          amount: amount,
          payment_method_types: ["card"],
        });
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      }
    );

    app.post("/payments", verifyJWT, verifyBuyer, async (req, res) => {
      const getBody = req.body;
      const payment = await paymentsCollection.insertOne(getBody);
      const id = getBody.bookingId;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: getBody.transactionId,
        },
      };

      const updatedPayment = bookingsCollection.updateOne(filter, updatedDoc);
      res.send(payment);
    });

    // Get bookings
    app.get("/bookings", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decoedEmail = req.decoded.email;
      if (email !== decoedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { email: email };
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });

    // Get one
    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking = await bookingsCollection.findOne(query);
      res.send(booking);
    });
    //Post booking
    app.post("/bookings", async (req, res) => {
      const book = req.body;
      const booking = await bookingsCollection.insertOne(book);
      res.send(booking);
    });
  } finally {
  }
}

run().catch((err) => console.error(err));

app.all("*", (req, res) => {
  res.send("No Route Found For This API Call");
});
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Used Phones Resale Server is running...");
});
