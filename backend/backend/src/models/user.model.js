import mongoose, {Schema} from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },

        fullname: {
            type: String,
            required: true,
        },

        password: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        role: {
            type: String,
            enum: ['student', 'tutor'],
            default: 'student'
        },

        subject: [String],

        rating: { type: Number, default: 5.0 },
        experience: { type: String, default: "Chưa cập nhật" }
    },

    {timestamps: true}
);

export const User = mongoose.model("User", userSchema)