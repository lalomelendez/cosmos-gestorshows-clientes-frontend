function ShowPlayback() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Show Playback</h1>
      <div className="max-w-4xl">
        <div className="bg-black aspect-video rounded-lg flex items-center justify-center">
          <span className="text-white">Video Player</span>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
            Play
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
            Pause
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShowPlayback;
