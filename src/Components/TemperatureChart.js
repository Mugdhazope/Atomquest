import React, { useRef, useEffect } from 'react';
import { Chart, CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend);

const TemperatureChart = ({ temperatureData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const data = {
    labels: ['Temperature'],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [temperatureData],
        backgroundColor: ['rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)'],
        borderWidth: 2,
        borderRadius: 5,
        hoverBackgroundColor: ['rgba(255, 99, 132, 0.8)'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Temperature Monitoring',
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#555',
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
      },
      y: {
        ticks: {
          color: '#555',
          callback: function (value) {
            return value + ' °C';
          },
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
      },
    },
  };

  useEffect(() => {
    const canvas = chartRef.current;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(canvas, {
      type: 'bar',
      data: data,
      options: options,
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [temperatureData]);

  return (
    <div className="chart-card">
      <canvas ref={chartRef} />
    </div>
  );
};

export default TemperatureChart;
