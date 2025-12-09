import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Star, MapPin, Calendar, Clock, Video, BookOpen, Check } from "lucide-react";
import { useState, useEffect } from "react"; // <--- 1. Import useEffect
import { useToast } from "@/hooks/use-toast";
import { getAllMeetingsAPI, enrollInMeetingAPI, getStudentEnrollmentsAPI } from "@/service/meeting.service";
import { getAllTutorsAPI } from "@/service/user.service"; // <--- 2. Import API lấy tutor

// 3. Định nghĩa lại Interface cho khớp với MongoDB
interface Tutor {
  _id: string; // MongoDB dùng _id
  username: string; 
  fullname?: string; // Tên hiển thị (nếu có)
  subject: string[]; // Trong DB là mảng string
  rating?: number;     // Có thể trong DB chưa có nên để optional (?)
  experience?: string;
  location?: string;
  available?: boolean; // Nếu trong DB không có trường này, ta sẽ mặc định là true
}

// Interface cho Meeting (buổi học)
interface Meeting {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  duration: number;
  type: 'online' | 'offline';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meetingLink?: string;
  location?: string;
}

// Interface cho Enrollment (lượt đăng ký)
interface Enrollment {
  meeting: {
    _id: string;
  };
  // Các trường khác không cần thiết cho logic này
}

// ID của sinh viên đang đăng nhập (tạm thời hardcode)
const CURRENT_STUDENT_ID = "69292f0a423919adced2aa8b";

