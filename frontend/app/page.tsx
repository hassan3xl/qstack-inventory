"use client";

import React from "react";
import Link from "next/link";
import {
  LogIn,
  BookOpen,
  MessageCircleQuestion,
  ArrowRight,
} from "lucide-react";
import { useModal } from "@/providers/ModalProvider";
import LoginForm from "@/components/auth/LoginForm";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import SendMessageForm from "@/components/SendMessageForm";

export default function LandingPage() {
  const { openModal } = useModal();

  const handleLoginClick = () => {
    // The LoginForm component already has its own max-w/shadow,
    // but the modal container adds background/border.
    // We render it directly, it should look fine.
    openModal(<LoginForm />);
  };

  const handleEnquiryClick = () => {
    openModal(<SendMessageForm source="inventory frontend" />);
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] opacity-50" />

      <div className="w-full max-w-5xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold tracking-widest uppercase">
            Welcome to QStack
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Quantum Stack Inventory
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your centralized command center for inventory management, stock
            alerts, and staff coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Login Card */}
          <button
            onClick={handleLoginClick}
            className="group text-left h-full focus:outline-none"
          >
            <div className="h-full bg-card/40 backdrop-blur-md border border-border/50 rounded-lg p-8 hover:bg-card/60 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl hover:shadow-primary/10 flex flex-col">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                <LogIn size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Login</h3>
              <p className="text-muted-foreground flex-1 mb-8">
                Access your secure dashboard to manage products, categories, and
                view real-time statistics.
              </p>
              <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                Access Account <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          </button>

          {/* Documentation Card */}
          <Link
            href="/docs"
            className="group text-left h-full focus:outline-none"
          >
            <div className="h-full bg-card/40 backdrop-blur-md border border-border/50 rounded-lg p-8 hover:bg-card/60 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 flex flex-col">
              <div className="w-14 h-14 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Documentation</h3>
              <p className="text-muted-foreground flex-1 mb-8">
                Read the comprehensive guide on how to use QStack Inventory
                effectively and efficiently.
              </p>
              <div className="flex items-center text-blue-500 font-semibold text-sm group-hover:gap-2 transition-all">
                Read Docs <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          </Link>

          {/* Enquiry Card */}
          <button
            onClick={handleEnquiryClick}
            className="group text-left h-full focus:outline-none"
          >
            <div className="h-full bg-card/40 backdrop-blur-md border border-border/50 rounded-lg p-8 hover:bg-card/60 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col">
              <div className="w-14 h-14 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageCircleQuestion size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Enquiry</h3>
              <p className="text-muted-foreground flex-1 mb-8">
                Have questions or need custom solutions? Reach out to our
                support team directly.
              </p>
              <div className="flex items-center text-emerald-500 font-semibold text-sm group-hover:gap-2 transition-all">
                Contact Us <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
