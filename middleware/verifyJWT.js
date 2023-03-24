const jwt = require("jsonwebtoken");

//Verify JWT function
module.exports.verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader) {
      return res.status(403).send("Not authorization");
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      function (error, decoded) {
        if (error) {
          return res.status(403).send({ message: "Forbidden" });
        }
        req.decoded = decoded;
      }
    );
  } catch (error) {
    next(error);
  }
};
