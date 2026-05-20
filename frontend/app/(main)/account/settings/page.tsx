import Header from "@/components/Header";
import { ThemeSwitcher } from "@/providers/theme-switcher";
import { ChevronRight } from "lucide-react";
import React from "react";

const SettingsPage = () => {
  return (
    <div className="">
      {/* Page Header */}
      <Header
        title="Account Settings"
        subtitle="Manage your account and settings"
        stats={[
          {
            title: "Theme",
            value: "",
            // change: "+20.1%",
            icon: <ThemeSwitcher />,
          },
        ]}
      />
    </div>
  );
};

export default SettingsPage;
