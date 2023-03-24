const { getDb } = require("../utils/dbConnect");

module.exports.getUsedPhoneGuide = async (req, res, next) => {
  try {
    const db = getDb();
    const query = {};
    const usedPhonesGuide = await db
      .collection("sellOldPhones")
      .find(query)
      .toArray();
    if (usedPhonesGuide) {
      return res.send(usedPhonesGuide);
    }
  } catch (error) {
    next(error);
  }
};
