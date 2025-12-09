import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import bookingRouter from "./routes/booking.route.js";
import meetingRouter from "./routes/meeting.route.js";

const app = express();
app.use(cors()); // Cho phép mọi nơi gọi vào (quan trọng nhất)
app.use(express.json());

app.use("/api/users", userRouter);

// Mọi cái gì bắt đầu bằng /api/bookings sẽ chui vào booking.route.js
app.use("/api/bookings", bookingRouter);

// Mọi request tới /api/meetings sẽ được xử lý bởi meetingRouter
app.use("/api/meetings", meetingRouter);

// Test thử trang chủ
// app.get("/", (req, res) => {
//     res.send("API Tutor App is running...");
// });

// trang chủ
import path from "path";
import { fileURLToPath } from "url";
// import express from "express";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));


// __dirname = /app/backend/src
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});




export default app;
