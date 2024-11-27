// src/components/CapturePhoto.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { capturePhoto, fetchCapturedPhotos, approvePhoto } from '../services/api';

function CapturePhoto() {
  // State management
  const [photos, setPhotos] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [showId, setShowId] = useState(null);
  const [userIds, setUserIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);

  // Fetch photos on session change
  const fetchPhotos = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const data = await fetchCapturedPhotos(sessionId);
      setPhotos(data.photos || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching photos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    let interval;
    if (sessionId) {
      fetchPhotos();
      interval = setInterval(fetchPhotos, 3000);
    }
    return () => clearInterval(interval);
  }, [sessionId, fetchPhotos]);

  const handleCapture = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await capturePhoto(sessionId, showId, userIds);
      if (!sessionId) {
        setSessionId(result.sessionId);
      }
      setCurrentAttempt(prev => prev + 1);
      await fetchPhotos();
    } catch (err) {
      setError(err.message);
      console.error('Error capturing photo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPhoto = (photoId) => {
    setSelectedPhotoId(photoId);
  };

  const handleApprove = async () => {
    if (!selectedPhotoId || !sessionId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      await approvePhoto(sessionId, selectedPhotoId);
      setSessionId(null);
      setPhotos([]);
      setCurrentAttempt(0);
      setSelectedPhotoId(null);
    } catch (err) {
      setError(err.message);
      console.error('Error approving photo:', err);
    } finally {
      setIsLoading(false);
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

      {/* Photo Gallery */}
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

      {/* Action Buttons */}
      <div className="flex space-x-4">
        {currentAttempt < 3 && (
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCapture}
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
              onClick={handleApprove}
              disabled={!selectedPhotoId || isLoading}
            >
              Approve Photo
            </button>

            {currentAttempt < 3 && (
              <button
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleCapture}
                disabled={isLoading}
              >
                Capture Another Photo
              </button>
            )}
          </>
        )}
      </div>

      {/* Attempt Counter */}
      {currentAttempt > 0 && (
        <div className="mt-4 text-gray-600">
          Attempts: {currentAttempt}/3
        </div>
      )}
    </div>
  );
}

export default CapturePhoto;