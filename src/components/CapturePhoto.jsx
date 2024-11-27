import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CapturePhoto() {
  const [photos, setPhotos] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);

  const handleCapturePhoto = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/capture-photo', { sessionId });
      const { sessionId: newSessionId } = response.data;

      // Set sessionId if it was not previously set
      if (!sessionId) {
        setSessionId(newSessionId);
      }

      // Increment the current attempt counter
      setCurrentAttempt((prev) => prev + 1);
    } catch (error) {
      console.error('Error initiating photo capture:', error);
      setError(error.response?.data?.error || 'Failed to initiate photo capture.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCapturedPhotos = async () => {
    if (!sessionId) return;

    try {
      const response = await axios.get('/api/photos', {
        params: { sessionId },
      });
      setPhotos(response.data.photos);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setError(error.response?.data?.error || 'Failed to fetch photos.');
    }
  };

  useEffect(() => {
    let interval;

    if (sessionId) {
      // Poll every 3 seconds
      interval = setInterval(() => {
        fetchCapturedPhotos();
      }, 3000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [sessionId]);

  const handleSelectPhoto = (photoId) => {
    setSelectedPhotoId(photoId);
  };

  const handleApprovePhoto = async () => {
    if (!selectedPhotoId || !sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.post('/api/photos/approve', {
        sessionId,
        photoId: selectedPhotoId,
      });

      alert('Photo approved successfully.');

      // Reset state or navigate to another screen
      setSessionId(null);
      setPhotos([]);
      setCurrentAttempt(0);
      setSelectedPhotoId(null);
    } catch (error) {
      console.error('Error approving photo:', error);
      setError(error.response?.data?.error || 'Failed to approve photo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptureAnotherPhoto = () => {
    if (currentAttempt < 3) {
      handleCapturePhoto();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Capture Photo</h1>

      {error && (
        <div className="text-red-600 mb-4">
          {error}
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {photos.map((photo) => (
            <div
              key={photo.photoId}
              className={`cursor-pointer border-4 rounded overflow-hidden ${
                selectedPhotoId === photo.photoId ? 'border-indigo-600' : 'border-transparent'
              }`}
              onClick={() => handleSelectPhoto(photo.photoId)}
            >
              <img src={photo.url} alt="Captured" className="w-full h-auto" />
            </div>
          ))}
        </div>
      )}

      <div className="flex space-x-4">
        {currentAttempt < 3 && (
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCapturePhoto}
            disabled={isLoading}
          >
            {isLoading ? 'Capturing...' : 'Capture Photo'}
          </button>
        )}

        {photos.length > 0 && (
          <>
            <button
              className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                !selectedPhotoId ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleApprovePhoto}
              disabled={!selectedPhotoId || isLoading}
            >
              Approve Photo
            </button>

            {currentAttempt < 3 && (
              <button
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleCaptureAnotherPhoto}
                disabled={isLoading}
              >
                Capture Another Photo
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CapturePhoto;