import { useState, useEffect } from "react";
import { fetchUsers, fetchShows, assignUserToShow } from "../services/api";

function AssignUsers() {
  // State management
  const [users, setUsers] = useState([]);
  const [shows, setShows] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [loading, setLoading] = useState({
    users: true,
    shows: true,
    assign: false,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading({ users: true, shows: true, assign: false });
      const [usersData, showsData] = await Promise.all([
        fetchUsers(),
        fetchShows(),
      ]);
      setUsers(usersData);
      setShows(showsData);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading({ users: false, shows: false, assign: false });
    }
  };

  const handleUserSelection = (user) => {
    setSelectedUsers((prev) => {
      if (prev.find((u) => u._id === user._id)) {
        return prev.filter((u) => u._id !== user._id);
      }
      if (prev.length >= 4) {
        setError("Maximum 4 users can be selected");
        return prev;
      }
      return [...prev, user];
    });
    setError(null);
  };

  const handleShowSelection = (show) => {
    if (show.clients && show.clients.length + selectedUsers.length > 4) {
      setError(
        `This show can only accept ${4 - show.clients.length} more users`
      );
      return;
    }
    setSelectedShow(show);
    setError(null);
  };

  const handleAssign = async () => {
    if (selectedUsers.length === 0 || !selectedShow) {
      setError("Please select users and a show");
      return;
    }

    setLoading((prev) => ({ ...prev, assign: true }));
    try {
      await Promise.all(
        selectedUsers.map((user) =>
          assignUserToShow(user._id, selectedShow._id)
        )
      );

      setSuccess(
        `Successfully assigned ${selectedUsers.length} user(s) to the show`
      );
      setSelectedUsers([]);
      setSelectedShow(null);
      await fetchInitialData();
    } catch (err) {
      setError(err.message || "Failed to assign users");
    } finally {
      setLoading((prev) => ({ ...prev, assign: false }));
    }
  };

  // Previous return statement with UI remains the same
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Assign Users to Show</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Selection Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Users</h2>
            <span className="text-sm text-gray-600">
              Selected: {selectedUsers.length}/4
            </span>
          </div>

          {loading.users ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelection(user)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200
                    ${
                      selectedUsers.find((u) => u._id === user._id)
                        ? "bg-indigo-100 border-2 border-indigo-500 shadow-md transform -translate-y-1"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">
                        Status: {user.status}
                      </p>
                    </div>
                    {selectedUsers.find((u) => u._id === user._id) && (
                      <div className="text-indigo-600">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shows Selection Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Select Show</h2>
          {loading.shows ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {shows.map((show) => (
                <div
                  key={show._id}
                  onClick={() => handleShowSelection(show)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200
${
  selectedShow?._id === show._id
    ? "bg-indigo-100 border-2 border-indigo-500 shadow-md transform -translate-y-1"
    : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
}
${(show.clients?.length || 0) >= 4 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(show.startTime).toLocaleString()}
                      </p>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-600">
                          Capacity: {show.clients?.length || 0}/4
                        </p>
                        <div className="ml-2 bg-gray-200 rounded-full h-2 w-20">
                          <div
                            className="bg-indigo-600 rounded-full h-2"
                            style={{
                              width: `${(show.clients?.length || 0) * 25}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleAssign}
          disabled={
            selectedUsers.length === 0 || !selectedShow || loading.assign
          }
          className={`
px-6 py-3 rounded-lg font-semibold text-white
transition-all duration-200
${
  selectedUsers.length > 0 && selectedShow && !loading.assign
    ? "bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-1"
    : "bg-gray-400 cursor-not-allowed"
}`}
        >
          {loading.assign ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Assigning...
            </div>
          ) : (
            `Assign ${selectedUsers.length} User${
              selectedUsers.length !== 1 ? "s" : ""
            } to Show`
          )}
        </button>
      </div>
    </div>
  );
}

export default AssignUsers;
