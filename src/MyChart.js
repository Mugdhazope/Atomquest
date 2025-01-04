import React, { useState, useEffect, useRef } from 'react';
import { Chart, RadarController, RadialLinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary chart elements
Chart.register(RadarController, RadialLinearScale, PointElement, Title, Tooltip, Legend);

const Charts = () => {
  // State hooks to store data for different fields (now storing multiple data points)
  const [temperature, setTemperature] = useState([]);
  const [humidity, setHumidity] = useState([]);
  const [breachAlert, setBreachAlert] = useState([]);
  const [fluidLevel, setFluidLevel] = useState([]);

  // Refs to store the chart instances
  const tempChartRef = useRef(null);
  const humidityChartRef = useRef(null);
  const breachAlertChartRef = useRef(null);
  const fluidLevelChartRef = useRef(null);

  const chartInstanceTemp = useRef(null);
  const chartInstanceHumidity = useRef(null);
  const chartInstanceBreach = useRef(null);
  const chartInstanceFluid = useRef(null);

  // Function to fetch data from ThingSpeak
  const fetchData = async () => {
    const API_KEY = 'YOUR_THINGSPEAK_API_KEY';  // Replace with your ThingSpeak API key
    const CHANNEL_ID = 'YOUR_CHANNEL_ID';  // Replace with your ThingSpeak Channel ID

    try {
      const response = await fetch(`https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${API_KEY}`);
      const data = await response.json();

      if (data && data.feeds && data.feeds.length > 0) {
        // Get the most recent 10 readings
        const latestData = data.feeds.slice(-10);  // Get last 10 readings
        setTemperature(latestData.map(item => parseFloat(item.field1)));
        setHumidity(latestData.map(item => parseFloat(item.field2)));
        setBreachAlert(latestData.map(item => parseFloat(item.field3)));
        setFluidLevel(latestData.map(item => parseFloat(item.field4)));
      }
    } catch (error) {
      console.error('Error fetching data from ThingSpeak:', error);
    }
  };

  // Function to render and update the chart with fetched data
  const renderChart = (chartRef, chartInstanceRef, chartData) => {
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: chartData.title,
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
            stepSize: 0.1,
            display: true,  // Show ticks for minimal changes
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.2)',
          },
        },
      },
    };

    // Destroy existing chart if present to avoid canvas reuse errors
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'radar',
      data: chartData.data,
      options: options,
    });
  };

  // Use useEffect to fetch data when the component mounts
  useEffect(() => {
    fetchData();  // Fetch data once when the component mounts
    const interval = setInterval(fetchData, 15000);  // Fetch data every 15 seconds

    return () => {
      clearInterval(interval); // Clear the interval when the component is unmounted
    };
  }, []);

  // Updating the charts when data is fetched
  useEffect(() => {
    if (temperature.length > 0) {
      renderChart(tempChartRef, chartInstanceTemp, {
        title: 'Temperature',
        data: {
          labels: Array(temperature.length).fill('Temperature'), // Using the same label for simplicity
          datasets: [
            {
              label: 'Temperature (°C)',
              data: temperature,
              backgroundColor: 'rgba(255, 99, 132, 0.4)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
            },
          ],
        },
      });
    }

    if (humidity.length > 0) {
      renderChart(humidityChartRef, chartInstanceHumidity, {
        title: 'Humidity',
        data: {
          labels: Array(humidity.length).fill('Humidity'),
          datasets: [
            {
              label: 'Humidity (%)',
              data: humidity,
              backgroundColor: 'rgba(54, 162, 235, 0.4)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
            },
          ],
        },
      });
    }

    if (breachAlert.length > 0) {
      renderChart(breachAlertChartRef, chartInstanceBreach, {
        title: 'Breach Alert',
        data: {
          labels: Array(breachAlert.length).fill('Breach Alert'),
          datasets: [
            {
              label: 'Breach Alert',
              data: breachAlert,
              backgroundColor: 'rgba(255, 159, 64, 0.4)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 2,
            },
          ],
        },
      });
    }

    if (fluidLevel.length > 0) {
      renderChart(fluidLevelChartRef, chartInstanceFluid, {
        title: 'Fluid Level',
        data: {
          labels: Array(fluidLevel.length).fill('Fluid Level'),
          datasets: [
            {
              label: 'Fluid Level (%)',
              data: fluidLevel,
              backgroundColor: 'rgba(75, 192, 192, 0.4)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
            },
          ],
        },
      });
    }
  }, [temperature, humidity, breachAlert, fluidLevel]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f7f7f7', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
        <div className="chart-card" style={{ width: '45%', height: '500px' }}>
          <canvas ref={tempChartRef} />
        </div>
        <div className="chart-card" style={{ width: '45%', height: '500px' }}>
          <canvas ref={humidityChartRef} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
        <div className="chart-card" style={{ width: '45%', height: '500px' }}>
          <canvas ref={breachAlertChartRef} />
        </div>
        <div className="chart-card" style={{ width: '45%', height: '500px' }}>
          <canvas ref={fluidLevelChartRef} />
        </div>
      </div>
    </div>
  );
};

export default Charts;
