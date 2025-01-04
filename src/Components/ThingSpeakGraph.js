import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchThingSpeakData } from '../utils/api';

const ThingSpeakGraph = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchThingSpeakData();
      if (data.length > 0) {
        const timestamps = data.map((entry) => entry.created_at);
        const field1 = data.map((entry) => parseFloat(entry.field1));
        const field2 = data.map((entry) => parseFloat(entry.field2));

        setChartData({
          labels: timestamps,
          datasets: [
            {
              label: 'Field 1 (Fluid Level)',
              data: field1,
              borderColor: 'rgba(75,192,192,1)',
              fill: false,
            },
            {
              label: 'Field 2 (Temperature)',
              data: field2,
              borderColor: 'rgba(255,99,132,1)',
              fill: false,
            },
          ],
        });
      }
    };

    getData();
  }, []);

  if (!chartData) {
    return <p>Loading graph...</p>;
  }

  return (
    <div>
      <h2>ThingSpeak Data Visualization</h2>
      <Line data={chartData} />
    </div>
  );
};

export default ThingSpeakGraph;
