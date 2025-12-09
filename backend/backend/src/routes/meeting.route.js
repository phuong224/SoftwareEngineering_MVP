import { Router } from "express";
import {
    // Meeting functions
    createMeeting,
    updateMeeting,
    cancelMeeting,
    getAllMeetings,
    getMeetingById,

    // Enrollment functions
    enrollInMeeting,
    cancelEnrollment,
    getStudentEnrollments
} from "../controller/meeting.controller.js";

const router = Router();

// === Routes cho Meetings (chủ yếu cho Tutor) /api/meetings/... ===
router.post('/', createMeeting);          // POST /api/meetings
router.get('/', getAllMeetings);           // GET  /api/meetings
router.get('/:id', getMeetingById);        // GET  /api/meetings/:id
router.put('/:id', updateMeeting);         // PUT  /api/meetings/:id
router.patch('/:id/cancel', cancelMeeting);// PATCH /api/meetings/:id/cancel

// === Routes cho Enrollments (chủ yếu cho Student) /api/meetings/.../enrollments ===
router.post('/:meetingId/enrollments', enrollInMeeting); // POST /api/meetings/{meetingId}/enrollments
router.delete('/:meetingId/enrollments/:enrollmentId', cancelEnrollment); // DELETE /api/meetings/{meetingId}/enrollments/{enrollmentId}

// Route để lấy các buổi học một sinh viên đã đăng ký.
// Để tiện lợi, ta sẽ tạo một route riêng cho enrollments.
router.get('/enrollments/student/:studentId', getStudentEnrollments); // GET /api/meetings/enrollments/student/:studentId

export default router;