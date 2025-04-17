import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SensorDashboard from "./SensorDashboard";

// In a real implementation, this would come from a database or API
const containerMapping = {
  "SC101601": {
    channelId: process.env.REACT_APP_THINGSPEAK_CHANNEL_ID,
    apiKey: process.env.REACT_APP_THINGSPEAK_API_KEY,
    location: "Mumbai, Maharashtra",
    fluidType: "water",
    content: "Water",
    isMock: false
  },
  "SC101602": {
    channelId: "mock-channel",
    apiKey: "mock-key",
    location: "Delhi, India",
    fluidType: "ethanol",
    content: "Ethanol",
    isMock: true
  },
  "SC101603": {
    channelId: "mock-channel",
    apiKey: "mock-key",
    location: "Bengaluru, Karnataka",
    fluidType: "cooking oil",
    content: "Cooking Oil",
    isMock: true
  },
  "SC101604": {
    channelId: "mock-channel",
    apiKey: "mock-key",
    location: "Hyderabad, Telangana",
    fluidType: "milk",
    content: "Milk",
    isMock: true
  },
  "SC101605": {
    channelId: "mock-channel",
    apiKey: "mock-key",
    location: "Chennai, Tamil Nadu",
    fluidType: "diesel",
    content: "Diesel",
    isMock: true
  }
};

// Mock data for containers that aren't the active one
const mockSensorData = {
  "SC101602": {
    feeds: Array(20).fill().map((_, i) => ({
      created_at: new Date(Date.now() - (i * 300000)).toISOString(),
      field1: Math.floor(30 + Math.random() * 20).toString(), // Fluid level
      field2: Math.floor(25 + Math.random() * 15).toString(), // Temperature
      field3: Math.floor(40 + Math.random() * 15).toString(), // Humidity
      field4: (Math.random() > 0.9 ? "1" : "0"), // Security breach
    }))
  },
  "SC101603": {
    feeds: Array(20).fill().map((_, i) => ({
      created_at: new Date(Date.now() - (i * 300000)).toISOString(),
      field1: Math.floor(40 + Math.random() * 15).toString(), // Fluid level
      field2: Math.floor(50 + Math.random() * 20).toString(), // Temperature
      field3: Math.floor(30 + Math.random() * 15).toString(), // Humidity
      field4: (Math.random() > 0.95 ? "1" : "0"), // Security breach
    }))
  },
  "SC101604": {
    feeds: Array(20).fill().map((_, i) => ({
      created_at: new Date(Date.now() - (i * 300000)).toISOString(),
      field1: Math.floor(20 + Math.random() * 20).toString(), // Fluid level
      field2: Math.floor(5 + Math.random() * 10).toString(), // Temperature
      field3: Math.floor(50 + Math.random() * 20).toString(), // Humidity
      field4: (Math.random() > 0.92 ? "1" : "0"), // Security breach
    }))
  },
  "SC101605": {
    feeds: Array(20).fill().map((_, i) => ({
      created_at: new Date(Date.now() - (i * 300000)).toISOString(),
      field1: Math.floor(25 + Math.random() * 25).toString(), // Fluid level
      field2: Math.floor(15 + Math.random() * 20).toString(), // Temperature
      field3: Math.floor(35 + Math.random() * 20).toString(), // Humidity
      field4: (Math.random() > 0.9 ? "1" : "0"), // Security breach
    }))
  }
};

const ContainerDashboard = () => {
  const { containerId } = useParams();
  const [containerInfo, setContainerInfo] = useState(null);
  const [mockData, setMockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setLoading(true);
      
      const info = containerMapping[containerId];
      if (!info) {
        setError(`Container with ID ${containerId} not found`);
        return;
      }

      setContainerInfo(info);
      
      // If this is not the active container (SC101601), set up mock data
      if (info.isMock) {
        setMockData(mockSensorData[containerId] || mockSensorData.SC101602);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [containerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // If using mock data, show a banner
  if (containerInfo?.isMock) {
    return (
      <>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 sticky top-0 z-10">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Mock Data</p>
              <p className="text-sm">This container is showing simulated data for demonstration purposes.</p>
            </div>
          </div>
        </div>
        <SensorDashboard 
          apiKey={containerInfo.apiKey}
          channelId={containerInfo.channelId}
          location={containerInfo.location}
          fluidType={containerInfo.fluidType}
          mockData={mockData}
        />
      </>
    );
  }

  return containerInfo ? (
    <SensorDashboard 
      apiKey={containerInfo.apiKey}
      channelId={containerInfo.channelId}
      location={containerInfo.location}
      fluidType={containerInfo.fluidType}
    />
  ) : null;
};

export default ContainerDashboard; 