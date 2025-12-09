import axiosClient from "../api/axiosclient.ts";

// ==================================================
// Các hàm API liên quan đến Meeting
// ==================================================

/**
 * Lấy danh sách tất cả các buổi học (sắp diễn ra)
 */
export const getAllMeetingsAPI = async (tutorId?: string) => {
    const params = tutorId ? { tutorId } : {};
    const response = await axiosClient.get('/meetings', {
        params: params
    });
    return response.data;
};

/**
 * Lấy thông tin chi tiết của một buổi học
 * @param id - ID của buổi học
 */
export const getMeetingByIdAPI = async (id: string) => {
    const response = await axiosClient.get(`/meetings/${id}`);
    return response.data;
};

/**
 * Gia sư tạo một buổi học mới
 * @param data - Dữ liệu của buổi học (title, description, startTime, tutorId,...)
 */
export const createMeetingAPI = async (data: any) => {
    const response = await axiosClient.post('/meetings', data);
    return response.data;
};

// ==================================================
// Các hàm API liên quan đến Enrollment (Đăng ký)
// ==================================================

/**
 * Sinh viên đăng ký tham gia một buổi học
 * @param meetingId - ID của buổi học muốn đăng ký
 * @param data - Dữ liệu đăng ký (chủ yếu là studentId)
 */
export const enrollInMeetingAPI = async (meetingId: string, data: { studentId: string }) => {
    const response = await axiosClient.post(`/meetings/${meetingId}/enrollments`, data);
    return response.data;
};

/**
 * Sinh viên hủy đăng ký tham gia một buổi học
 * @param meetingId - ID của buổi học
 * @param enrollmentId - ID của lượt đăng ký
 */
export const cancelEnrollmentAPI = async (meetingId: string, enrollmentId: string, studentId: string) => {
    // Theo yêu cầu của backend, ta cần gửi studentId trong body của request DELETE để xác thực
    const response = await axiosClient.delete(`/meetings/${meetingId}/enrollments/${enrollmentId}`, {
        data: { studentId: studentId }
    });
    return response.data;
};

/**
 * Lấy danh sách các buổi học mà một sinh viên đã đăng ký
 * @param studentId - ID của sinh viên
 */
export const getStudentEnrollmentsAPI = async (studentId: string) => {
    const response = await axiosClient.get(`/meetings/enrollments/student/${studentId}`);
    return response.data;
};