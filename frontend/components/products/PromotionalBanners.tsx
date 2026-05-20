import React from "react";
import { Button } from "../ui/button";

const PromotionalBanners = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <div className="relative bg-linear-to-r from-green-500 to-teal-600 rounded-2xl p-8 overflow-hidden h-64">
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-white mb-2">Free Shipping</h3>
          <p className="text-white mb-4">On orders over $50</p>
          <Button className="bg-white text-green-600 hover:bg-gray-100">
            Shop Now
          </Button>
        </div>
      </div>
      <div className="relative bg-linear-to-r from-pink-500 to-rose-600 rounded-2xl p-8 overflow-hidden h-64">
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-white mb-2">
            Member Exclusive
          </h3>
          <p className="text-white mb-4">Get 20% off your first order</p>
          <Button className="bg-white text-pink-600 hover:bg-gray-100">
            Join Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanners;
