const { getDb } = require("../utils/dbConnect");

module.exports.getCategories = async (req, res, next) => {
  try {
    const db = getDb();
    const query = {};
    const categories = await db.collection("categories").find(query).toArray();
    res.send(categories);
  } catch (error) {
    next(error);
  }
};
