import React, { useState, useEffect } from 'react';
import TemperatureChart from './Components/TemperatureChart';
import HumidityChart from './Components/HumidityChart';
import BreachAlertChart from './Components/BreachAlertChart';
import FluidLevelChart from './Components/FluidLevelChart';
import Charts from './MyChart'

const App = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    breachAlert: 0,
    fluidLevel: 0,
  });

  useEffect(() => {
    // Replace this with actual data fetching or simulated data
    setSensorData({
      temperature: 25,
      humidity: 60,
      breachAlert: 0,
      fluidLevel: 75,
    });
  }, []);

  return (
    <div>
      <h1>Sensor Data Dashboard</h1>
      <div className="chart-container">
        <TemperatureChart temperatureData={sensorData.temperature} />
        <HumidityChart humidityData={sensorData.humidity} />
        <BreachAlertChart breachAlertData={sensorData.breachAlert} />
        <FluidLevelChart fluidLevelData={sensorData.fluidLevel} />
      </div>
    </div>
  );
};

export default App;
