import React, { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js/auto";
import { 
  ShieldCheckIcon, 
  ShieldExclamationIcon, 
  ClockIcon, 
  DownloadIcon 
} from "@heroicons/react/solid";

const BreachAlertChart = ({ feeds }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [activeBreaches, setActiveBreaches] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!feeds || !feeds.length || !chartRef.current) return;

    const timestamps = feeds.map((feed) =>
      new Date(feed.created_at).toLocaleString()
    );
    const breachValues = feeds.map((feed) => parseFloat(feed.field4) || 0);

    // Update stats
    setActiveBreaches(breachValues.filter(v => v === 1).length);
    setLastUpdateTime(timestamps[timestamps.length - 1]);

    // Animate chart update
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: timestamps,
        datasets: [
          {
            label: "Breach Status",
            data: breachValues,
            backgroundColor: breachValues.map((value) =>
              value
                ? "rgba(239, 68, 68, 0.8)"  // Red for breaches
                : "rgba(34, 197, 94, 0.8)"  // Green for secure
            ),
            borderColor: breachValues.map((value) =>
              value ? "rgb(239, 68, 68)" : "rgb(34, 197, 94)"
            ),
            borderWidth: 1,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            callbacks: {
              label: (context) => {
                return context.raw === 0 ? "Secure" : "Security Breach Detected";
              }
            }
          }
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
                size: 10
              }
            }
          },
          y: {
            beginAtZero: true,
            max: 1,
            ticks: {
              stepSize: 1,
              callback: (value) => (value === 0 ? "Secure" : "Breach"),
              font: {
                size: 12
              }
            }
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
      const link = document.createElement('a');
      link.download = `breach-alert-chart-${new Date().toISOString().split('T')[0]}.png`;
      link.href = url;
      link.click();
    }
  };

  const getStatusColor = () => {
    return activeBreaches === 0 
      ? "bg-green-100 text-green-800 border-green-200" 
      : "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className={`w-full bg-white rounded-2xl shadow-2xl transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
              {activeBreaches === 0 ? <ShieldCheckIcon className="h-8 w-8 mr-2 text-green-500" /> : <ShieldExclamationIcon className="h-8 w-8 mr-2 text-red-500" />}
              Security Breach Monitor
            </h2>
            <p className="text-sm text-gray-500">Real-time security status visualization</p>
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
          {/* Current Status */}
          <div className={`flex items-center p-4 rounded-lg border ${getStatusColor()}`}>
            <div>
              <p className="text-sm font-medium">Current Status</p>
              <p className="text-lg font-bold">
                {activeBreaches === 0 ? "Secure" : "Breach Detected"}
              </p>
            </div>
          </div>

          {/* Active Breaches */}
          <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="text-sm text-red-600">Active Breaches</p>
              <p className="text-lg font-bold text-red-800">{activeBreaches}</p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="text-sm text-blue-600 flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Last Updated
              </p>
              <p className="text-lg font-bold text-blue-800">
                {lastUpdateTime ? new Date(lastUpdateTime).toLocaleTimeString() : "N/A"}
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

export default BreachAlertChart;