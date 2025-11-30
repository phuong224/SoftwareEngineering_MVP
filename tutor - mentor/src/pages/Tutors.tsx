import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin } from "lucide-react";
import { useState, useEffect } from "react"; // <--- 1. Import useEffect
import { useToast } from "@/hooks/use-toast";
import { createInitialBookingAPI } from "@/service/booking.service.ts"; // Nhớ check lại đường dẫn import cho đúng
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

const Tutors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null); // Sửa thành string vì _id là string
  
  // 4. Tạo State để chứa dữ liệu thật từ DB
  const [tutors, setTutors] = useState<Tutor[]>([]); 
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading cho chuyên nghiệp

  const { toast } = useToast();

  // 5. Dùng useEffect để gọi API khi mới vào trang
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const data = await getAllTutorsAPI();
        setTutors(data);
      } catch (error) {
        console.error("Lỗi tải tutor:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải danh sách gia sư.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

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

  const handleSelectTutor = async (tutorId: string) => { // id là string
    try {
      toast({ title: "Đang xử lý...", description: "Đang kết nối với server." });

      // Gọi API tạo booking nháp
      const result = await createInitialBookingAPI({
          // Nếu bạn chưa có file constants, hãy thay tạm ID string cứng vào đây
          studentID: "69292f0a423919adced2aa8b", 
          tutorId: tutorId 
      });

      // Lưu bookingId vào LocalStorage
      localStorage.setItem("currentBookingId", result.bookingId);
      
      setSelectedTutor(tutorId);

      toast({
        title: "Đã chọn Tutor thành công!",
        description: "Vui lòng chuyển sang trang 'Lịch Trình' (Schedule) trên thanh menu để chọn giờ học.",
        duration: 3000,
        className: "bg-green-100 border-green-500 text-green-800"
      });

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể chọn tutor này. Vui lòng thử lại.",
      });
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
                className={`p-6 hover:shadow-lg transition-all ${
                    selectedTutor === tutor._id ? "ring-2 ring-primary" : ""
                }`}
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
                    onClick={() => handleSelectTutor(tutor._id)}
                    disabled={tutor.available === false || selectedTutor === tutor._id}
                >
                    {selectedTutor === tutor._id ? "Đã chọn" : "Chọn tutor"}
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
      </div>
    </Layout>
  );
};

export default Tutors;