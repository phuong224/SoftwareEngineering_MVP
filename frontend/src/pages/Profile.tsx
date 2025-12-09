import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Edit, 
  CheckSquare, 
  Clock, 
  Shield, 
  Pencil,
  ExternalLink,
  // === IMPORT ICONS MỚI ===
  Video, 
  MapPin 
  // =========================
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// CHÚ Ý: CẬP NHẬT ĐƯỜNG DẪN SERVICE CHÍNH XÁC CỦA BẠN
import { getUserProfileAPI, updateUserProfileAPI } from "@/service/user.service"; 
import { getStudentEnrollmentsAPI } from "@/service/meeting.service";

const CURRENT_USER_ID = "69292f0a423919adced2aa8b"; // Tạm thời hardcode, sau này lấy từ auth

interface UserProfile {
  _id: string;
  username: string;
  fullname: string;
  email: string;
  role: string;
  subject?: string[];
  experience?: string;
  rating?: number;
}

// Interface cho dữ liệu Booking trả về (Dựa trên Appointment)
// Interface mới cho dữ liệu Meeting (Buổi học)
interface MeetingItem {
    _id: string;
    title: string;
    description?: string;
    startTime: string; 
    duration: number; // Tính bằng phút
    type: 'online' | 'offline';
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    meetingLink?: string;
    location?: string;
    tutor: { // Thông tin gia sư được populate
        _id: string;
        username: string;
        fullname?: string;
        subject?: string[]; 
    };
}

// Interface cho Enrollment trả về từ getStudentEnrollmentsAPI
// Dữ liệu này chứa Meeting được populate
interface EnrollmentItem {
    _id: string;
    student: string; // ID sinh viên
    meeting: MeetingItem; // Thông tin buổi học chi tiết
    createdAt: string;
}

// Hàm trợ giúp để xác định Badge hiển thị
const getStatusBadge = (status: MeetingItem['status']) => {
  switch (status) {
    case 'scheduled':
     return (
      <Badge 
        variant="secondary" 
        className="ml-auto text-xs font-normal bg-green-100 text-green-800 border-green-500"
      >
        Đã lên lịch
      </Badge>         
     );
    case 'ongoing':
     return (
      <Badge 
        variant="secondary" 
        className="ml-auto text-xs font-normal bg-blue-100 text-blue-800 border-blue-500"
      >
        Đang diễn ra
      </Badge>
     );
    case 'cancelled':
     return (
      <Badge 
        variant="secondary" 
        className="ml-auto text-xs font-normal bg-red-100 text-red-800 border-red-500"
      >
        Đã hủy
      </Badge>
     );
    case 'completed':
     default:
     return (
      <Badge 
        variant="secondary" 
        className="ml-auto text-xs font-normal bg-gray-100 text-gray-800 border-gray-500"
      >
        Hoàn thành
      </Badge>
     );
  }
};


