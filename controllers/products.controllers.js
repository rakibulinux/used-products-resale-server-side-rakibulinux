const { verifyJWT } = require("../middleware/verifyJWT");
const { verifySeller } = require("../middleware/verifySeller");
const { getDb } = require("../utils/dbConnect");

module.exports = {
  getProductsByEmail: [
    verifyJWT,
    verifySeller,
    async (req, res, next) => {
      try {
        const db = getDb();
        const email = req.query.email;
        const decodedEmail = req.decoded.email;
        if (email !== decodedEmail) {
          return res.status(403).send({ message: "forbidden access" });
        }
        const query = { email: email };
        const products = await db.collection("products").find(query).toArray();
        res.send(products);
      } catch (error) {
        next(error);
      }
    },
  ],
};
