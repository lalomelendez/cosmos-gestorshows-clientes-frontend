function CapturePhoto() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Capture Photo</h1>
      <div className="max-w-4xl">
        <div className="bg-gray-200 aspect-video rounded-lg flex items-center justify-center mb-4">
          <span>Camera Preview</span>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Take Photo
        </button>
      </div>
    </div>
  );
}

export default CapturePhoto;
