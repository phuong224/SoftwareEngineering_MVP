import mongoose, { Schema } from "mongoose";

const enrollmentSchema = new Schema(
    {
        // Tham chiếu đến User có role là 'student'
        student: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Tham chiếu đến buổi học mà sinh viên đăng ký
        meeting: {
            type: Schema.Types.ObjectId,
            ref: "Meeting",
            required: true,
        },
        status: {
            type: String,
            enum: ['registered', 'attended', 'cancelled'],
            default: 'registered',
        }
    },
    { timestamps: true }
);

// Đảm bảo một sinh viên không thể đăng ký cùng một buổi học nhiều lần
enrollmentSchema.index({ student: 1, meeting: 1 }, { unique: true });

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);