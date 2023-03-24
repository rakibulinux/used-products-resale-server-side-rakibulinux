const { getDb } = require("../utils/dbConnect");

// Verfy Buyer function
module.exports.verifyBuyer = async (req, res, next) => {
  try {
    const db = getDb();
    const decodedEmail = req.decoded.email;
    const query = { email: decodedEmail };
    const buyer = await db.collection("users").findOne(query);
    console.log(buyer);
    if (buyer?.role !== "buyer") {
      return res.status(403).send(`You dosen't have access to edit this`);
    }
  } catch (error) {
    next(error);
  }
};
