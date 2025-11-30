import axiosClient from "../api/axiosclient.ts";

interface InitBookingPayload {
    studentID: string;
    tutorId: string;
}

// 2. Hàm gọi API tạo booking nháp
export const createInitialBookingAPI = async (data: InitBookingPayload) => {
    // Gọi đường dẫn: http://localhost:8080/api/bookings/init
    const response = await axiosClient.post('/bookings/init', data);
    return response.data; // Trả về dữ liệu từ server
};

export const getBookingByIdAPI = async (id: string) => {
    const response = await axiosClient.get(`/bookings/${id}`);
    return response.data;
};

// 2. Cập nhật giờ giấc (Update)
export const updateBookingAPI = async (id: string, data: any) => {
    const response = await axiosClient.put(`/bookings/update/${id}`, data);
    return response.data;
};

// Lấy danh sách lịch của sinh viên
export const getStudentBookingsAPI = async (studentID: string) => {
    const response = await axiosClient.get(`/bookings/student/${studentID}`);
    return response.data;
};

// Hủy lịch hẹn
export const cancelBookingAPI = async (id: string) => {
    const response = await axiosClient.put(`/bookings/cancel/${id}`);
    return response.data;
};