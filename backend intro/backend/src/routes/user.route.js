import { Router } from "express";
import { createUser, getAllTutors, getUserProfile, updateUserProfile } from "../controller/user.controller.js";

const router = Router();

// 1. Đăng ký user mới (để test tạo data)
// URL sẽ là: POST /api/users/register
router.post('/register', createUser);

// 2. Lấy danh sách tất cả Tutor (để hiện lên trang chủ)
// URL sẽ là: GET /api/users/tutors
router.get('/tutors', getAllTutors);

// 3. Xem chi tiết hồ sơ 1 người
// URL sẽ là: GET /api/users/profile/12345abcdef
router.get('/profile/:id', getUserProfile);

// 4. Cập nhật thông tin profile
// URL sẽ là: PUT /api/users/profile/12345abcdef
router.put('/profile/:id', updateUserProfile);


export default router;