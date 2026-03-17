"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function TermsAndPrivacyPage() {
  const [activeTab, setActiveTab] = useState("terms");

  const tabs = [
    { id: "terms", label: "Terms & Conditions" },
    { id: "privacy", label: "Privacy Policy" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6efe5] to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Legal Information
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Our booking terms and privacy policy
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2.5 px-3 text-sm font-medium rounded-md transition-all duration-200",
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Cards */}
        <Card className="p-6 bg-green-50 shadow-lg rounded-lg">
          {activeTab === "terms" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Terms & Conditions</h2>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">1. Booking Terms</h3>
                <p className="text-gray-600">
                  By making a booking through our website, you agree to provide
                  accurate and complete information. A booking is considered
                  confirmed once you receive a confirmation email from us.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">
                  2. Your Responsibilities
                </h3>
                <p className="text-gray-600">
                  You are responsible for ensuring all information provided
                  during the booking process is accurate and complete. This
                  includes but is not limited to full names, contact details,
                  and any special requirements.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">
                  3. Cancellation Policy
                </h3>
                <p className="text-gray-600">
                  Tour bookings can be modified or cancelled according to our
                  cancellation policy. Please contact us directly for any
                  changes to your booking. Cancellation terms may vary depending
                  on the specific tour and timing of cancellation.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">4. Disclaimer</h3>
                <p className="text-gray-600">
                  While we strive to ensure all tour information is accurate, we
                  reserve the right to modify tour itineraries and details when
                  necessary. We are not liable for circumstances beyond our
                  control that may impact tours.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">5. Updates to Terms</h3>
                <p className="text-gray-600">
                  We may update these terms of service at any time. Continued
                  use of our booking service following any changes constitutes
                  acceptance of the new terms.
                </p>
              </section>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">
                  1. Booking Information We Collect
                </h3>
                <p className="text-gray-600">
                  When you make a booking, we collect the following information:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Any special requirements or preferences you provide</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">
                  2. How We Use Your Information
                </h3>
                <p className="text-gray-600">We use your information to:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Process and confirm your tour bookings</li>
                  <li>Contact you about your booking</li>
                  <li>Provide customer support</li>
                  <li>Send important updates about your tour</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">
                  3. Information Protection
                </h3>
                <p className="text-gray-600">
                  We implement appropriate security measures to protect your
                  personal information. Your booking data is only accessed by
                  authorized personnel who need it to process your tour
                  arrangements.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">
                  4. Information Sharing
                </h3>
                <p className="text-gray-600">
                  We only share your information as necessary to fulfill your
                  tour booking. This may include sharing relevant details with
                  our tour operators and guides. We do not sell or share your
                  personal information with third parties for marketing
                  purposes.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold">5. Data Retention</h3>
                <p className="text-gray-600">
                  We retain your booking information for as long as necessary to
                  provide our services and comply with legal obligations. You
                  may request to review, update, or delete your personal
                  information at any time.
                </p>
              </section>
            </div>
          )}
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Last updated: November 14, 2024. If you have any questions about our
          terms or privacy policy, please contact us.
        </p>
      </div>
    </div>
  );
}