const Profile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // State mới cho Lịch học (Bookings)
  const [schedule, setSchedule] = useState<EnrollmentItem[]>([]); // Đã cập nhật kiểu
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  
  // Form state
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [subject, setSubject] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [subjectInput, setSubjectInput] = useState("");

  useEffect(() => {
    loadProfile();
    // Gọi hàm tải lịch học
    loadSchedule(); 
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfileAPI(CURRENT_USER_ID);
      setProfile(data);
      setFullname(data.fullname || "");
      setEmail(data.email || "");
      setUsername(data.username || "");
      setSubject(data.subject || []);
      setExperience(data.experience || "");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm tải lịch học
  // Hàm tải lịch học (CẬP NHẬT LOGIC DÙNG ENROLLMENTS)
const loadSchedule = async () => {
    try {
      setLoadingSchedule(true);
      const now = new Date().getTime(); // Lấy timestamp hiện tại
      
      // Lấy danh sách Enrollments
      const allEnrollments: EnrollmentItem[] = await getStudentEnrollmentsAPI(CURRENT_USER_ID); 
      
      // Lọc: Chỉ lấy các meeting 'scheduled' hoặc 'ongoing' VÀ chưa kết thúc
      const relevantEnrollments = allEnrollments.filter(enrollment => {
          const meeting = enrollment.meeting;
          const isRelevantStatus = meeting.status === 'scheduled' || meeting.status === 'ongoing';
          
          // Tính thời gian kết thúc (endTime = startTime + duration phút)
          const startTimeMs = new Date(meeting.startTime).getTime();
          const durationMs = (meeting.duration || 60) * 60 * 1000; // Đổi phút sang ms
          const endTimeMs = startTimeMs + durationMs; 
          
          // Chỉ giữ lại những sự kiện chưa kết thúc (endTime ở tương lai)
          const isUpcoming = endTimeMs > now; 
          
          return isRelevantStatus && isUpcoming; 
      });
      
      // Sắp xếp theo thời gian bắt đầu (gần nhất lên đầu)
      relevantEnrollments.sort((a, b) => 
          new Date(a.meeting.startTime).getTime() - new Date(b.meeting.startTime).getTime()
      );
      
      // Chỉ lấy 3 buổi học gần nhất
      const nearestThree = relevantEnrollments.slice(0, 3);
      setSchedule(nearestThree);
      
    } catch (error: any) {
      console.error("Lỗi tải lịch học:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin lịch học",
        variant: "destructive"
      });
    } finally {
      setLoadingSchedule(false);
    }
};

const handleEditClick = () => {
  if (profile) {
    setFullname(profile.fullname || "");
    setEmail(profile.email || "");
    setUsername(profile.username || "");
    setSubject(profile.subject || []);
    setExperience(profile.experience || "");
    setIsEditOpen(true);
  }
};

const handleSaveEdit = async () => {
  if (!profile) return;

  try {
    await updateUserProfileAPI(profile._id, {
        fullname,
        email,
        username,
        subject,
        experience
    });

    toast({
        title: "Thành công!",
        description: "Đã cập nhật profile thành công",
        className: "bg-green-100 border-green-500 text-green-800"
    });

    setIsEditOpen(false);
    await loadProfile(); // Reload lại dữ liệu
  } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật profile",
        variant: "destructive"
    });
  }
};

const handleAddSubject = () => {
  if (subjectInput.trim() && !subject.includes(subjectInput.trim())) {
    setSubject([...subject, subjectInput.trim()]);
    setSubjectInput("");
  }
};

const handleRemoveSubject = (sub: string) => {
  setSubject(subject.filter(s => s !== sub));
};
  
  // Hàm trợ giúp để format thời gian và ngày từ ISO string
  // Hàm trợ giúp để format thời gian và ngày từ ISO string
const formatTimeRange = (isoString: string, duration: number) => {
    if (!isoString) return 'N/A';
    try {
        const startDate = new Date(isoString);
        const endDate = new Date(startDate.getTime() + duration * 60 * 1000); // Thêm duration (phút) vào startTime
        
        const startTime = startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const endTime = endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        return `${startTime} - ${endTime}`;
    } catch (e) { return 'N/A'; }
};

const formatDate = (isoString: string | undefined) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN');
    } catch (e) { return 'N/A'; }
};

if (loading) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <p>Đang tải...</p>
      </div>
    </Layout>
  );
}

if (!profile) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <p>Không tìm thấy thông tin</p>
      </div>
    </Layout>
  );
}

