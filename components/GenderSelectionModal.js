"use client";
import { useState } from "react";
import axios from "axios";

export default function GenderSelectionModal({ isOpen, onClose, user }) {
  const [selectedGender, setSelectedGender] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGender) return;

    setLoading(true);
    try {
      await axios.post("/api/user/update-gender", {
        email: user.email,
        gender: selectedGender
      });
      
      // Close modal and trigger parent refresh instead of full page reload
      onClose();
      
      // Small delay to ensure the database update is complete, then redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error("Failed to update gender:", error);
      alert("Failed to update gender. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the modal
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Pink's Ticket!</h2>
          <p className="text-gray-300 mb-3">Please select your gender to continue</p>
          <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
            <p className="text-pink-300 text-sm">
              <span className="font-semibold">Why we need this:</span> We use this information to provide better seating arrangements and ensure comfortable movie experiences for all our guests.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {[
              { value: "male", label: "Male", icon: "👨" },
              { value: "female", label: "Female", icon: "👩" },
              { value: "other", label: "Other", icon: "🧑" }
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedGender === option.value
                    ? "border-pink-500 bg-pink-500/10"
                    : "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={selectedGender === option.value}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="sr-only"
                />
                <span className="text-2xl mr-3">{option.icon}</span>
                <span className="text-white font-medium">{option.label}</span>
                {selectedGender === option.value && (
                  <svg className="w-5 h-5 text-pink-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                )}
              </label>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={!selectedGender || loading}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Continue to Pink's Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}