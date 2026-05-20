"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      title: "Summer Sale",
      subtitle: "Up to 50% Off",
      description:
        "Discover amazing deals on your favorite products. Limited time offer!",
      bgColor: "bg-blue-500",
      primaryBtn: "Shop Now",
      secondaryBtn: "Learn More",
    },
    {
      title: "New Arrivals",
      subtitle: "Fresh Styles",
      description:
        "Check out the latest trends and must-have items for the season.",
      bgColor: "bg-purple-500",
      primaryBtn: "Explore",
      secondaryBtn: "View Collection",
    },
    {
      title: "Winter Collection",
      subtitle: "Cozy & Warm",
      description:
        "Stay stylish and comfortable with our premium winter essentials.",
      bgColor: "bg-teal-500",
      primaryBtn: "Shop Winter",
      secondaryBtn: "See More",
    },
    {
      title: "Flash Deals",
      subtitle: "24 Hours Only",
      description:
        "Don't miss out on our exclusive flash deals. Grab them before they're gone!",
      bgColor: "bg-orange-500",
      primaryBtn: "Get Deals",
      secondaryBtn: "View All",
    },
    {
      title: "Premium Quality",
      subtitle: "Best Sellers",
      description:
        "Shop our most popular products trusted by thousands of customers.",
      bgColor: "bg-pink-500",
      primaryBtn: "Shop Best Sellers",
      secondaryBtn: "Learn Why",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: any) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 h-96">
      {/* Slides */}
      <div className="relative h-full">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            } ${banner.bgColor}`}
          >
            <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {banner.title}
                <br />
                {banner.subtitle}
              </h1>
              <p className="text-xl text-white mb-6 max-w-xl">
                {banner.description}
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  {banner.primaryBtn}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gray-900"
                >
                  {banner.secondaryBtn}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white rounded-full p-2 transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white rounded-full p-2 transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
