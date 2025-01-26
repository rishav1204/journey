import mongoose from "mongoose";
import { userSchema } from "../../../user-service/src/database/models/User.js";

// Register the User model in social service
const User = mongoose.model("User", userSchema);

export default User;
