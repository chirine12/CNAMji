
import React from 'react';
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HealthServices from "@/components/HealthServices";
import DocumentUpload from "@/components/DocumentUpload";
import ChatInterface from "@/components/ChatInterface";
import Footer from "@/components/Footer";


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <div className="container mx-auto px-4 py-8 space-y-12">
        <ChatInterface />
        <DocumentUpload />
        <HealthServices />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
