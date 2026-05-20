"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { sendMessageEndpoint } from "../lib/services/apiService";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SendMessageFormProps {
  source?: string;
}

export default function SendMessageForm({
  source = "quantum-stack",
}: SendMessageFormProps) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setStatus("loading");
    try {
      const payload = { ...data, source };

      const res = await fetch(`${sendMessageEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      setStatus("success");
      reset();

      // Reset status after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send us a message</CardTitle>
        <CardDescription>
          Fill out the form below and we&apos;ll get back to you shortly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-xl mb-2">Message Sent!</h3>
            <p className="text-muted-foreground">
              Thanks for reaching out. We will get back to you soon.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setStatus("idle")}
            >
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Input
              id="name"
              name="name"
              register={register}
              label="Name"
              placeholder="John Doe"
              disabled={status === "loading"}
              validation={{ required: "Name is required" }}
              error={errors.name}
            />
            <Input
              id="email"
              name="email"
              type="email"
              register={register}
              label="Email"
              placeholder="john@example.com"
              disabled={status === "loading"}
              validation={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              error={errors.email}
            />
            <Input
              id="subject"
              name="subject"
              register={register}
              label="Subject"
              placeholder="Project Inquiry"
              disabled={status === "loading"}
              validation={{ required: "Subject is required" }}
              error={errors.subject}
            />
            <div className="grid gap-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Tell us about your project..."
                disabled={status === "loading"}
                {...register("message", {
                  required: "Message is required",
                })}
              />
              {errors.message && (
                <span className="text-xs text-red-500 font-medium">
                  {errors.message.message}
                </span>
              )}
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <p>Something went wrong. Please try again.</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
