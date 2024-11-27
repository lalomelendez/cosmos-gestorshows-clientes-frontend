// src/services/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Photo API Functions
export const capturePhoto = async (sessionId, showId, userIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/photos/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId, showId, userIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to capture photo");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to capture photo:", error);
    throw error;
  }
};

export const fetchCapturedPhotos = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/photos?sessionId=${sessionId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch photos");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    throw error;
  }
};

export const approvePhoto = async (sessionId, photoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/photos/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId, photoId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to approve photo");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to approve photo:", error);
    throw error;
  }
};

// Show API Functions
export const assignUserToShow = async (userId, showId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shows/${showId}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to assign user to show");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to assign user:", error);
    throw error;
  }
};

