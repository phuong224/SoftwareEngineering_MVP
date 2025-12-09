import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
    {
        // Tham chiếu đến User có role là 'tutor'
        tutor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        startTime: {
            type: Date,
            required: true,
        },
        duration: { // Thời lượng tính bằng phút
            type: Number,
            required: true,
            default: 60,
        },
        type: {
            type: String,
            enum: ['online', 'offline'],
            required: true,
            default: 'online',
        },
        status: {
            type: String,
            enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
            default: 'scheduled',
        },
        meetingLink: { // Link tham gia buổi học (Zoom, Meet, etc.)
            type: String,
        },
        location: { // Địa điểm cho buổi học offline
            type: String,
            trim: true,
        }
    },
    { timestamps: true }
);

export const Meeting = mongoose.model("Meeting", meetingSchema);
