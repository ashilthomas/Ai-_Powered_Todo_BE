import mongoose from "mongoose";
// mongoose.connect("mongodb://localhost:27017/todoApp", {


const connectToDatabase = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/todoApp", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  } 
};

export default connectToDatabase;
// });

// mongoose.connection.on("connected", () => {
//   console.log("Database connected successfully");
// });