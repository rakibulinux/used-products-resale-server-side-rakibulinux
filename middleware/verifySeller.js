const { getDb } = require("../utils/dbConnect");

// Verfy Seller function
module.exports.verifySeller = async (req, res, next) => {
  try {
    const db = getDb();
    const decodedEmail = req.decoded.email;
    const query = { email: decodedEmail };
    const seller = await db.collection("users").findOne(query);
    console.log(seller);
    if (seller?.role !== "seller") {
      return res.status(403).send(`You dosen't have access to edit this`);
    }
  } catch (error) {
    next(error);
  }
};
