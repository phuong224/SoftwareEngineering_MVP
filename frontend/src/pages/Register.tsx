import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thông báo",
      description: "Tính năng đăng ký đang được phát triển. Vui lòng liên hệ quản trị viên.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="HCMUT Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-primary text-center">
            Đăng ký tài khoản
          </h1>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@hcmut.edu.vn"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-hover text-white flex-1"
              >
                Đăng ký
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Đã có tài khoản? </span>
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:underline"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

