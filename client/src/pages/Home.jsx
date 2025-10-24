import BenefitsSection from "../components/homeComponent/BenefitSection";
import FaqSection from "../components/homeComponent/FaqSection";
import Footer from "../components/Footer";
import HeroSection from "../components/homeComponent/HeroSection";
import Navbar from "../components/Navbar";
import VideoPreviewSection from "../components/homeComponent/VideoPreviewSection";
import TestimonialsSection from "../components/homeComponent/TestimonialsSection";
import TopCategories from "../components/homeComponent/TopCategories";

const Home = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <VideoPreviewSection />
      <BenefitsSection />
      <TopCategories />
      <TestimonialsSection />
      <FaqSection />
      <Footer />
    </div>
  );
}
export default Home