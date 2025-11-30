import axiosClient from "../api/axiosclient.ts";

// Hàm gọi API lấy danh sách Tutor
export const getAllTutorsAPI = async () => {
    // Gọi vào đường dẫn Backend bạn đã định nghĩa: router.get('/tutors', getAllTutors);
    const response = await axiosClient.get('/users/tutors');
    return response.data;
};

// Lấy thông tin profile của user
export const getUserProfileAPI = async (id: string) => {
    const response = await axiosClient.get(`/users/profile/${id}`);
    return response.data;
};

// Cập nhật thông tin profile
export const updateUserProfileAPI = async (id: string, data: any) => {
    const response = await axiosClient.put(`/users/profile/${id}`, data);
    return response.data;
};