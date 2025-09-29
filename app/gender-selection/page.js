"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function GenderSelectionPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      signIn("google");
      return;
    }
    // If user already has gender, redirect to home
    if (session.user.gender) {
      router.push('/');
    }
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGender) {
      alert('Please select a gender option');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting gender:', selectedGender, 'for email:', session.user.email);
      
      const response = await axios.post("/api/user/update-gender", {
        email: session.user.email,
        gender: selectedGender
      });

      console.log('Response:', response.status, response.data);

      console.log('Gender updated successfully, redirecting to home...');
      // Small delay to ensure the database update is complete
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error("Failed to update gender:", error);
      alert(`Failed to update gender: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 pt-24">
      <div className="max-w-md w-full">
        {/* Pink's Ticket Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-pink-500 mb-2">Pink's Ticket</h1>
          <p className="text-gray-300">Complete your profile to continue</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
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

          {/* User Info */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-3 text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{session.user.name}</p>
                <p className="text-xs text-gray-400">{session.user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            This information helps us provide you with the best movie experience
          </p>
        </div>
      </div>
    </div>
  );
}