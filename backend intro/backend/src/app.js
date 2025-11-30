import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import bookingRouter from "./routes/booking.route.js";

const app = express();
app.use(cors()); // Cho phép mọi nơi gọi vào (quan trọng nhất)
app.use(express.json());

app.use("/api/users", userRouter);

// Mọi cái gì bắt đầu bằng /api/bookings sẽ chui vào booking.route.js
app.use("/api/bookings", bookingRouter);

// Test thử trang chủ
app.get("/", (req, res) => {
    res.send("API Tutor App is running...");
});

export default app;
