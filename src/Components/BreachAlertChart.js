import React, { useState, useEffect, useRef } from 'react';
import { Chart, RadarController, RadialLinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary elements and controllers
Chart.register(RadarController, RadialLinearScale, PointElement, Title, Tooltip, Legend);

const BreachAlertChart = () => {
  const [breachAlertData, setBreachAlertData] = useState(0);  // Assuming breachAlertData is a number (0 or 1)
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Function to fetch data from ThingSpeak
  const fetchData = async () => {
    const API_KEY = 'YOUR_THINGSPEAK_API_KEY';  // Replace with your ThingSpeak read API key
    const CHANNEL_ID = 'YOUR_CHANNEL_ID';  // Replace with your ThingSpeak channel ID

    try {
      const response = await fetch(`https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/3.json?api_key=${API_KEY}`);
      const data = await response.json();
      if (data && data.feeds && data.feeds.length > 0) {
        const latestData = data.feeds[data.feeds.length - 1];
        setBreachAlertData(parseFloat(latestData.field3));  // Assuming breach alert is stored in field 3
      }
    } catch (error) {
      console.error('Error fetching data from ThingSpeak:', error);
    }
  };

  // Function to render and update the chart
  const renderChart = () => {
    const data = {
      labels: ['Alert Status'],
      datasets: [
        {
          label: 'Breach Alert',
          data: [breachAlertData],
          backgroundColor: 'rgba(255, 159, 64, 0.4)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 2,
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
          text: 'Breach Alert Status',
        },
      },
      scales: {
        r: {
          angleLines: {
            display: false,
          },
          ticks: {
            min: 0,
            max: 1,
            stepSize: 1,
            display: false,
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.2)',
          },
        },
      },
    };

    if (chartInstance.current) {
      chartInstance.current.destroy(); // Destroy existing chart before creating a new one
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: 'radar',
      data: data,
      options: options,
    });
  };

  // Use useEffect to fetch the data on component mount and update the chart
  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
    const interval = setInterval(fetchData, 15000); // Fetch data every 15 seconds

    return () => {
      clearInterval(interval); // Clear the interval when the component is unmounted
    };
  }, []);

  useEffect(() => {
    renderChart(); // Re-render the chart whenever the breachAlertData is updated
  }, [breachAlertData]);

  return (
    <div className="chart-card">
      <canvas ref={chartRef} />
    </div>
  );
};

export default BreachAlertChart;
