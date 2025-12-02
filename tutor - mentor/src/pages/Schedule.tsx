import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Video, MapPin, Edit, X, Plus, User, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react"; 
import { useToast } from "@/hooks/use-toast";

// --- IMPORT SERVICE & CONSTANTS ---
import { getBookingByIdAPI, updateBookingAPI, getStudentBookingsAPI, cancelBookingAPI } from "@/service/booking.service";

const CURRENT_STUDENT_ID = "69292f0a423919adced2aa8b";
// --- INTERFACE (Chỉnh lại cho khớp dữ liệu trả về từ DB) ---
// Dữ liệu từ DB trả về sẽ có dạng này, ta cần map nó sang giao diện
interface Appointment {
  _id: string; // MongoDB ID
  tutorId: {
      _id: string;
      username: string;
      fullname?: string;
      subject?: string[];
  };
  startTime?: string;
  endTime?: string;
  meetingType: "online" | "offline";
  status: "pending" | "confirmed" | "cancelled" | "draft" | "completed";
  note?: string;
}

const Schedule = () => {
  // State chứa danh sách thật từ DB
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // State Booking Nháp (Draft) - Giữ nguyên logic chọn giờ
  const [draftBooking, setDraftBooking] = useState<any>(null); 
  
  // State Form nhập liệu cho Draft
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingType, setMeetingType] = useState("online");
  const [note, setNote] = useState("");

  // State Dialog (Giữ nguyên)
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  // --- [UI ONLY] XỬ LÝ NÚT SỬA ---
  // Chức năng: Đổ dữ liệu cũ vào Form và mở Dialog lên
  const handleEditClickUI = (apt: Appointment) => {
      if (!apt.startTime || !apt.endTime) {
          toast({ 
              title: "Lỗi", 
              description: "Lịch hẹn này chưa có thời gian cụ thể",
              variant: "destructive"
          });
          return;
      }
      
      const startDateObj = new Date(apt.startTime);
      const endDateObj = new Date(apt.endTime);
      
      const dateStr = startDateObj.toISOString().split('T')[0];
      
      const startStr = startDateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const endStr = endDateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

      setDate(dateStr);
      setStartTime(startStr);
      setEndTime(endStr);
      setMeetingType(apt.meetingType); 
      setNote(apt.note || "");
      setEditingAppointment(apt);
      setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
      if (!editingAppointment) return;
      if (!date || !startTime || !endTime) {
          toast({ title: "Thiếu thông tin", description: "Vui lòng chọn ngày và giờ!", variant: "destructive" });
          return;
      }
      try {
          const startDateTime = new Date(`${date}T${startTime}`);
          const endDateTime = new Date(`${date}T${endTime}`);

          if (startDateTime >= endDateTime) {
              toast({ title: "Lỗi thời gian", description: "Giờ kết thúc phải sau giờ bắt đầu", variant: "destructive" });
              return;
          }

          await updateBookingAPI(editingAppointment._id, {
              startTime: startDateTime,
              endTime: endDateTime,
              meetingType: meetingType,
              note: note
          });

          toast({ title: "Thành công!", description: "Đã cập nhật lịch học.", className: "bg-green-100 border-green-500 text-green-800" });
          
          setIsEditOpen(false);
          setEditingAppointment(null);
          // Reload lại danh sách
          const listData = await getStudentBookingsAPI(CURRENT_STUDENT_ID);
          setAppointments(listData);

      } catch (error: any) {
          toast({ title: "Lỗi", description: error.response?.data?.message || "Không thể cập nhật lịch hẹn", variant: "destructive" });
      }
  };

  const handleDeleteClickUI = async (id: string) => {
      if(window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) {
        try {
            await cancelBookingAPI(id);
            toast({ 
                title: "Đã hủy thành công", 
                description: "Lịch hẹn đã được hủy.",
                className: "bg-green-100 border-green-500 text-green-800"
            });
            // Reload lại danh sách
            const listData = await getStudentBookingsAPI(CURRENT_STUDENT_ID);
            setAppointments(listData);
        } catch (error: any) {
            toast({ 
                title: "Lỗi", 
                description: error.response?.data?.message || "Không thể hủy lịch hẹn",
                variant: "destructive"
            });
        }
      }
  }
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
        try {
            const storedBookingId = localStorage.getItem("currentBookingId");
            if (storedBookingId && storedBookingId !== "undefined") {
                try {
                    const draftData = await getBookingByIdAPI(storedBookingId);
                    if (draftData.status === 'draft') {
                        setDraftBooking(draftData);
                    } else {
                        localStorage.removeItem("currentBookingId");
                    }
                } catch (e) {
                    localStorage.removeItem("currentBookingId");
                }
            }

            if (CURRENT_STUDENT_ID) {
                const listData = await getStudentBookingsAPI(CURRENT_STUDENT_ID);
                setAppointments(listData);
            }

        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    loadData();
  }, []);

  
  const handleConfirmDraft = async () => {
    if (!date || !startTime || !endTime) {
       toast({ title: "Thiếu thông tin", description: "Vui lòng chọn ngày và giờ!", variant: "destructive" });
       return;
    }
    try {
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        if (startDateTime >= endDateTime) {
            toast({ title: "Lỗi thời gian", description: "Giờ kết thúc phải sau giờ bắt đầu", variant: "destructive" });
            return;
        }

        await updateBookingAPI(draftBooking._id, {
            startTime: startDateTime,
            endTime: endDateTime,
            meetingType: meetingType,
            note: note
        });

        toast({ title: "Thành công!", description: "Đã cập nhật lịch học.", className: "bg-green-100 border-green-500 text-green-800" });
        
        // Reset về màn hình danh sách
        localStorage.removeItem("currentBookingId");
        setDraftBooking(null);
        // Reload lại danh sách để hiện booking vừa tạo
        const listData = await getStudentBookingsAPI(CURRENT_STUDENT_ID);
        setAppointments(listData);

    } catch (error: any) {
        toast({ title: "Lỗi", description: error.response?.data?.message, variant: "destructive" });
    }
  };

  const handleCancelDraft = () => {
      localStorage.removeItem("currentBookingId");
      setDraftBooking(null);
  }

  const upcomingAppointments = appointments.filter(
      (apt) => (apt.status === "pending" || apt.status === "confirmed")
  );
  

  const historyAppointments = appointments.filter(
      (apt) => apt.status === "completed" || apt.status === "cancelled"
  );

  // --- RENDER GIAO DIỆN ---

  // 1. NẾU ĐANG CÓ DRAFT -> HIỆN FORM HOÀN TẤT (Giữ nguyên logic này để user điền giờ)
  if (draftBooking) {
    const tutorName = draftBooking.tutorId?.fullname || draftBooking.tutorId?.username || "Tutor";
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <Button variant="ghost" onClick={handleCancelDraft} className="mb-2 pl-0">← Quay lại danh sách</Button>
                    <h1 className="text-3xl font-bold text-primary mb-6">Hoàn tất đặt lịch với {tutorName}</h1>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Form Nhập liệu */}
                        <Card className="p-6 shadow-md md:col-span-2">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label>Ngày học</Label>
                                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Bắt đầu</Label>
                                        <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Kết thúc</Label>
                                        <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Hình thức</Label>
                                    <Select value={meetingType} onValueChange={setMeetingType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="online">Online</SelectItem>
                                            <SelectItem value="offline">Offline</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full mt-2" size="lg" onClick={handleConfirmDraft}>Xác nhận</Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
  }

  // 2. GIAO DIỆN DANH SÁCH (DÙNG DATA THẬT)
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Schedule</p>
            <h1 className="text-3xl font-bold text-foreground">Quản lý buổi tư vấn</h1>
          </div>
          {/* Nút tạo mới (Dialog) giữ nguyên nếu muốn, hoặc ẩn đi dùng flow Tutors */}
        </div>

        {/* --- SECTION 1: SẮP TỚI --- */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Lịch hẹn sắp tới</h2>
          
          {loading ? <p>Đang tải dữ liệu...</p> : (
            <div className="grid gap-4 md:grid-cols-2">
                {upcomingAppointments.length === 0 && (
                    <Card className="p-8 text-center col-span-2"><p className="text-muted-foreground">Chưa có lịch hẹn nào.</p></Card>
                )}

                {upcomingAppointments.map((apt) => {
                    // 1. XỬ LÝ NGÀY
                    const dateDisplay = apt.startTime 
                        ? new Date(apt.startTime).toLocaleDateString("vi-VN") 
                        : "Chưa chốt";

                    // 2. XỬ LÝ GIỜ (Start - End)
                    const startStr = formatTime(apt.startTime);
                    const endStr = formatTime(apt.endTime);
                    const timeRangeDisplay = apt.startTime && apt.endTime 
                        ? `${startStr} - ${endStr}` // Kết quả: 07:00 - 09:00
                        : "Chưa có giờ";

                    // 3. XỬ LÝ ĐỊA ĐIỂM (Hardcode theo yêu cầu)
                    const locationDisplay = apt.meetingType === "online" 
                        ? "Google Meet" 
                        : "H6-101"; 

                    const tutorName = apt.tutorId?.fullname || apt.tutorId?.username || "Gia sư";
                    const subject = Array.isArray(apt.tutorId?.subject) ? apt.tutorId.subject[0] : "Môn học";

                    return (
                        <Card key={apt._id} className="p-6 hover:shadow-md transition-shadow">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{subject}</h3>
                                    <p className="text-sm font-medium text-muted-foreground">Tutor: {tutorName}</p>
                                </div>
                                <Badge className={apt.status === 'pending' ? "bg-yellow-500 hover:bg-yellow-600" : "bg-primary hover:bg-primary/90"}>
                                    {apt.status === 'pending' ? "Chờ duyệt" : "Đã duyệt"}
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
                                    {apt.meetingType === "online" ? (
                                        <Video className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <MapPin className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="font-medium text-foreground/80">
                                        {locationDisplay}
                                    </span>
                                    {/* Badge nhỏ hiện online/offline */}
                                    <Badge variant="outline" className="text-[10px] h-5 px-3 uppercase ml-auto border-2">
                                        {apt.meetingType}
                                    </Badge>
                                </div>
                            </div>
                            
                            {/* Các nút bấm Edit/Cancel giữ nguyên */}
                            <div className="flex gap-2 mt-4 pt-4 border-t">
                                {/* Nút Sửa - Viền xám */}
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1" 
                                    onClick={() => handleEditClickUI(apt)}
                                >
                                    <Edit className="mr-2 h-4 w-4" /> Đổi lịch
                                </Button>

                                {/* Nút Xóa - Nền đỏ */}
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="flex-1" 
                                    onClick={() => handleDeleteClickUI(apt._id)}
                                >
                                    <X className="mr-2 h-4 w-4" /> Hủy lịch
                                </Button>
                            </div>
                        </Card>
                    );
                  })}
            </div>
          )}
        </div>

        {/* --- SECTION 2: LỊCH SỬ --- */}
        {historyAppointments.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Lịch sử</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {historyAppointments.map((apt) => {
                 const dateDisplay = apt.startTime ? new Date(apt.startTime).toLocaleDateString("vi-VN") : "N/A";
                 const tutorName = apt.tutorId?.fullname || apt.tutorId?.username || "Gia sư";
                 const subject = Array.isArray(apt.tutorId?.subject) ? apt.tutorId.subject[0] : "";

                 return (
                    <Card key={apt._id} className="p-6 opacity-75">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                        <h3 className="text-lg font-semibold text-card-foreground">{subject}</h3>
                        <p className="text-sm text-muted-foreground">Tutor: {tutorName}</p>
                        </div>
                        <Badge variant={apt.status === 'cancelled' ? "destructive" : "secondary"}>
                            {apt.status === 'cancelled' ? "Đã hủy" : "Hoàn thành"}
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

        {/* Dialog Edit Appointment */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Đổi lịch hẹn</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin lịch hẹn của bạn
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Ngày học</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Bắt đầu</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Kết thúc</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Hình thức</Label>
                <Select value={meetingType} onValueChange={setMeetingType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Ghi chú (tùy chọn)</Label>
                <Textarea 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  placeholder="Nhập ghi chú..."
                  rows={3}
                />
              </div>
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