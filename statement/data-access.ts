import mongoose = require("mongoose");

const MONGODB_CONNECTION: string = "mongodb://localhost:27017/rlds-account";

class DataAccess {

  static mongooseInstance: any;
  static mongooseConnection: mongoose.Connection;

  constructor() {
    DataAccess.connect();
  }

  static connect() {
    if (this.mongooseInstance) {
      return this.mongooseInstance;
    }

    this.mongooseConnection = mongoose.connection;
    this.mongooseConnection.once("open", () => {
      console.log("Connected to mongoDb...");
    });

    this.mongooseInstance = mongoose.connect(MONGODB_CONNECTION, { useMongoClient: true });

    return this.mongooseInstance;
  }

}

mongoose.Promise = global.Promise;

DataAccess.connect();

export = DataAccess;