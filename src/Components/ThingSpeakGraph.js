import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { fetchThingSpeakData } from "../utils/api";
import {
  ChartBarIcon,
  DownloadIcon,
  RefreshIcon,
} from "@heroicons/react/solid";

const ThingSpeakGraph = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const getData = async () => {
    try {
      setLoading(true);
      const data = await fetchThingSpeakData();

      if (data.length > 0) {
        const timestamps = data.map((entry) =>
          new Date(entry.created_at).toLocaleString()
        );
        const field1 = data.map((entry) => parseFloat(entry.field1));
        const field2 = data.map((entry) => parseFloat(entry.field2));

        setChartData({
          labels: timestamps,
          datasets: [
            {
              label: "Fluid Level (%)",
              data: field1,
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.2)",
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 8,
            },
            {
              label: "Temperature (°C)",
              data: field2,
              borderColor: "rgba(255,99,132,1)",
              backgroundColor: "rgba(255,99,132,0.2)",
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 8,
            },
          ],
        });

        setLastUpdated(new Date().toLocaleString());
        setError(null);
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleExport = () => {
    const link = document.createElement("a");
    link.download = `thingspeak-data-${
      new Date().toISOString().split("T")[0]
    }.png`;
    link.href = document.querySelector("canvas").toDataURL();
    link.click();
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "white",
        bodyColor: "white",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
            <ChartBarIcon className="h-8 w-8 mr-2 text-blue-500" />
            ThingSpeak Data Visualization
          </h2>
          <p className="text-sm text-gray-500">
            Real-time sensor data monitoring
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={getData}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 focus:outline-none"
          >
            <RefreshIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 focus:outline-none"
          >
            <DownloadIcon className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Last Updated</p>
          <p className="font-bold text-blue-800">
            {lastUpdated || "Not available"}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Data Points</p>
          <p className="font-bold text-green-800">
            {chartData ? chartData.labels.length : "N/A"}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600">Datasets</p>
          <p className="font-bold text-purple-800">
            {chartData ? chartData.datasets.length : "N/A"}
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-[400px] w-full">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Loading data...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default ThingSpeakGraph;
