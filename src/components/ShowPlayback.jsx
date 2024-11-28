import { useState, useEffect } from "react";
import {
  fetchShows,
  updateShowStatus,
  sendOscStandby,
  capturePhoto,
  sendShowUserDetails,
  sendOscPlay,
} from "../services/api";

function ShowPlayback() {
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [success, setSuccess] = useState(null);

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
    setError(null);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  const handlePlay = async () => {
    if (!selectedShow) return;

    try {
      setError(null);
      console.log(
        "[Frontend] Starting play sequence for show:",
        selectedShow._id
      );

      // Get user IDs from selected show
      const userIds = selectedShow.clients.map((client) => client._id);
      console.log("[Frontend] User IDs:", userIds);

      // First send user details
      await sendShowUserDetails(selectedShow._id);
      console.log("[Frontend] User details sent successfully");

      // Then send play signal with user IDs
      await sendOscPlay(selectedShow._id, userIds, language);
      console.log("[Frontend] Play signal sent successfully");

      // Update show status
      const updatedShow = await updateShowStatus(
        selectedShow._id,
        "ha sido reproducido"
      );
      console.log("[Frontend] Show status updated");

      // Update local state
      setShows((prevShows) =>
        prevShows.map((show) =>
          show._id === updatedShow._id ? updatedShow : show
        )
      );

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
    try {
      await sendOscStandby(selectedShow._id);
      console.log("[Frontend] Standby signal sent");
    } catch (error) {
      console.error("[Frontend] Standby error:", error);
      setError(
        language === "en"
          ? `Standby failed: ${error.message}`
          : `Error en standby: ${error.message}`
      );
    }
  };

  const handleCapturePhoto = async () => {
    if (!selectedShow || !selectedShow.clients) return;

    setSuccess(null); // Clear previous success message
    try {
      const userIds = selectedShow.clients.map((client) => client._id);
      await capturePhoto(selectedShow._id, userIds);
      console.log("[Frontend] Photo captured for users:", userIds);

      setSuccess(
        language === "en"
          ? "Photo captured successfully"
          : "Foto capturada exitosamente"
      );
    } catch (error) {
      console.error("[Frontend] Photo capture error:", error);
      setError(
        language === "en"
          ? `Photo capture failed: ${error.message}`
          : `Error al capturar foto: ${error.message}`
      );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {language === "en" ? "Show Playback" : "Reproducción del Show"}
      </h1>

      {/* Language Selector */}
      <div className="mb-6 flex items-center space-x-4">
        <span className="text-gray-700 font-medium">
          {language === "en" ? "Language:" : "Idioma:"}
        </span>
        <div className="flex bg-gray-100 rounded-lg p-1">
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
            onClick={() => handleLanguageChange("es")}
            className={`px-4 py-2 rounded-md transition-all duration-200 ${
              language === "es"
                ? "bg-white shadow-md text-indigo-600"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            🇲🇽 Español
          </button>
        </div>
      </div>

      {/* Show Selector */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {language === "en" ? "Select Show" : "Seleccionar Show"}
        </label>
        <select
          onChange={(e) => handleShowSelect(e.target.value)}
          value={selectedShow?._id || ""}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          <option value="">
            {language === "en" ? "Choose a show..." : "Elegir un show..."}
          </option>
          {shows.map((show) => (
            <option key={show._id} value={show._id}>
              {new Date(show.startTime).toLocaleString()} -
              {language === "en" ? "Users: " : "Usuarios: "}
              {show.clients?.length || 0}/4
            </option>
          ))}
        </select>
      </div>

      {/* Playback Controls */}
      {selectedShow && !loading && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center">
            <div className="mb-6 text-center">
              <p className="text-lg font-semibold mb-2">
                {language === "en" ? "Selected Show" : "Show Seleccionado"}
              </p>
              <p className="text-gray-600">
                {new Date(selectedShow.startTime).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedShow.clients?.length || 0}
                {language === "en" ? " users" : " usuarios"}
              </p>
            </div>

            {!isPlaying ? (
              <button
                onClick={handlePlay}
                disabled={!selectedShow || loading}
                className="flex items-center justify-center px-8 py-4 rounded-full
            text-white font-semibold text-lg
            bg-green-600 hover:bg-green-700
            disabled:opacity-50 disabled:cursor-not-allowed
            w-48 transition-all duration-200"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                </svg>
                {language === "en" ? "Play Show" : "Iniciar Show"}
              </button>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-lg font-semibold text-green-600">
                  {language === "en"
                    ? "Show is Playing"
                    : "Show en Reproducción"}
                </p>
                <button
                  onClick={handleStandby}
                  className="flex items-center justify-center px-8 py-4 rounded-full
              text-white font-semibold text-lg
              bg-yellow-500 hover:bg-yellow-600
              w-48 transition-all duration-200"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {language === "en" ? "Standby Msg" : "Standby Msg"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User List */}
      {selectedShow && !loading && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">
            {language === "en" ? "Show Participants" : "Participantes del Show"}
          </h2>

          {selectedShow.clients?.length === 0 ? (
            <p className="text-gray-500">
              {language === "en"
                ? "No users assigned"
                : "No hay usuarios asignados"}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedShow.clients?.map((client) => (
                <div
                  key={client._id}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">{client.name}</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {language === "en" ? "Energy" : "Energía"}
                      </div>
                      <div className="font-medium text-indigo-600">
                        {client.energy}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {language === "en" ? "Element" : "Elemento"}
                      </div>
                      <div className="font-medium text-indigo-600">
                        {client.element}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {language === "en" ? "Essence" : "Esencia"}
                      </div>
                      <div className="font-medium text-indigo-600">
                        {client.essence}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isPlaying && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">
              {language === "en" ? "Photo Capture" : "Captura de Foto"}
            </h2>
            <button
              onClick={handleCapturePhoto}
              className="flex items-center justify-center px-8 py-4 rounded-full
          text-white font-semibold text-lg
          bg-blue-600 hover:bg-blue-700
          w-48 transition-all duration-200"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {language === "en" ? "Capture Photo" : "Capturar Foto"}
            </button>
          </div>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {success}
        </div>
      )}

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
    </div>
  );
}

export default ShowPlayback;