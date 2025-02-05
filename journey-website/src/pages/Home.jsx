// src/pages/Home.jsx
import Navbar from "../components/layout/Navbar"; // Note: Changed from layouts to layout
import Footer from "../components/layout/Footer"; // Note: Changed from layouts to layout
import HeroSection from "../components/home/HeroSection";
import RecommendedSection from "../components/home/RecommendedSection";
import TestimonialSection from "../components/home/TestimonialSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <HeroSection />
        <RecommendedSection title="Recommended Hotels" type="hotels" />
        <RecommendedSection title="Tourist Spots" type="spots" />
        <RecommendedSection title="Activities" type="activities" />
        <RecommendedSection title="Restaurants" type="restaurants" />
        <RecommendedSection title="Food Joints" type="food" />
        <TestimonialSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
