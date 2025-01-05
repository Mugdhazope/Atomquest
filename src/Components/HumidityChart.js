import React, { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js/auto";
import { 
  BeakerIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  DownloadIcon 
} from "@heroicons/react/solid";

const HumidityChart = ({ feeds }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [currentHumidity, setCurrentHumidity] = useState(0);
  const [trend, setTrend] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!feeds || !feeds.length || !chartRef.current) return;

    const timestamps = feeds.map((feed) =>
      new Date(feed.created_at).toLocaleString()
    );
    const humidityValues = feeds.map((feed) => parseFloat(feed.field3) || 0);

    // Calculate current humidity and trend
    const latestHumidity = humidityValues[humidityValues.length - 1];
    const previousHumidity = humidityValues[humidityValues.length - 2] || 0;
    
    setCurrentHumidity(latestHumidity);
    setTrend(latestHumidity - previousHumidity);

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
            label: "Humidity (%)",
            data: humidityValues,
            backgroundColor: (context) => {
              const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, "rgba(54, 162, 235, 0.4)");
              gradient.addColorStop(1, "rgba(54, 162, 235, 0.1)");
              return gradient;
            },
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 3,
            pointBackgroundColor: "rgba(54, 162, 235, 1)",
            pointBorderColor: "white",
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "rgba(54, 162, 235, 1)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: { 
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: 'white',
            bodyColor: 'white',
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
                size: 10
              }
            },
          },
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(0,0,0,0.05)',
            },
            ticks: {
              callback: (value) => `${value}%`,
              font: {
                size: 12
              }
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
      const link = document.createElement('a');
      link.download = `humidity-chart-${new Date().toISOString().split('T')[0]}.png`;
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

  const getHumidityStatus = () => {
    if (currentHumidity < 30) return "Dry";
    if (currentHumidity >= 30 && currentHumidity < 50) return "Comfortable";
    if (currentHumidity >= 50 && currentHumidity < 70) return "Humid";
    return "Very Humid";
  };

  return (
    <div className={`w-full bg-white rounded-2xl shadow-2xl transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
              <BeakerIcon className="h-8 w-8 mr-2 text-blue-500" />
              Humidity Monitor
            </h2>
            <p className="text-sm text-gray-500">Real-time humidity tracking</p>
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
          {/* Current Humidity */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="text-sm text-blue-600">Current Humidity</p>
              <p className="text-lg font-bold text-blue-800">{currentHumidity}%</p>
            </div>
          </div>

          {/* Trend Indicator */}
          <div className={`flex items-center p-4 rounded-lg border ${getTrendColor()}`}>
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
                {getHumidityStatus()}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-64">
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
};

export default HumidityChart;