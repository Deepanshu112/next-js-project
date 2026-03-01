import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  refreshToken: {
    type: String,
    default: null
  }
});

export default mongoose.model("User", userSchema);
