import { useState, useEffect } from "react";
import { fetchShows, removeUserFromShow, deleteShow } from "../services/api";

function EditShow() {
  // State management
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [loading, setLoading] = useState({
    shows: true,
    action: false,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handler Functions
  const handleShowSelect = (showId) => {
    const show = shows.find((s) => s._id === showId);
    setSelectedShow(show);
    setError(null);
  };

  const handleRemoveUser = async (userId) => {
    if (!selectedShow) return;

    try {
      setLoading((prev) => ({ ...prev, action: true }));
      await removeUserFromShow(selectedShow._id, userId);

      // Update local state
      const updatedShows = shows.map((show) => {
        if (show._id === selectedShow._id) {
          return {
            ...show,
            clients: show.clients.filter((client) => client._id !== userId),
          };
        }
        return show;
      });

      setShows(updatedShows);
      setSelectedShow(
        updatedShows.find((show) => show._id === selectedShow._id)
      );
      setSuccess("User removed successfully");
    } catch (err) {
      setError("Failed to remove user");
      console.error("Error removing user:", err);
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const handleDeleteShow = async () => {
    if (!selectedShow) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this show? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, action: true }));
      await deleteShow(selectedShow._id);

      setShows(shows.filter((show) => show._id !== selectedShow._id));
      setSelectedShow(null);
      setSuccess("Show deleted successfully");
    } catch (err) {
      setError("Failed to delete show");
      console.error("Error deleting show:", err);
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading((prev) => ({ ...prev, shows: true }));
      const availableShows = await fetchShows();
      setShows(availableShows);
      setError(null);
    } catch (err) {
      setError("Failed to load shows");
      console.error("Error loading shows:", err);
    } finally {
      setLoading((prev) => ({ ...prev, shows: false }));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Show</h1>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg border border-green-400">
          {success}
        </div>
      )}

      {/* Show Selector */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Select Show
        </label>
        <select
          onChange={(e) => handleShowSelect(e.target.value)}
          value={selectedShow?._id || ""}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          disabled={loading.shows}
        >
          <option value="">Select a show...</option>
          {shows.map((show) => (
            <option key={show._id} value={show._id}>
              {new Date(show.startTime).toLocaleString()} - Users:{" "}
              {show.clients?.length || 0}/4
            </option>
          ))}
        </select>
      </div>
      {selectedShow && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Show Details</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedShow.clients?.length || 0} users assigned
              </p>
            </div>
            <button
              onClick={handleDeleteShow}
              disabled={loading.action}
              className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 
                disabled:opacity-50 transition-colors duration-200 flex items-center
                ${loading.action ? "cursor-not-allowed" : "hover:bg-red-700"}`}
            >
              {loading.action ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete Show"
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Start Time</p>
              <p className="font-medium">
                {new Date(selectedShow.startTime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium">{selectedShow.duration} minutes</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Assigned Users</h3>
            {selectedShow.clients?.length === 0 ? (
              <p className="text-gray-500">No users assigned to this show</p>
            ) : (
              <div className="space-y-3">
                {selectedShow.clients?.map((client) => (
                  <div
                    key={client._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(client._id)}
                      disabled={loading.action}
                      className="px-4 py-2 text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors duration-200"
                    >
                      {loading.action ? "Removing..." : "Remove"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EditShow;
