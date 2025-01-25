import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({

    email: {type: String, required: true},
    otp: {type: String, required: true},
    type: {
        type: String,
        enum: ['SIGNUP', 'LOGIN', 'PASSWORD_RESET']
    },
    expiresAt: Date

});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
