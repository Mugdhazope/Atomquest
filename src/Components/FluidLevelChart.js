import React, { useRef, useEffect } from 'react';
import { Chart, DoughnutController, ArcElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Title, Tooltip, Legend);

const FluidLevelChart = ({ fluidLevelData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const data = {
    labels: ['Fluid Level'],
    datasets: [
      {
        label: 'Fluid Level (%)',
        data: [fluidLevelData, 100 - fluidLevelData],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(230, 230, 230, 0.7)'],
        borderWidth: 0,
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
        text: 'Fluid Level Monitoring',
      },
    },
  };

  useEffect(() => {
    const canvas = chartRef.current;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(canvas, {
      type: 'doughnut',
      data: data,
      options: options,
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [fluidLevelData]);

  return (
    <div className="chart-card">
      <canvas ref={chartRef} />
    </div>
  );
};

export default FluidLevelChart;
