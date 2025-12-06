import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="HCMUT Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-primary">HCMUT TUTOR</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* White Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <img 
                src="/logo.png" 
                alt="HCMUT Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>

            {/* Welcome Message */}
            <h1 className="text-2xl font-bold text-primary text-center">
              Chào mừng đến với HCMUT Tutor!
            </h1>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-primary hover:bg-primary-hover text-white"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary-light"
                onClick={() => navigate("/register")}
              >
                Đăng ký
              </Button>
            </div>

            {/* Separator */}
            <Separator />

            {/* Options */}
            <div className="flex items-center justify-between text-sm">
              <a href="#" className="text-primary hover:underline">
                Điều khoản
              </a>
              <div className="flex items-center gap-2">
                <Select defaultValue="vi">
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Vietnamese</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-auto">
        <div className="container mx-auto px-4">
          {/* Upper Footer Section */}
          <div className="text-center space-y-2 mb-6">
            <p className="text-sm text-muted-foreground">
              Dự án học tập – Môn Công nghệ phần mềm
            </p>
            <p className="text-sm text-muted-foreground">
              Đại học Bách Khoa - ĐHQG TP.HCM
            </p>
            <p className="text-sm text-muted-foreground">
              Nhóm phát triển: SoftwareBK
            </p>
          </div>

          {/* Lower Footer Section */}
          <div className="border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Trường Đại học Bách Khoa TP.HCM. Mọi quyền được bảo lưu.
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-sm text-muted-foreground">Made with</span>
              <div className="w-4 h-4 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">V</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

