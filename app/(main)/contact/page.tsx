"use client";

import React, { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";
import Image from 'next/image';

import MapLoader from '@/components/ui/MapLoader';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}

interface ApiResponse {
  error?: string;
  message?: string;
}

export default function ContactSection() {
  const [formState, setFormState] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormState({
      fullName: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const data = (await response.json()) as ApiResponse;

      if (response.ok) {
        toast.success(data.message || "Message sent successfully!");
        resetForm();
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://www.facebook.com/forestlinetours",
      label: "Facebook",
    },
    {
      icon: Instagram,
      href: "https://www.instagram.com/forestlinetours",
      label: "Instagram",
    },
    {
      icon: Twitter,
      href: "https://www.twitter.com/forestlinetours",
      label: "Twitter",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-[#f6efe5] to-white">
      {/* Banner Section */}
      <div className="relative z-10 overflow-hidden bg-black text-white">
        <div className="h-40">
        <Image
        src="/images/hero_packages.jpg"
        alt="image"
        width={1920}
        height={160}
        className="z-1 absolute left-0 top-0 h-full w-full object-cover"
        priority
      />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg text-center px-4">
              Contact Us
            </h1>
          </div>
        </div>
        <div
          className="relative z-20 h-32 w-full -scale-y-[1] bg-contain bg-repeat-x"
          style={{
            backgroundImage: "url('/images/banner_style.png')",
            filter:
              "invert(92%) sepia(2%) saturate(1017%) hue-rotate(342deg) brightness(106%) contrast(93%)",
          }}
        />
      </div>

      {/* Contact Content */}
      <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-8 md:mb-12 lg:mb-16">
      <div className="inline-flex items-center justify-center mb-4 md:mb-6">
        <span className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-wide text-green-800 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
       Do you have any questions?
        </span>
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
      Chat <span className="text-green-600">With</span>{" "}
        US
      </h2>
    </div>

        <div className="overflow-hidden grid md:grid-cols-2 gap-8 md:gap-12 p-6 md:p-12 lg:p-16">
          {/* Left Column: Map and Contact Info */}
          <div className="space-y-8">
            {/* Map Section */}
            <div className="rounded-2xl overflow-hidden shadow-lg h-80 border-4 border-white">
              <MapLoader />
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-emerald-900">Contact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: Mail,
                    title: "Email",
                    content: "phamthanhtri@gmail.com",
                  },
                  {
                    icon: Phone,
                    title: "Số điện thoại",
                    content: "+84 901 234 567",
                  },
                  {
                    icon: MapPin,
                    title: "Địa chỉ",
                    content: "TP. Hồ Chí Minh, Việt Nam",
                  },
                  {
                    icon: Clock,
                    title: "Giờ làm việc",
                    content: "Thứ 2 - Thứ 7: 8:00 - 18:00",
                  },
                ].map(({ icon: Icon, title, content }, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Icon className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-medium">{title}</p>
                      <p className="text-sm font-semibold text-emerald-900">{content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="pt-6 border-t border-emerald-200">
                <p className="text-sm font-semibold text-emerald-900 mb-4">Follow Our Journey</p>
                <div className="flex space-x-4">
                  {socialLinks.map(({ icon: Icon, href, label }, index) => (
                    <a
                      key={index}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-emerald-100 rounded-full hover:bg-emerald-200 transition-colors group"
                      aria-label={`${label} link`}
                    >
                      <Icon className="w-5 h-5 text-emerald-700 group-hover:text-emerald-900" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-emerald-50">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Send a Message</h2>
            <p className="text-gray-500 mb-8">We usually respond within 24 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="fullName"
                    className="block mb-2 text-sm font-semibold"
                  >
                    Full Name
                    <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    className="w-full"
                    placeholder="John Doe"
                    value={formState.fullName}
                    onChange={(e) =>
                      setFormState({ ...formState, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="email"
                    className="block mb-2 text-sm font-semibold"
                  >
                    Email
                    <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="w-full"
                    placeholder="johndoe@example.com"
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="phone"
                  className="block mb-2 text-sm font-semibold"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  className="w-full"
                  placeholder="+2547000000"
                  value={formState.phone}
                  onChange={(e) =>
                    setFormState({ ...formState, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <Label
                  htmlFor="message"
                  className="block mb-2 text-sm font-semibold"
                >
                  Message
                  <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="message"
                  className="w-full h-32"
                  placeholder="Tell us about your dream eco-tour..."
                  value={formState.message}
                  onChange={(e) =>
                    setFormState({ ...formState, message: e.target.value })
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-base transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Start Your Journey"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
