const { getDb } = require("../utils/dbConnect");

// Verfy Admin function
module.exports.verifyAdmin = async (req, res, next) => {
  try {
    const db = getDb();
    const decodedEmail = req.decoded.email;
    const query = { email: decodedEmail };
    console.log(query);
    const admin = await db.collection("users").findOne(query);
    console.log(admin);
    if (admin?.role !== "admin") {
      return res.status(403).send(`You dosen't have access to edit this`);
    }
  } catch (error) {
    next(error);
  }
};
