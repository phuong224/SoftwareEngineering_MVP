import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const SSOLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [warnBeforeLogin, setWarnBeforeLogin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin tài khoản và mật khẩu.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Gọi API xác thực SSO ở đây
    // Tạm thời redirect về trang home sau khi đăng nhập
    toast({
      title: "Đăng nhập thành công",
      description: "Chào mừng bạn trở lại!",
    });
    
    // Redirect về trang home (Index.tsx)
    navigate("/home");
  };

  const handleClear = () => {
    setUsername("");
    setPassword("");
    setWarnBeforeLogin(false);
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/hcmut.png" 
              alt="HCMUT Logo" 
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-2xl font-bold text-primary uppercase">
              DỊCH VỤ XÁC THỰC TẬP TRUNG
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Login Form */}
            <div>
              <h2 className="text-xl font-bold text-destructive mb-6">
                Nhập thông tin tài khoản của bạn
              </h2>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username">Tên tài khoản</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="w-full"
                  />
                </div>

                {/* Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="warn"
                    checked={warnBeforeLogin}
                    onCheckedChange={(checked) => setWarnBeforeLogin(checked === true)}
                  />
                  <Label
                    htmlFor="warn"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Cảnh báo trước khi tôi đăng nhập vào các trang web khác.
                  </Label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary-hover text-white flex-1"
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClear}
                    className="flex-1"
                  >
                    Xóa
                  </Button>
                </div>

                {/* Password Reset Link */}
                <div className="pt-2">
                  <a href="#" className="text-primary hover:underline text-sm">
                    Thay đổi mật khẩu?
                  </a>
                </div>
              </form>
            </div>

            {/* Right Column - Information */}
            <div className="space-y-6">
              {/* Language Options */}
              <div>
                <Label className="mb-2 block">Ngôn ngữ</Label>
                <div className="flex gap-4">
                  <a href="#" className="text-primary hover:underline font-medium">
                    Tiếng Việt
                  </a>
                  <a href="#" className="text-primary hover:underline">
                    Tiếng Anh
                  </a>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="font-semibold mb-3">Lưu ý</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Trang đăng nhập này cho phép bạn đăng nhập một lần (Single Sign-On) 
                    vào nhiều hệ thống web của Trường Đại học Bách Khoa - ĐHQG-HCM.
                  </p>
                  <p>
                    Bạn hãy sử dụng tài khoản HCMUT của mình để đăng nhập. Tài khoản này 
                    cho phép bạn truy cập vào các hệ thống thông tin, email và các tài nguyên khác.
                  </p>
                  <p>
                    Vì lý do bảo mật, bạn nên đăng xuất khỏi trình duyệt web sau khi hoàn thành 
                    các phiên làm việc đã được xác thực của mình.
                  </p>
                </div>
              </div>

              {/* Technical Support Section */}
              <div>
                <h3 className="font-semibold mb-3">Hỗ trợ kỹ thuật</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    Email:{" "}
                    <a href="mailto:support@hcmut.edu.vn" className="text-primary hover:underline">
                      support@hcmut.edu.vn
                    </a>
                  </p>
                  <p>ĐT: (84-8) 38647256 - 7204</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            Bản quyền © 2011 - 2012 Trường Đại học Bách khoa - ĐHQG-HCM.
          </p>
          <p>
            Thực hiện bởi{" "}
            <a href="#" className="text-primary hover:underline">
              SoftwareBK
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SSOLogin;

