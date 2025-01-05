import React, { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js/auto";
import {
  FireIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DownloadIcon,
} from "@heroicons/react/solid";

const TemperatureChart = ({ feeds }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [currentTemperature, setCurrentTemperature] = useState(0);
  const [trend, setTrend] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!feeds || !feeds.length || !chartRef.current) return;

    const timestamps = feeds.map((feed) =>
      new Date(feed.created_at).toLocaleString()
    );
    const temperatures = feeds.map((feed) => parseFloat(feed.field2) || 0);

    // Calculate current temperature and trend
    const latestTemperature = temperatures[temperatures.length - 1];
    const previousTemperature = temperatures[temperatures.length - 2] || 0;

    setCurrentTemperature(latestTemperature);
    setTrend(latestTemperature - previousTemperature);

    // Animate chart update
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: timestamps,
        datasets: [
          {
            label: "Temperature (°C)",
            data: temperatures,
            backgroundColor: (context) => {
              const gradient = context.chart.ctx.createLinearGradient(
                0,
                0,
                0,
                400
              );
              gradient.addColorStop(0, "rgba(255, 99, 132, 0.4)");
              gradient.addColorStop(1, "rgba(255, 99, 132, 0.1)");
              return gradient;
            },
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 3,
            pointBackgroundColor: "rgba(255, 99, 132, 1)",
            pointBorderColor: "white",
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "rgba(255, 99, 132, 1)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: "easeOutQuart",
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            titleColor: "white",
            bodyColor: "white",
          },
          title: {
            display: false,
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
            beginAtZero: false,
            grid: {
              color: "rgba(0,0,0,0.05)",
            },
            ticks: {
              callback: (value) => `${value}°C`,
              font: {
                size: 12,
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [feeds]);

  const handleExport = () => {
    if (chartInstance.current) {
      const url = chartInstance.current.toBase64Image();
      const link = document.createElement("a");
      link.download = `temperature-chart-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = url;
      link.click();
    }
  };

  const getTrendColor = () => {
    return trend > 0
      ? "text-red-600 bg-red-100"
      : trend < 0
      ? "text-blue-600 bg-blue-100"
      : "text-gray-600 bg-gray-100";
  };

  const getTemperatureStatus = () => {
    if (currentTemperature < 10) return "Cold";
    if (currentTemperature >= 10 && currentTemperature < 20) return "Cool";
    if (currentTemperature >= 20 && currentTemperature < 30) return "Warm";
    return "Hot";
  };

  return (
    <div
      className={`w-full bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
        isAnimating ? "scale-105" : ""
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
              <FireIcon className="h-8 w-8 mr-2 text-red-500" />
              Temperature Monitor
            </h2>
            <p className="text-sm text-gray-500">
              Real-time temperature tracking
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <DownloadIcon className="h-5 w-5 mr-2" />
            Export Chart
          </button>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Current Temperature */}
          <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="text-sm text-red-600">Current Temperature</p>
              <p className="text-lg font-bold text-red-800">
                {currentTemperature}°C
              </p>
            </div>
          </div>

          {/* Trend Indicator */}
          <div
            className={`flex items-center p-4 rounded-lg border ${getTrendColor()}`}
          >
            <div className="flex items-center">
              {trend > 0 ? (
                <TrendingUpIcon className="h-6 w-6 mr-2" />
              ) : trend < 0 ? (
                <TrendingDownIcon className="h-6 w-6 mr-2" />
              ) : null}
              <div>
                <p className="text-sm">Trend</p>
                <p className="text-lg font-bold">
                  {trend > 0
                    ? `+${trend.toFixed(2)}°C`
                    : `${trend.toFixed(2)}°C`}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div>
              <p className="text-sm text-orange-600">Status</p>
              <p className="text-lg font-bold text-orange-800">
                {getTemperatureStatus()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default TemperatureChart;
