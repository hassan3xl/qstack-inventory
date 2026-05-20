import React from "react";

const AdditionalProductInfo = () => {
  return (
    <div className="mt-8 sm:mt-12 border-t border-border pt-6 sm:pt-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-muted p-4 sm:p-6 rounded-lg">
          <h3 className="font-semibold mb-3 text-base sm:text-lg">
            Shipping Info
          </h3>
          <p className="text-sm text-primary mb-2">
            Fast and reliable shipping to your doorstep.
          </p>
          <ul className="text-sm space-y-1 text-secondary">
            <li>• Standard: 5-7 business days</li>
            <li>• Express: 2-3 business days</li>
            <li>• Free shipping on orders over $50</li>
            <li>• International shipping available</li>
          </ul>
        </div>

        <div className="bg-muted p-4 sm:p-6 rounded-lg sm:col-span-2 lg:col-span-1">
          <h3 className="font-semibold mb-3 text-base sm:text-lg">
            Return Policy
          </h3>
          <p className="text-sm text-primary mb-2">
            Shop with confidence with our hassle-free returns.
          </p>
          <ul className="text-sm space-y-1 text-secondary">
            <li>• 30-day return window</li>
            <li>• Full refund or exchange</li>
            <li>• Free return shipping</li>
            <li>• No questions asked</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdditionalProductInfo;
