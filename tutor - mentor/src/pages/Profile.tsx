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
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getUserProfileAPI, updateUserProfileAPI } from "@/service/user.service";

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

const Profile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Form state
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [subject, setSubject] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [subjectInput, setSubjectInput] = useState("");

  useEffect(() => {
    loadProfile();
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
          <p>Không tìm thấy thông tin profile</p>
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
          Personal Profile Management
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
                    Personal Information
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

            {/* Teaching Schedule Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-card-foreground">
                    My Schedule
                  </h3>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  View More
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-card-foreground font-medium">
                      Calculus 1
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Time: 7:00 - 8:50 | 05/09/2025
                  </p>
                </div>
                <Separator />
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-card-foreground font-medium">
                      Physics 1
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Time: 9:00 - 10:50 | 05/09/2025
                  </p>
                </div>
                <Separator />
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-card-foreground font-medium">
                      General Chemistry
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Time: 14:00 - 15:50 | 05/09/2025
                  </p>
                </div>
              </div>
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


