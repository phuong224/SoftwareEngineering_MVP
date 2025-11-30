import mongoose, {Schema} from "mongoose";

const bookingSchema = new Schema(
    {
        studentID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        tutorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        startTime: {
            type: Date
        },

        endTime: {
            type: Date
        },

        status: {
            type: String, 
            enum: ['pending', 'confirmed', 'cancelled', 'draft'], 
            default: 'draft'
        },

        meetingType: {
            type: String,
            enum: ['online', 'offline']
        },

        note: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema)

export default Booking