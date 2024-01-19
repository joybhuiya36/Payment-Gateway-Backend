import mongoose from "mongoose";

const databaseConnection = async (callback: Function) => {
  try {
    if (process.env.DATABASE_URL) {
      const client = await mongoose.connect(process.env.DATABASE_URL);
      if (client) {
        console.log("Database Connection Successfully Made!");
        callback();
      } else {
        console.log("Database URL is not Provided!");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export default databaseConnection;
