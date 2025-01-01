"use client";

import { useNavigate, useParams } from "react-router-dom";

export default function MeetingExit() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const handleExitHome = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#2B3C71] text-white p-4">
      <h1 className="text-3xl font-light text-center mb-8">
        You left the meeting
      </h1>

      <div className="flex gap-4 justify-center mb-8">
        <button
          onClick={() => navigate("/videoCall", { state: { roomId } })} // Replace with actual rejoin logic
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          Rejoin
        </button>
        <button
          onClick={handleExitHome} // Navigate to home
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
