import { User } from "../models/user.model.js";

// 1. Tạo User nhanh (để có dữ liệu test)
export const createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// 2. Lấy danh sách Tutor (để hiển thị lên trang chủ)
export const getAllTutors = async (req, res) => {
    try {
        // Chỉ tìm những người có role là 'tutor'
        const tutors = await User.find({ role: 'tutor' });
        res.status(200).json(tutors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// 3. Lấy thông tin chi tiết 1 người (cho trang Profile)
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// 4. Cập nhật thông tin profile
export const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, email, subject, experience, username } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }

        // Cập nhật các trường được phép chỉnh sửa
        if (fullname !== undefined) user.fullname = fullname;
        if (email !== undefined) {
            // Kiểm tra email đã tồn tại chưa (trừ chính user này)
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({ message: "Email đã được sử dụng bởi người khác" });
            }
            user.email = email;
        }
        if (subject !== undefined) user.subject = subject;
        if (experience !== undefined) user.experience = experience;
        if (username !== undefined) {
            // Kiểm tra username đã tồn tại chưa (trừ chính user này)
            const existingUser = await User.findOne({ username, _id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({ message: "Username đã được sử dụng bởi người khác" });
            }
            user.username = username;
        }

        await user.save();

        res.status(200).json({ 
            message: "Cập nhật profile thành công!", 
            user 
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi Server: " + error.message });
    }
}