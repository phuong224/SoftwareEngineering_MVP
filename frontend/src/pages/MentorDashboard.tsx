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
import { Calendar, Clock, Video, MapPin, Edit, X, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ConsultationSession {
  id: number;
  subject: string;
  date: string;
  time: string;
  type: "online" | "offline";
  maxStudents: number;
  registeredStudents: number;
  status: "open" | "full" | "completed" | "cancelled";
}

const mockSessions: ConsultationSession[] = [
  {
    id: 1,
    subject: "Cấu trúc dữ liệu - Cây nhị phân",
    date: "2025-12-01",
    time: "14:00",
    type: "online",
    maxStudents: 10,
    registeredStudents: 7,
    status: "open",
  },
  {
    id: 2,
    subject: "Giải thuật - Thuật toán sắp xếp",
    date: "2025-12-03",
    time: "10:00",
    type: "offline",
    maxStudents: 15,
    registeredStudents: 15,
    status: "full",
  },
];

const MentorDashboard = () => {
  const [sessions, setSessions] = useState<ConsultationSession[]>(mockSessions);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ConsultationSession | null>(null);
  const { toast } = useToast();

  const handleCancelSession = (id: number) => {
    setSessions(sessions.map(session => 
      session.id === id ? { ...session, status: "cancelled" as const } : session
    ));
    toast({
      title: "Đã hủy buổi tư vấn",
      description: "Buổi tư vấn đã được hủy và thông báo đã được gửi đến sinh viên.",
    });
  };

  const handleEditSession = (session: ConsultationSession) => {
    setEditingSession(session);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingSession) {
      setSessions(sessions.map(session =>
        session.id === editingSession.id ? editingSession : session
      ));
      setIsEditOpen(false);
      toast({
        title: "Đã cập nhật buổi tư vấn",
        description: "Thông tin buổi tư vấn đã được cập nhật và thông báo đến sinh viên.",
      });
    }
  };

  const handleCreateSession = () => {
    setIsCreateOpen(false);
    toast({
      title: "Đã mở buổi tư vấn mới",
      description: "Buổi tư vấn mới đã được tạo thành công.",
    });
  };

  const activeSessions = sessions.filter(s => s.status === "open" || s.status === "full");
  const pastSessions = sessions.filter(s => s.status === "completed" || s.status === "cancelled");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Quản lý Buổi tư vấn</h1>
            <p className="text-muted-foreground">
              Mở, chỉnh sửa và quản lý các buổi tư vấn của bạn
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Mở buổi tư vấn mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Mở buổi tư vấn mới</DialogTitle>
                <DialogDescription>
                  Điền thông tin để mở buổi tư vấn cho sinh viên
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Chủ đề</Label>
                  <Input id="subject" placeholder="VD: Cấu trúc dữ liệu - Cây nhị phân" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Ngày</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Giờ</Label>
                  <Input id="time" type="time" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Hình thức</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hình thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Trực tuyến</SelectItem>
                      <SelectItem value="offline">Trực tiếp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max">Số lượng sinh viên tối đa</Label>
                  <Input id="max" type="number" placeholder="10" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea id="description" placeholder="Nội dung buổi tư vấn..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateSession}>Mở buổi tư vấn</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Sessions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Buổi tư vấn đang mở</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {activeSessions.map((session) => (
              <Card key={session.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1 text-card-foreground">
                      {session.subject}
                    </h3>
                  </div>
                  <Badge className={session.status === "full" ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground"}>
                    {session.status === "full" ? "Đã đầy" : "Còn chỗ"}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(session.date).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{session.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {session.type === "online" ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    <span>
                      {session.type === "online"
                        ? "Trực tuyến - Google Meet"
                        : "Trực tiếp - H1-101"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {session.registeredStudents}/{session.maxStudents} sinh viên
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditSession(session)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Đổi thông tin
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCancelSession(session.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hủy buổi
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {activeSessions.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Bạn chưa có buổi tư vấn nào đang mở</p>
            </Card>
          )}
        </div>

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Lịch sử</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pastSessions.map((session) => (
                <Card key={session.id} className="p-6 opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-card-foreground">
                        {session.subject}
                      </h3>
                    </div>
                    <Badge variant="secondary">
                      {session.status === "completed" ? "Đã hoàn thành" : "Đã hủy"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(session.date).toLocaleDateString("vi-VN")} - {session.time}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {session.registeredStudents} sinh viên đã tham gia
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Đổi thông tin buổi tư vấn</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin buổi tư vấn của bạn
              </DialogDescription>
            </DialogHeader>
            {editingSession && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-date">Ngày mới</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingSession.date}
                    onChange={(e) =>
                      setEditingSession({
                        ...editingSession,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-time">Giờ mới</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editingSession.time}
                    onChange={(e) =>
                      setEditingSession({
                        ...editingSession,
                        time: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-max">Số lượng sinh viên tối đa</Label>
                  <Input
                    id="edit-max"
                    type="number"
                    value={editingSession.maxStudents}
                    onChange={(e) =>
                      setEditingSession({
                        ...editingSession,
                        maxStudents: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MentorDashboard;
