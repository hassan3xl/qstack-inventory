"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { User, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/ToastProvider";
import { useModal } from "@/providers/ModalProvider";

export default function EnquiryForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const { closeModal } = useModal();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call, endpoint to be provided later by user
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addToast({
        title: "Enquiry Sent",
        description: "We have received your message and will get back to you shortly.",
        type: "success",
        duration: 4000,
      });
      closeModal();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to send enquiry. Please try again.",
        type: "error",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
        <p className="text-muted-foreground text-sm">
          Have questions about Quantum Stack? Send us a message.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <User size={18} />
            </div>
            <input
              required
              type="text"
              name="name"
              id="name"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail size={18} />
            </div>
            <input
              required
              type="email"
              name="email"
              id="email"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-muted-foreground">
              <MessageSquare size={18} />
            </div>
            <textarea
              required
              name="message"
              id="message"
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 resize-none"
              placeholder="How can we help you?"
            ></textarea>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Sending...
            </div>
          ) : (
            "Send Enquiry"
          )}
        </Button>
      </form>
    </div>
  );
}
