// src/services/api.js
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://10.1.14.208:5000/api";

// Shows API
export const createShow = async (startTime) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shows`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startTime: startTime.toISOString(),
        duration: 15,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Format time for display
    const startTimeFormatted = new Date(data.startTime).toLocaleString();
    const endTimeFormatted = new Date(data.endTime).toLocaleString();

    console.log("Show created successfully:", {
      ...data,
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
    });

    return {
      ...data,
      startTimeFormatted,
      endTimeFormatted,
    };
  } catch (error) {
    console.error("Failed to create show:", error);
    throw new Error("Failed to create show. Please try again.");
  }
};

// Users API
export const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/waiting`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to load users. Please try again.");
  }
};

export const fetchShows = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/shows/available`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch shows:", error);
    throw new Error("Failed to load shows. Please try again.");
  }
};

export const assignUserToShow = async (userId, showId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/show`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ showId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to assign user to show");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to assign user:", error);
    throw error;
  }
};

// Photo API
export const capturePhoto = async (showId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/photos/${showId}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to capture photo:", error);
    throw new Error("Failed to capture photo. Please try again.");
  }
};

// Show Playback API
export const getShowPlayback = async (showId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shows/${showId}/playback`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to get show playback:", error);
    throw new Error("Failed to load show playback. Please try again.");
  }
};


export const sendOscPlay = async (showId, language) => {
  console.log(`[Frontend] Sending play request:`, { showId, language });
  try {
    const response = await fetch(`${API_BASE_URL}/osc/play`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ showId, language }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[Frontend] Server error:`, errorData);
      throw new Error(errorData.message || "Failed to send OSC play signal");
    }

    const data = await response.json();
    console.log('[Frontend] Play request successful:', data);
    return data;
  } catch (error) {
    console.error('[Frontend] Play error details:', error);
    throw error;
  }
};

export const sendOscStandby = async (showId) => {
  console.log('[API] Sending standby request:', { showId });
  try {
    const response = await fetch(`${API_BASE_URL}/osc/standby`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ showId }), // Add showId to body
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API] Server error:', errorData);
      throw new Error(errorData.message || "Failed to send OSC standby signal");
    }

    const data = await response.json();
    console.log('[API] Standby request successful:', data);
    return data;
  } catch (error) {
    console.error('[API] Standby error details:', error);
    throw error;
  }
};




// Edit Show API
export const updateShow = async (showId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shows/${showId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to update show:", error);
    throw new Error("Failed to update show. Please try again.");
  }
};

// Add new functions for EditShow component
export const removeUserFromShow = async (showId, userId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/shows/${showId}/remove-user/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to remove user:", error);
    throw new Error("Failed to remove user from show");
  }
};

export const deleteShow = async (showId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shows/${showId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to delete show:", error);
    throw new Error("Failed to delete show");
  }
};


