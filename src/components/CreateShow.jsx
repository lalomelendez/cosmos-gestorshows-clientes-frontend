// src/components/CreateShow.jsx
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createShow } from "../services/api";

function CreateShow() {
  const [startTime, setStartTime] = useState(new Date()); // Initialize with current date
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createShow(startTime);
      console.log("Show created:", result);
      setStatus({
        type: "success",
        message: `Show scheduled successfully!\nStart: ${result.startTimeFormatted}\nEnd: ${result.endTimeFormatted}`,
      });
    } catch (error) {
      console.error("Submit error:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to schedule show",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Schedule New Show</h1>

      {status.message && (
        <div
          className={`mb-4 p-4 rounded ${
            status.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Start Time
          </label>
          <DatePicker
            selected={startTime}
            onChange={(date) => setStartTime(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholderText="Select date and time"
            minDate={new Date()}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !startTime}
          className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            loading || !startTime ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Scheduling..." : "Schedule Show"}
        </button>
      </form>
    </div>
  );
}

export default CreateShow;
