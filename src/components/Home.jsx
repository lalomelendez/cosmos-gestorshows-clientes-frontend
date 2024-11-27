// src/components/Home.jsx
import { Link } from "react-router-dom";
import { sendOscStandby } from "../services/api"; // Import the function
import { useState } from "react";

function Home() {
  const [error, setError] = useState(null);

  const handleStandby = async () => {
    try {
      setError(null);
      console.log("[Home] Sending StandBy signal");

      // Call sendOscStandby without a showId or with a default value
      await sendOscStandby();

      console.log("[Home] StandBy signal sent successfully");
    } catch (error) {
      console.error("[Home] StandBy error:", error);
      setError("Failed to send StandBy signal");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8">
      <h1 className="text-4xl font-bold text-indigo-600 mb-4">
        Welcome to Cosmos
      </h1>
      <p className="text-xl text-gray-600 mb-12">Show Management System</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        <Link
          to="/create-show"
          className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-semibold text-indigo-600 mb-2">
            Schedule Show
          </h2>
          <p className="text-gray-600">
            Create and schedule new shows quickly
          </p>
        </Link>

        <Link
          to="/assign-users"
          className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-semibold text-indigo-600 mb-2">
            Manage Users
          </h2>
          <p className="text-gray-600">Assign users to scheduled shows</p>
        </Link>

        <Link
          to="/show-playback"
          className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-semibold text-indigo-600 mb-2">
            View Shows
          </h2>
          <p className="text-gray-600">Watch and manage show playbacks</p>
        </Link>
      </div>

      <div className="mt-12 flex gap-4">
        <Link
          to="/create-show"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Schedule New Show
        </Link>
        <Link
          to="/capture-photo"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Capture Photo
        </Link>
      </div>

      {error && <div className="text-red-500 mt-4">{error}</div>}

      {/* StandBy Button */}
      <div className="mt-8">
        <button
          onClick={handleStandby}
          className="px-6 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          STAND BY
        </button>
      </div>
    </div>
  );
}

export default Home;