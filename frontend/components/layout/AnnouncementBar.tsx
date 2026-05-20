import { Truck } from "lucide-react";
import React from "react";

const AnnouncementBar = () => {
  return (
    <div className="hidden w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <Truck className="h-4 w-4" />
        <span>Free Shipping on Orders Over $50 | 24/7 Customer Support</span>
      </div>
    </div>
  );
};
export default AnnouncementBar;
