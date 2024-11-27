import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Debug interceptor with more details
axios.interceptors.request.use(request => {
  console.log('Request:', {
    method: request.method,
    url: request.url,
    data: request.data,
    params: request.params
  });
  return request;
});

function CapturePhoto() {
  const [photos, setPhotos] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);

  const fetchCapturedPhotos = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Updated endpoint to match backend route
      const response = await axios.get(`${API_BASE_URL}/photos`, {
        params: { sessionId }
      });
      console.log('Photos response:', response.data);
      setPhotos(response.data.photos || []);
    } catch (error) {
      console.error('Error fetching photos:', {
        error,
        endpoint: `${API_BASE_URL}/photos/session/${sessionId}`,
        sessionId
      });
      setError(error.response?.data?.error || 'Failed to fetch photos');
    }
  }, [sessionId]);

  useEffect(() => {
    let interval;
    if (sessionId) {
      fetchCapturedPhotos();
      interval = setInterval(fetchCapturedPhotos, 3000);
    }
    return () => clearInterval(interval);
  }, [sessionId, fetchCapturedPhotos]);

  const handleCapturePhoto = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/photos/capture`, {
        sessionId
      });
      console.log('Capture response:', response.data);
      
      if (!sessionId) {
        setSessionId(response.data.sessionId);
      }
      
      setCurrentAttempt(prev => prev + 1);
      await fetchCapturedPhotos();
    } catch (error) {
      console.error('Error capturing photo:', error);
      setError(error.response?.data?.error || 'Failed to capture photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPhoto = (photoId) => {
    setSelectedPhotoId(photoId);
  };

  const handleApprovePhoto = async () => {
    if (!selectedPhotoId || !sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/photos/approve`, {
        sessionId,
        photoId: selectedPhotoId
      });

      setSessionId(null);
      setPhotos([]);
      setCurrentAttempt(0);
      setSelectedPhotoId(null);
      
      alert('Photo approved successfully');
    } catch (error) {
      console.error('Error approving photo:', {
        error,
        endpoint: `${API_BASE_URL}/photos/approve`,
        sessionId,
        photoId: selectedPhotoId
      });
      setError(error.response?.data?.error || 'Failed to approve photo');
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
              <img 
                src={photo.url} 
                alt="Captured"
                className="w-full h-auto"
                onError={(e) => {
                  console.error('Image load error:', photo.url);
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
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

      {currentAttempt > 0 && (
        <div className="mt-4 text-gray-600">
          Attempts: {currentAttempt}/3
        </div>
      )}
    </div>
  );
}

export default CapturePhoto;