const Tutors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  // 4. Tạo State để chứa dữ liệu thật từ DB
  const [tutors, setTutors] = useState<Tutor[]>([]); 
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading cho chuyên nghiệp

  // --- NEW STATES FOR BOOKING DIALOG ---
  const [isMeetingsDialogOpen, setIsMeetingsDialogOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [tutorMeetings, setTutorMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrolledMeetingIds, setEnrolledMeetingIds] = useState<Set<string>>(new Set());

  const { toast } = useToast();

  // 5. Dùng useEffect để gọi API khi mới vào trang
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tutorData, enrollmentData]: [Tutor[], Enrollment[]] = await Promise.all([
          getAllTutorsAPI(),
          getStudentEnrollmentsAPI(CURRENT_STUDENT_ID)
        ]);

        // Xử lý dữ liệu tutors
        setTutors(tutorData);

        // Xử lý dữ liệu enrollments
        // Dùng Set để kiểm tra ID nhanh hơn
        const ids = new Set(enrollmentData.map((enr) => enr.meeting._id));
        setEnrolledMeetingIds(ids);

      } catch (error) {
        console.error("Lỗi tải dữ liệu ban đầu:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải dữ liệu trang.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]); // Chỉ chạy 1 lần khi component được mount

  // Logic lọc tìm kiếm (Search)
  const filteredTutors = tutors.filter((tutor) => {
    // Ưu tiên tìm theo fullName, nếu không có thì tìm theo username
    const displayName = tutor.fullname || tutor.username; 
    const subjectString = Array.isArray(tutor.subject) ? tutor.subject.join(" ") : tutor.subject;

    return (
        displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (subjectString && subjectString.toString().toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleOpenMeetingsDialog = async (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setIsMeetingsDialogOpen(true);
    setLoadingMeetings(true);
    try {
      const meetings = await getAllMeetingsAPI(tutor._id);
      setTutorMeetings(meetings);
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể tải danh sách buổi học của gia sư.", variant: "destructive" });
    } finally {
      setLoadingMeetings(false);
    }
  };

  const handleCloseMeetingsDialog = () => {
    setIsMeetingsDialogOpen(false);
    setSelectedTutor(null);
    setTutorMeetings([]);
  };

  const handleEnroll = async (meetingId: string) => {
    if (!selectedTutor) return;

    if (!window.confirm("Bạn có chắc chắn muốn đăng ký buổi học này?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      await enrollInMeetingAPI(meetingId, {
        studentId: CURRENT_STUDENT_ID,
      });

      toast({
        title: "Đăng ký thành công!",
        description: `Bạn đã đăng ký buổi học với gia sư ${selectedTutor.fullname || selectedTutor.username}.`,
        className: "bg-green-100 border-green-500 text-green-800"
      });

      // Cập nhật lại danh sách ID đã đăng ký
      setEnrolledMeetingIds(prevIds => new Set(prevIds).add(meetingId));

      handleCloseMeetingsDialog();
    } catch (error: any) {
      // Bắt lỗi đăng ký trùng
      if (error.response?.status === 409) {
        toast({ title: "Lỗi", description: "Bạn đã đăng ký buổi học này rồi.", variant: "destructive" });
      } else {
        toast({ title: "Lỗi", description: error.response?.data?.message || "Không thể đăng ký buổi học.", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Chọn Tutor</h1>
          <p className="text-muted-foreground">
            Tìm và chọn tutor phù hợp với nhu cầu học tập của bạn
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc môn học..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && <p className="text-center">Đang tải danh sách...</p>}

        {/* Tutors Grid */}
        {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
                <Card
                key={tutor._id} // MongoDB dùng _id
                className="p-6 hover:shadow-lg transition-all"
                >
                <div className="flex items-start justify-between mb-4">
                    <div>
                    <h3 className="text-xl font-semibold mb-1 text-card-foreground">
                        {/* Hiển thị tên (ưu tiên fullName, fallback username) */}
                        {tutor.fullname || tutor.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {/* Xử lý hiển thị mảng môn học */}
                        {Array.isArray(tutor.subject) ? tutor.subject.join(", ") : tutor.subject}
                    </p>
                    </div>
                    
                    {/* Nếu DB chưa có trường available, mặc định hiện Có sẵn */}
                    {tutor.available !== false ? (
                    <Badge className="bg-success text-success-foreground">Trực tuyến</Badge>
                    ) : (
                    <Badge variant="secondary">Bận</Badge>
                    )}
                </div>

                <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-warning fill-warning" />
                    <span className="text-card-foreground">
                        {tutor.rating ? tutor.rating : "5.0"}/5.0
                    </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{tutor.location || "Online/Offline"}</span>
                    </div>
                    <p className="text-muted-foreground">
                        Kinh nghiệm: {tutor.experience || "Chưa cập nhật"}
                    </p>
                </div>

                <Button
                    className="w-full"
                    onClick={() => handleOpenMeetingsDialog(tutor)}
                    disabled={tutor.available === false}
                >
                    <BookOpen className="mr-2 h-4 w-4" /> Xem các buổi học
                </Button>
                </Card>
            ))}
            </div>
        )}

        {!loading && filteredTutors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy tutor nào.</p>
          </div>
        )}

        {/* --- MEETINGS DIALOG --- */}
        <Dialog open={isMeetingsDialogOpen} onOpenChange={handleCloseMeetingsDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Các buổi học của {selectedTutor?.fullname || selectedTutor?.username}</DialogTitle>
              <DialogDescription>
                Chọn một buổi học có sẵn để đăng ký tham gia.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {loadingMeetings && <p className="text-center text-muted-foreground">Đang tải...</p>}
              {!loadingMeetings && tutorMeetings.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Gia sư này chưa có buổi học nào sắp diễn ra.</p>
                </div>
              )}
              {!loadingMeetings && tutorMeetings.map((meeting) => {
                const startTime = new Date(meeting.startTime);
                const endTime = new Date(startTime.getTime() + meeting.duration * 60000);
                const isEnrolled = enrolledMeetingIds.has(meeting._id);

                return (
                  <Card key={meeting._id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-card-foreground">{meeting.title}</h4>
                        {isEnrolled && (
                            <Badge variant="secondary" className="mt-1 bg-teal-100 text-teal-800 border-teal-300">
                                <Check className="mr-1 h-3 w-3"/> Đã đăng ký
                            </Badge>
                        )}
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{startTime.toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {meeting.type === 'online' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                            <span>{meeting.type === 'online' ? 'Online' : meeting.location || 'Offline'}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleEnroll(meeting._id)}
                        disabled={isSubmitting || meeting.status !== 'scheduled' || isEnrolled}
                      >
                        {meeting.status !== 'scheduled'
                          ? "Đã qua"
                          : isEnrolled
                            ? "Đã đăng ký"
                            : (isSubmitting ? "Đang xử lý..." : "Đăng ký")}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
};

export default Tutors;