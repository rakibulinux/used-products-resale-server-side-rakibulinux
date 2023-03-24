const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const connectionString = process.env.DB_URI;

const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

let dbConnection;
module.exports = {
  connectToServer: function (calllback) {
    client.connect(function (err, db) {
      if (err || !db) {
        return calllback(err);
      }
      dbConnection = db.db("usedPhones");
      console.log("Successfully Connect MongoDB");

      return calllback();
    });
  },

  getDb: function () {
    return dbConnection;
  },
};
