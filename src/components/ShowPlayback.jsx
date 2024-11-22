import { useState, useEffect } from "react";
import { fetchShows, sendOscPlay, sendOscStandby, sendShowUserDetails, getShowById } from "../services/api";
import { useNavigate } from "react-router-dom";


function ShowPlayback() {
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUsers, setShowUsers] = useState([]);
const [loadingUsers, setLoadingUsers] = useState(false);

const navigate = useNavigate();



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

  const handleShowSelect = async (showId) => {
    const show = shows.find((s) => s._id === showId);
    setSelectedShow(show);
    
    if (showId) {
      setLoadingUsers(true);
      try {
        // Use the service function instead of direct fetch
        const showData = await getShowById(showId); // Add this function to api.js
        setShowUsers(showData.clients || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setError(language === "en" ? "Failed to load users" : "Error al cargar usuarios");
      } finally {
        setLoadingUsers(false);
      }
    } else {
      setShowUsers([]);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  const handlePlay = async () => {
    if (!selectedShow) return;
  
    try {
      setError(null);
      console.log('[Frontend] Sending user details for show:', selectedShow._id);
      
      // First send user details
      await sendShowUserDetails(selectedShow._id);
      console.log('[Frontend] User details sent successfully');
      
      // Then send play signal
      await sendOscPlay(selectedShow._id, language);
      console.log('[Frontend] Play signal sent successfully');
      
      setIsPlaying(true);
    } catch (error) {
      console.error("[Frontend] Playback error:", error);
      setError(
        language === "en"
          ? `Playback failed: ${error.message}`
          : `Error de reproducción: ${error.message}`
      );
      setIsPlaying(false);
    }
  };

  const handleStandby = async () => {
    if (!selectedShow) return;
    console.log('[Frontend] Initiating standby for show:', selectedShow._id);
  
    try {
      setError(null);
      await sendOscStandby(selectedShow._id);
      console.log('[Frontend] Standby successful, navigating to home');
      setIsPlaying(false);
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error("[Frontend] Standby error:", error);
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

      // Add Users Display Component after show selector
{selectedShow && (
  <div className="mt-6 bg-white rounded-lg shadow p-4">
    <h2 className="text-xl font-semibold mb-4">
      {language === "en" ? "Show Users" : "Usuarios del Show"}
    </h2>
    
    {loadingUsers ? (
      <div className="text-center text-gray-500">
        {language === "en" ? "Loading users..." : "Cargando usuarios..."}
      </div>
    ) : showUsers.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showUsers.map((user) => (
          <div key={user._id} className="border rounded-md p-3 bg-gray-50">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-600">
              <div>Energy: {user.energy}</div>
              <div>Element: {user.element}</div>
              <div>Essence: {user.essence}</div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center text-gray-500">
        {language === "en" ? "No users assigned" : "No hay usuarios asignados"}
      </div>
    )}
  </div>
)}

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