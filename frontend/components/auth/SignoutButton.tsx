"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SignoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SignoutButton: React.FC<SignoutButtonProps> = (props) => {
  const { signOut } = useAuth();

  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e);
    }
    await signOut();
  };

  return (
    <button
      {...props}
      onClick={handleSignOut}
      className={`flex items-center gap-2 w-full text-left ${props.className || ""}`}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
};

export default SignoutButton;