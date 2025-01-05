import React from "react";

const NotificationModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-3">Threshold Exceeded</h2>
        <p className="text-sm">{message}</p>
        <button
          onClick={onClose}
          className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
