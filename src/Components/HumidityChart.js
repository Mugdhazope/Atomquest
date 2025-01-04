import React, { useRef, useEffect } from 'react';
import { Chart, CategoryScale, LinearScale, LineController, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, LineController, LineElement, Title, Tooltip, Legend);

const HumidityChart = ({ humidityData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const data = {
    labels: Array(10).fill(''),
    datasets: [
      {
        label: 'Humidity (%)',
        data: Array(10).fill(humidityData),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: true,
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
        text: 'Humidity Trend',
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
            return value + ' %';
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
      type: 'line',
      data: data,
      options: options,
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [humidityData]);

  return (
    <div className="chart-card">
      <canvas ref={chartRef} />
    </div>
  );
};

export default HumidityChart;
