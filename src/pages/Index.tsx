import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import BoniChat from "@/components/BoniChat";
import CartSidebar from "@/components/CartSidebar";
import Footer from "@/components/Footer";
import MobileBottomBar from "@/components/MobileBottomBar";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pb-20 md:pb-0">
        <Hero />
        <HowItWorks />
        <Categories onCategorySelect={setSelectedCategory} />
        <FeaturedProducts selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        <BoniChat />
      </main>
      <Footer />
      <CartSidebar />
      <MobileBottomBar />
    </div>
  );
};

export default Index;
