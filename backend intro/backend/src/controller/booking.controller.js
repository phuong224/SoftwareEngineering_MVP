import Booking from '../models/booking.model.js';

// 1. Chức năng chọn tutor
export const createInitBooking = async (req, res) => {
  try {
    const {studentID, tutorId} = req.body;

    const newBooking = new Booking({
      studentID,
      tutorId,
      status: 'draft'
    });

    await newBooking.save();

    res.status(201).json({ 
      message: "Chọn tutor thành công!", 
      bookingId: newBooking._id,
      booking: newBooking 
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params; 
        const { startTime, endTime, meetingType, note } = req.body;

        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({ message: "Không tìm thấy booking để update!" });
        }

        // Không cho đổi lịch nếu đã hủy
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: "Không thể đổi lịch đã bị hủy" });
        }

        // Validate thời gian nếu có cung cấp
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);

            // Kiểm tra thời gian hợp lệ
            if (start >= end) {
                return res.status(400).json({ message: "Giờ kết thúc phải sau giờ bắt đầu!" });
            }

            // Không cho đặt lịch trong quá khứ
            if (start < new Date()) {
                return res.status(400).json({ message: "Không thể đặt lịch trong quá khứ!" });
            }

            booking.startTime = start;
            booking.endTime = end;
        }

        // Cập nhật meetingType nếu có
        if (meetingType !== undefined) {
            if (!['online', 'offline'].includes(meetingType)) {
                return res.status(400).json({ message: "Meeting type phải là 'online' hoặc 'offline'" });
            }
            booking.meetingType = meetingType;
        }

        // Cập nhật note nếu có
        if (note !== undefined) {
            booking.note = note;
        }

        // Chỉ đổi status thành pending nếu đang là draft
        if (booking.status === 'draft') {
            booking.status = 'pending';
        }

        await booking.save();

        // Populate thông tin tutor và student trước khi trả về
        const updatedBooking = await Booking.findById(id)
            .populate('tutorId', 'username fullname email subject')
            .populate('studentID', 'username fullname email');

        res.status(200).json({ 
            message: "Đổi lịch thành công!", 
            booking: updatedBooking 
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi Server: " + error.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: "Không tìm thấy booking" });
        }

        // Kiểm tra nếu đã hủy rồi thì không cho hủy lại
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: "Lịch này đã được hủy trước đó" });
        }

        // Không cho hủy nếu lịch đã kết thúc
        if (booking.endTime && new Date(booking.endTime) < new Date()) {
            return res.status(400).json({ message: "Không thể hủy lịch đã kết thúc" });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Populate thông tin tutor và student trước khi trả về
        const cancelledBooking = await Booking.findById(id)
            .populate('tutorId', 'username fullname email subject')
            .populate('studentID', 'username fullname email');

        res.status(200).json({ 
            message: "Đã hủy lịch thành công", 
            booking: cancelledBooking 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa nháp 
export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking không tồn tại để xóa" });
        }

        res.status(200).json({ message: "Đã xóa vĩnh viễn booking khỏi hệ thống" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        // .populate('tutorId') là lệnh cực quan trọng!
        // Nó giúp lấy luôn thông tin (tên, email...) của ông Tutor dựa vào ID
        // Nếu không có nó, bạn chỉ nhận được chuỗi ID vô nghĩa "65f..."
        const booking = await Booking.findById(id).populate('tutorId', 'username fullname email subject'); 

        if (!booking) {
            return res.status(404).json({ message: "Không tìm thấy booking" });
        }

        res.status(200).json(booking);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Lấy danh sách booking của một sinh viên
export const getStudentBookings = async (req, res) => {
    try {
        const { studentID } = req.params;

        // Tìm booking của student này, sắp xếp cái mới nhất lên đầu
        const bookings = await Booking.find({ studentID: studentID })
            .populate('tutorId', 'username fullname subject email') // Lấy thông tin Tutor
            .sort({ createdAt: -1 }); // Mới nhất lên đầu

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};