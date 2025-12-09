import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, MapPin, X } from "lucide-react";
import { useState, useEffect } from "react"; 
import { useToast } from "@/hooks/use-toast";

// --- IMPORT SERVICE & CONSTANTS ---
import { getStudentEnrollmentsAPI, cancelEnrollmentAPI } from "@/service/meeting.service";

const CURRENT_STUDENT_ID = "69292f0a423919adced2aa8b";
// --- INTERFACE cho dữ liệu Enrollment trả về từ DB ---
interface Enrollment {
  _id: string; // ID của enrollment
  meeting: {
    _id: string; // ID của meeting
    tutor: {
        _id: string;
        fullname: string;
        subject: string[];
    };
    title: string;
    startTime: string;
    duration: number;
    type: "online" | "offline";
    location?: string;
  };
  status: "registered" | "attended" | "cancelled";
}

const Schedule = () => {
  // State chứa danh sách thật từ DB
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleCancelEnrollment = async (enrollment: Enrollment) => {
      if(window.confirm("Bạn có chắc chắn muốn hủy đăng ký buổi học này không?")) {
        try {
            await cancelEnrollmentAPI(enrollment.meeting._id, enrollment._id, CURRENT_STUDENT_ID);
            toast({ 
                title: "Đã hủy thành công", 
                description: "Bạn đã hủy đăng ký buổi học.",
                className: "bg-green-100 border-green-500 text-green-800"
            });            
            // Cập nhật UI ngay lập tức: Loại bỏ enrollment đã hủy khỏi danh sách
            setEnrollments(prevEnrollments =>
                prevEnrollments.filter(enr => enr._id !== enrollment._id)
            );
        } catch (error: any) {
            toast({ 
                title: "Lỗi", 
                description: error.response?.data?.message || "Không thể hủy đăng ký",
                variant: "destructive"
            });
        }
      }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        if (CURRENT_STUDENT_ID) {
          const listData = await getStudentEnrollmentsAPI(CURRENT_STUDENT_ID);
          setEnrollments(listData);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        toast({ title: "Lỗi", description: "Không thể tải danh sách lịch hẹn.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]); // Thêm toast vào dependency array

  const upcomingEnrollments = enrollments.filter(
      (enr) => enr.status === "registered"
  );
  
  const historyEnrollments = enrollments.filter(
      (enr) => enr.status === "attended" || enr.status === "cancelled"
  );

  // --- RENDER GIAO DIỆN ---
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Schedule</p>
            <h1 className="text-3xl font-bold text-foreground">Quản lý buổi tư vấn</h1>
          </div>
        </div>

        {/* --- SECTION 1: SẮP TỚI --- */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Lịch hẹn sắp tới</h2>
          
          {loading ? <p>Đang tải dữ liệu...</p> : (
            <div className="grid gap-4 md:grid-cols-2">
                {upcomingEnrollments.length === 0 && (
                    <Card className="p-8 text-center col-span-2"><p className="text-muted-foreground">Chưa có lịch hẹn nào.</p></Card>
                )}

                {upcomingEnrollments.map((enrollment) => {
                    const meeting = enrollment.meeting;
                    // 1. XỬ LÝ NGÀY
                    const dateDisplay = meeting.startTime 
                        ? new Date(meeting.startTime).toLocaleDateString("vi-VN") 
                        : "Chưa chốt";

                    // 2. XỬ LÝ GIỜ (Start - End)
                    const startStr = formatTime(meeting.startTime);
                    const endDateTime = new Date(new Date(meeting.startTime).getTime() + meeting.duration * 60000);
                    const endStr = formatTime(endDateTime.toISOString());
                    const timeRangeDisplay = `${startStr} - ${endStr}`;

                    // 3. XỬ LÝ ĐỊA ĐIỂM
                    const locationDisplay = meeting.type === "online" 
                        ? "Google Meet" 
                        : meeting.location || "Chưa cập nhật"; 

                    const tutorName = meeting.tutor?.fullname || "Gia sư";

                    return (
                        <Card key={enrollment._id} className="p-6 hover:shadow-md transition-shadow">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{meeting.title}</h3>
                                    <p className="text-sm font-medium text-muted-foreground">Gia sư: {tutorName}</p>
                                </div>
                                <Badge className={"bg-blue-500 hover:bg-blue-600"}>
                                    Đã đăng ký
                                </Badge>
                            </div>

                            <div className="mb-4 space-y-3 text-sm">
                                {/* Dòng 1: Ngày tháng */}
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium text-foreground/80">{dateDisplay}</span>
                                </div>

                                {/* Dòng 2: Giờ (Start - End) */}
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <span className="font-medium text-foreground/80">{timeRangeDisplay}</span>
                                </div>

                                {/* Dòng 3: Địa điểm */}
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    {meeting.type === "online" ? (
                                        <Video className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <MapPin className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="font-medium text-foreground/80">
                                        {locationDisplay}
                                    </span>
                                    {/* Badge nhỏ hiện online/offline */}
                                    <Badge variant="outline" className="text-[10px] h-5 px-2 uppercase ml-auto">
                                        {meeting.type}
                                    </Badge>
                                </div>
                            </div>
                            
                            {/* Nút Hủy */}
                            <div className="flex gap-2 mt-4 pt-4 border-t">
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="flex-1" 
                                    onClick={() => handleCancelEnrollment(enrollment)}
                                >
                                    <X className="mr-2 h-4 w-4" /> Hủy đăng ký
                                </Button>
                            </div>
                        </Card>
                    );
                  })}
            </div>
          )}
        </div>

        {/* --- SECTION 2: LỊCH SỬ --- */}
        {historyEnrollments.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Lịch sử</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {historyEnrollments.map((enrollment) => {
                 const meeting = enrollment.meeting;
                 const dateDisplay = meeting.startTime ? new Date(meeting.startTime).toLocaleDateString("vi-VN") : "N/A";
                 const tutorName = meeting.tutor?.fullname || "Gia sư";

                 return (
                    <Card key={enrollment._id} className="p-6 opacity-75">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                        <h3 className="text-lg font-semibold text-card-foreground">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground">Gia sư: {tutorName}</p>
                        </div>
                        <Badge variant={enrollment.status === 'cancelled' ? "destructive" : "secondary"}>
                            {enrollment.status === 'cancelled' ? "Đã hủy" : "Đã tham gia"}
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {dateDisplay}
                    </div>
                    </Card>
                 );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Schedule;

// Hàm chuyển đổi ISO date sang giờ phút (VD: 07:00)
const formatTime = (dateString?: string) => {
  if (!dateString) return "--:--";
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false // Dùng định dạng 24h (14:00) cho gọn
  });
};