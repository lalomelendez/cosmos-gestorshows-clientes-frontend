import { useState, useEffect } from "react";
import { fetchShows, sendOscPlay, sendOscStandby } from "../services/api";

function ShowPlayback() {
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      setLoading(true);
      const availableShows = await fetchShows();
      setShows(availableShows);
      setError(null);
    } catch (err) {
      setError("Failed to load shows");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowSelect = (showId) => {
    const show = shows.find((s) => s._id === showId);
    setSelectedShow(show);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  const handlePlay = async () => {
    if (!selectedShow) return;
  
    try {
      setError(null); // Clear previous errors
      await sendOscPlay(selectedShow._id, language);
      setIsPlaying(true);
    } catch (error) {
      console.error("Playback error details:", error);
      setError(
        language === "en"
          ? `Playback failed: ${error.message}`
          : `Error de reproducción: ${error.message}`
      );
    }
  };

  const handleStandby = async () => {
    if (!selectedShow) return;
    console.log('[Frontend] Initiating standby for show:', selectedShow._id);
  
    try {
      setError(null);
      console.log('[Frontend] Calling sendOscStandby');
      await sendOscStandby(selectedShow._id);
      console.log('[Frontend] Standby successful');
      setIsPlaying(false);
    } catch (error) {
      console.error('[Frontend] Standby error:', error);
      setError(
        language === "en"
          ? `Standby failed: ${error.message}`
          : `Error en standby: ${error.message}`
      );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {language === "en" ? "Show Playback" : "Reproducción del Show"}
      </h1>

      {/* Language Selector */}
      <div className="flex space-x-2">
  <button
    onClick={() => handleLanguageChange("en")}
    className={`px-4 py-2 rounded-md transition-all duration-200 ${
      language === "en"
        ? "bg-white shadow-md text-indigo-600"
        : "text-gray-600 hover:text-indigo-600"
    }`}
  >
    🇺🇸 English
  </button>
  <button
    onClick={() => handleLanguageChange("es")}  // Changed from "es-MX" to "es"
    className={`px-4 py-2 rounded-md transition-all duration-200 ${
      language === "es"  // Changed from "es-MX" to "es"
        ? "bg-white shadow-md text-indigo-600"
        : "text-gray-600 hover:text-indigo-600"
    }`}
  >
    🇲🇽 Español
  </button>
</div>

      {/* Show Selector */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {language === "en" ? "Select Show" : "Seleccionar Show"}
        </label>
        <select
          onChange={(e) => handleShowSelect(e.target.value)}
          value={selectedShow?._id || ""}
          className="w-full p-2 border rounded-md"
        >
          <option value="">
            {language === "en" ? "Choose a show..." : "Elegir un show..."}
          </option>
          {shows.map((show) => (
            <option key={show._id} value={show._id}>
              {new Date(show.startTime).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex justify-center space-x-4">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            disabled={!selectedShow || loading}
            className={`px-6 py-2 rounded-md ${
              !selectedShow || loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {language === "en" ? "Play" : "Reproducir"}
          </button>
        ) : (
          <button
            onClick={handleStandby}
            className="px-6 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            STAND BY
          </button>
        )}
      </div>
    </div>
  );
}

export default ShowPlayback;