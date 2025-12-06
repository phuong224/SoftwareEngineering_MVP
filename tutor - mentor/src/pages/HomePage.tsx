import Layout from "@/components/Layout";

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Banner Section */}
      <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/hcmut.jpg" 
            alt="HCMUT Campus" 
            className="w-full h-full object-cover"
          />
          {/* Light overlay chỉ để text dễ đọc hơn */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Logo overlay top left */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
            <img 
              src="/logo.png" 
              alt="HCMUT Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-primary">HCMUT</span>
          </div>
        </div>

        {/* Text overlay top right */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
          <p className="text-sm md:text-base text-white font-medium bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">
            TRƯỜNG ĐẠI HỌC BÁCH KHOA
          </p>
        </div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              HCMUT MENTORING
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/95 max-w-2xl mx-auto drop-shadow-md">
              Personalized learning platform to develop skills and in-depth knowledge
            </p>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default HomePage;

