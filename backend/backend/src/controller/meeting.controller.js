import { Meeting } from '../models/meeting.model.js';
import { Enrollment } from '../models/enrollment.model.js';
import { User } from '../models/user.model.js';

// ==================================================
// Chức năng quản lý Meeting (dành cho Tutor)
// ==================================================

/**
 * @desc    Tạo một buổi học mới
 * @route   POST /api/meetings
 * @access  Private (Tutor)
 */
export const createMeeting = async (req, res) => {
    try {
        // Giả sử req.user.id chứa ID của user đã đăng nhập (từ middleware xác thực)
        const tutorId = req.body.tutorId; // Tạm thời lấy từ body để test

        const tutor = await User.findById(tutorId);
        if (!tutor || tutor.role !== 'tutor') {
            return res.status(403).json({ message: "Chỉ có gia sư mới được tạo buổi học" });
        }

        const newMeeting = new Meeting({
            ...req.body,
            tutor: tutorId,
        });

        await newMeeting.save();
        res.status(201).json({ message: "Tạo buổi học thành công", meeting: newMeeting });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

/**
 * @desc    Cập nhật thông tin buổi học
 * @route   PUT /api/meetings/:id
 * @access  Private (Tutor owner)
 */
export const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const tutorId = req.body.tutorId; // ID của người yêu cầu cập nhật

        const meeting = await Meeting.findById(id);

        if (!meeting) {
            return res.status(404).json({ message: "Không tìm thấy buổi học" });
        }

        // So sánh ID của tutor tạo meeting với ID của người yêu cầu
        if (meeting.tutor.toString() !== tutorId) {
            return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa buổi học này" });
        }

        const updatedMeeting = await Meeting.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        res.status(200).json({ message: "Cập nhật thành công", meeting: updatedMeeting });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

/**
 * @desc    Hủy một buổi học
 * @route   PATCH /api/meetings/:id/cancel
 * @access  Private (Tutor owner)
 */
export const cancelMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const tutorId = req.body.tutorId; // ID của người yêu cầu

        const meeting = await Meeting.findById(id);
        if (!meeting) {
            return res.status(404).json({ message: "Không tìm thấy buổi học" });
        }

        if (meeting.tutor.toString() !== tutorId) {
            return res.status(403).json({ message: "Bạn không có quyền hủy buổi học này" });
        }

        meeting.status = 'cancelled';
        await meeting.save();

        // Cũng có thể hủy tất cả các enrollment liên quan
        await Enrollment.updateMany({ meeting: id }, { status: 'cancelled' });

        res.status(200).json({ message: "Đã hủy buổi học", meeting });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

/**
 * @desc    Lấy tất cả các buổi học (có thể filter)
 * @route   GET /api/meetings
 * @access  Public
 */
export const getAllMeetings = async (req, res) => {
    try {
        const { tutorId } = req.query; // Lấy tutorId từ query params
        console.log("Backend nhận được tutorId:", tutorId); // <-- THÊM DÒNG NÀY

        // Chỉ lấy các buổi học chưa bị hủy và sắp diễn ra
        const filters = { 
            status: { $ne: 'cancelled' },
            // startTime: { $gte: new Date() } // Tạm thời bỏ dòng này để test
        };

        if (tutorId) {
            filters.tutor = tutorId; // Thêm bộ lọc theo gia sư nếu có
        }

        console.log("Đang tìm kiếm với bộ lọc:", filters); // <-- THÊM DÒNG NÀY

        const meetings = await Meeting.find(filters)
            .populate('tutor', 'fullname subject rating')
            .sort({ startTime: 1 }); // Sắp xếp theo thời gian sớm nhất

        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

/**
 * @desc    Lấy chi tiết một buổi học
 * @route   GET /api/meetings/:id
 * @access  Public
 */
export const getMeetingById = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
            .populate('tutor', 'fullname email subject rating experience');

        if (!meeting) {
            return res.status(404).json({ message: "Không tìm thấy buổi học" });
        }

        res.status(200).json(meeting);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ==================================================
// Chức năng quản lý Enrollment (dành cho Student)
// ==================================================

/**
 * @desc    Sinh viên đăng ký tham gia một buổi học
 * @route   POST /api/enrollments
 * @access  Private (Student)
 */
export const enrollInMeeting = async (req, res) => {
    try {
        const { studentId } = req.body; // Chỉ cần studentId từ body
        const { meetingId } = req.params; // Lấy meetingId từ URL params

        // Kiểm tra xem buổi học có tồn tại và còn chỗ không (logic thêm sau)
        const meeting = await Meeting.findById(meetingId);
        if (!meeting || meeting.status !== 'scheduled') {
            return res.status(400).json({ message: "Buổi học không tồn tại hoặc đã bắt đầu/bị hủy." });
        }

        const newEnrollment = new Enrollment({
            student: studentId,
            meeting: meetingId,
        });

        await newEnrollment.save();
        res.status(201).json({ message: "Đăng ký thành công!", enrollment: newEnrollment });

    } catch (error) {
        // Bắt lỗi unique index khi đăng ký trùng
        if (error.code === 11000) {
            return res.status(409).json({ message: "Bạn đã đăng ký buổi học này rồi." });
        }
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

/**
 * @desc    Sinh viên hủy đăng ký một buổi học
 * @route   DELETE /api/enrollments/:id
 * @access  Private (Student owner)
 */
export const cancelEnrollment = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { studentId } = req.body; // ID của người yêu cầu

        const enrollment = await Enrollment.findById(enrollmentId);

        if (!enrollment) {
            return res.status(404).json({ message: "Không tìm thấy lượt đăng ký này." });
        }

        if (enrollment.student.toString() !== studentId) {
            return res.status(403).json({ message: "Bạn không có quyền hủy đăng ký này." });
        }

        // Xóa hẳn bản ghi enrollment khỏi database
        await Enrollment.findByIdAndDelete(enrollmentId);

        res.status(200).json({ message: "Hủy đăng ký thành công." });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

/**
 * @desc    Lấy danh sách các buổi học mà một sinh viên đã đăng ký
 * @route   GET /api/students/:studentId/enrollments
 * @access  Private (Student owner)
 */
export const getStudentEnrollments = async (req, res) => {
    try {
        const { studentId } = req.params;

        const enrollments = await Enrollment.find({ student: studentId })
            .populate({
                path: 'meeting',
                populate: {
                    path: 'tutor',
                    select: 'fullname subject' // Chỉ lấy các trường cần thiết của tutor
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};