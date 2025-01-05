import React, { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js/auto";
import {
  BeakerIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DownloadIcon,
} from "@heroicons/react/solid";

const FluidLevelChart = ({ feeds }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [currentFluidLevel, setCurrentFluidLevel] = useState(0);
  const [trend, setTrend] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!feeds || !feeds.length || !chartRef.current) return;

    const timestamps = feeds.map((feed) =>
      new Date(feed.created_at).toLocaleString()
    );
    const fluidLevels = feeds.map((feed) => parseFloat(feed.field1) || 0);

    // Calculate current fluid level and trend
    const latestLevel = fluidLevels[fluidLevels.length - 1];
    const previousLevel = fluidLevels[fluidLevels.length - 2] || 0;

    setCurrentFluidLevel(latestLevel);
    setTrend(latestLevel - previousLevel);

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
            label: "Fluid Level (%)",
            data: fluidLevels,
            backgroundColor: (context) => {
              const gradient = context.chart.ctx.createLinearGradient(
                0,
                0,
                0,
                400
              );
              gradient.addColorStop(0, "rgba(75, 192, 192, 0.4)");
              gradient.addColorStop(1, "rgba(75, 192, 192, 0.1)");
              return gradient;
            },
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 3,
            pointBackgroundColor: "rgba(75, 192, 192, 1)",
            pointBorderColor: "white",
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "rgba(75, 192, 192, 1)",
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
              callback: (value) => `${value}%`,
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
      link.download = `fluid-level-chart-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = url;
      link.click();
    }
  };

  const getTrendColor = () => {
    return trend > 0
      ? "text-green-600 bg-green-100"
      : trend < 0
      ? "text-red-600 bg-red-100"
      : "text-gray-600 bg-gray-100";
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
              <BeakerIcon className="h-8 w-8 mr-2 text-blue-500" />
              Fluid Level Monitor
            </h2>
            <p className="text-sm text-gray-500">
              Real-time fluid level tracking
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
          {/* Current Fluid Level */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="text-sm text-blue-600">Current Fluid Level</p>
              <p className="text-lg font-bold text-blue-800">
                {currentFluidLevel}%
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
                  {trend > 0 ? `+${trend.toFixed(2)}%` : `${trend.toFixed(2)}%`}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <p className="text-sm text-green-600">Status</p>
              <p className="text-lg font-bold text-green-800">
                {currentFluidLevel > 75
                  ? "High"
                  : currentFluidLevel < 25
                  ? "Low"
                  : "Normal"}
              </p>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-inner">
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
};

export default FluidLevelChart;
