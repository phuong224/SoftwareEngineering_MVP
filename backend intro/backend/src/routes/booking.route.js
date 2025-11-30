import { Router } from "express";
import { createInitBooking, updateBooking, cancelBooking, deleteBooking, getBookingById, getStudentBookings } from "../controller/booking.controller.js";


const router = Router();

// Routes cụ thể phải đặt TRƯỚC routes động (/:id)
router.post('/init', createInitBooking);
router.get('/student/:studentID', getStudentBookings);
router.put('/update/:id', updateBooking);
router.put('/cancel/:id', cancelBooking);

// Routes động đặt CUỐI
router.get('/:id', getBookingById);
router.delete('/:id', deleteBooking);

export default router;