const initials = profile.fullname
  .split(" ")
  .map(n => n[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);
    
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">
          Quản lí thông tin cá nhân
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card - Left Side */}
          <Card className="lg:col-span-1 p-0 overflow-hidden">
            <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 relative">
              <img 
                src="/placeholder.svg" 
                alt="Profile background" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 text-center">
              <div className="w-24 h-24 mx-auto -mt-12 mb-4 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{initials}</span>
              </div>
              <h2 className="text-xl font-bold mb-2 text-card-foreground">
                {profile.fullname}
              </h2>
              <Badge variant="secondary" className="text-sm">
                {profile.role === 'tutor' ? 'Tutor' : 'Student'}
              </Badge>
            </div>
          </Card>

          {/* Right Side Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Thông tin cá nhân
                  </h3>
                </div>
                <Button variant="ghost" size="sm" className="text-primary" onClick={handleEditClick}>
                  Edit
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span className="text-card-foreground font-medium">
                    {profile.username}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-card-foreground font-medium">
                    {profile.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Họ tên:</span>
                  <span className="text-card-foreground font-medium">
                    {profile.fullname}
                  </span>
                </div>
                {profile.role === 'tutor' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Môn học:</span>
                      <span className="text-card-foreground font-medium">
                        {profile.subject && profile.subject.length > 0 
                          ? profile.subject.join(", ") 
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kinh nghiệm:</span>
                      <span className="text-card-foreground font-medium">
                        {profile.experience || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đánh giá:</span>
                      <span className="text-card-foreground font-medium">
                        {profile.rating ? `${profile.rating}/5.0` : "Chưa có"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Teaching Schedule Card (Lịch hẹn sắp tới - ĐÃ CẬP NHẬT) */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-muted-foreground" /> 
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Lịch của tôi
                  </h3>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  Xem tất cả
                </Button>
              </div>
              
              {/* HIỂN THỊ DỮ LIỆU BOOKING TỪ STATE */}
              {loadingSchedule ? (
        <p className="text-sm text-center text-muted-foreground">Đang tải lịch học...</p>
    ) : schedule.length === 0 ? (
        <p className="text-sm text-center text-muted-foreground">Không có buổi học sắp tới nào.</p>
    ) : (
        <div className="space-y-3">
            {schedule.map((enrollment, index) => {
                const item = enrollment.meeting; // Lấy thông tin Meeting
                return (
                    <div key={item._id}>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-card-foreground font-bold">
                                {item.title}
                            </span>
                            
                            {/* Hiển thị Badge theo trạng thái */}
                            {getStatusBadge(item.status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                            Gia sư: 
                            <span className="font-medium text-card-foreground ml-1">
                                {item.tutor.fullname || item.tutor.username}
                            </span>
                        </p>
                        
                        <p className="text-sm text-muted-foreground">
                            Thời gian:&nbsp;
                            <span className="font-bold text-card-foreground">
                                {formatTimeRange(item.startTime, item.duration)} | {formatDate(item.startTime)}
                            </span>
                        </p>
                        
                        {/* DÒNG MỚI: Hình thức và Địa điểm/Link */}
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            {item.type === 'online' ? (
                                <>
                                    <Video className="h-4 w-4 text-green-500" /> 
                                    <a 
                                        href={item.meetingLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Tham gia Online
                                    </a>
                                </>
                            ) : (
                                <>
                                    <MapPin className="h-4 w-4 text-red-500" /> 
                                    <span className="font-medium text-card-foreground">{item.location || "Chưa rõ địa điểm"}</span>
                                </>
                            )}
                        </p>

                        {/* Thêm Separator sau mỗi item, trừ item cuối cùng */}
                        {index < schedule.length - 1 && <Separator className="mt-3" />}
                    </div>
                );
            })}
        </div>
    )}
</Card>
          </div>
        </div>

        {/* Bottom Row Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Login Activity Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-card-foreground">
                  Login Activity
                </h3>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-card-foreground font-medium">
                    Windows Laptop
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  IP Address: 192.168.1.100
                </p>
                <p className="text-sm text-muted-foreground">
                  Time: 2 hours ago
                </p>
              </div>
              <Separator />
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-card-foreground font-medium">
                    Android Phone
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  IP Address: 10.0.0.50
                </p>
                <p className="text-sm text-muted-foreground">
                  Time: Yesterday
                </p>
              </div>
              <Separator />
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-card-foreground font-medium">
                    iOS Tablet
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  IP Address: 172.16.0.25
                </p>
                <p className="text-sm text-muted-foreground">
                  Time: 3 days ago
                </p>
              </div>
            </div>
          </Card>

          {/* Privacy Policy Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-card-foreground">
                  Privacy Policy
                </h3>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                Manage
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Overview of how your personal data is stored and how we protect it.
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Last Updated: 15/03/2024
              </p>
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                Read Full Policy
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Dialog Edit Profile */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa Profile</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cá nhân của bạn
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Họ tên</Label>
                <Input 
                  value={fullname} 
                  onChange={(e) => setFullname(e.target.value)} 
                  placeholder="Nhập họ tên"
                />
              </div>
              <div className="grid gap-2">
                <Label>Username</Label>
                <Input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Nhập username"
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Nhập email"
                />
              </div>
              {profile.role === 'tutor' && (
                <>
                  <div className="grid gap-2">
                    <Label>Kinh nghiệm</Label>
                    <Textarea 
                      value={experience} 
                      onChange={(e) => setExperience(e.target.value)} 
                      placeholder="Nhập kinh nghiệm giảng dạy"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Môn học</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={subjectInput} 
                        onChange={(e) => setSubjectInput(e.target.value)} 
                        placeholder="Nhập môn học"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubject();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddSubject}>Thêm</Button>
                    </div>
                    {subject.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {subject.map((sub, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveSubject(sub)}>
                            {sub} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveEdit}>
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Profile;