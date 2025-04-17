import React, { useState, useEffect } from "react";
import { Cloud, Sun, AlertTriangle, Camera } from "lucide-react";

const RealtimeParameter = ({ title, value, unit, min = 0, max = 100 }) => {
  // Calculate percentage for the circular progress
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeDasharray = `${percentage} ${100 - percentage}`;
  
  return (
    <div className="text-center">
      <p className="text-sm text-gray-500 mb-2">{title}({unit})</p>
      <div className="relative inline-flex">
        <svg className="w-24 h-24" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#e6e6e6"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray={strokeDasharray}
            strokeDashoffset="25"
            transform="rotate(-90 18 18)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
          {value}
        </div>
      </div>
    </div>
  );
};

const TrackAndMonitor = () => {
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [outerContainerStatus, setOuterContainerStatus] = useState({
    status: "Healthy", // Default value, will be updated with real data
    field: process.env.REACT_APP_OUTER_CONTAINER_HEALTH_FIELD_ID || "field7",
  });
  const [suspiciousActivity, setSuspiciousActivity] = useState({
    detected: false,
    confidence: 0,
    field: process.env.REACT_APP_SUSPICIOUS_ACTIVITY_FIELD_ID || "field8",
  });
  
  const containerDetails = {
    orderId: "1477032963266",
    containerId: "SC101601",
    customerName: "Saint Joseph's Hospital and Medical Center",
    content: "Water"
  };

  // Fetch real data from ThingSpeak
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiKey = process.env.REACT_APP_THINGSPEAK_API_KEY;
        const channelId = process.env.REACT_APP_THINGSPEAK_CHANNEL_ID;
        
        const response = await fetch(
          `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=1`
        );
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.feeds && data.feeds.length > 0) {
          const latestFeed = data.feeds[0];
          
          // Update outer container status
          const outerContainerFieldId = process.env.REACT_APP_OUTER_CONTAINER_HEALTH_FIELD_ID || "field7";
          const outerContainerStatus = latestFeed[outerContainerFieldId] === "1" ? "Breach Detected" : "Healthy";
          
          setOuterContainerStatus({
            status: outerContainerStatus,
            field: outerContainerFieldId
          });
          
          // Update suspicious activity detection from AI/ML model
          const suspiciousActivityFieldId = process.env.REACT_APP_SUSPICIOUS_ACTIVITY_FIELD_ID || "field8";
          const activityValue = parseFloat(latestFeed[suspiciousActivityFieldId] || "0");
          const suspiciousActivityDetected = activityValue > 0.5; // Threshold for detection
          
          setSuspiciousActivity({
            detected: suspiciousActivityDetected,
            confidence: Math.min(100, Math.round(activityValue * 100)),
            field: suspiciousActivityFieldId
          });
          
          setSensorData({
            health: calculateHealth(latestFeed),
            temperature: parseFloat(latestFeed.field2).toFixed(2),
            humidity: parseFloat(latestFeed.field3).toFixed(1),
            fluidLevel: parseFloat(latestFeed.field1).toFixed(1),
            pressure: "1.02", // Not available in current API, using default
            luminosity: "127.41", // Not available in current API, using default
            vibration: "1.15", // Not available in current API, using default
            weather: {
              condition: getFakeWeather(parseFloat(latestFeed.field2)),
              temperature: parseFloat(latestFeed.field2).toFixed(1)
            }
          });
        } else {
          throw new Error("No data received from API");
        }
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Calculate a health percentage based on the sensor readings
    const calculateHealth = (feed) => {
      // Simple algorithm: higher values generally indicate worse health
      const tempScore = Math.max(0, 100 - Math.abs(parseFloat(feed.field2) - 25));
      const humidityScore = Math.max(0, 100 - Math.abs(parseFloat(feed.field3) - 50));
      const fluidScore = Math.min(100, 100 - Math.abs(parseFloat(feed.field1) - 50));
      
      const breachPenalty = feed.field4 === "1" ? 20 : 0;
      
      const totalHealth = ((tempScore + humidityScore + fluidScore) / 3) - breachPenalty;
      return Math.max(0, Math.min(100, totalHealth)).toFixed(2);
    };
    
    // Determine weather condition based on temperature
    const getFakeWeather = (temp) => {
      if (temp < 10) return "Cold";
      if (temp < 20) return "Cool";
      if (temp < 30) return "Partly Cloudy";
      return "Sunny";
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading && !sensorData) {
    return (
      <div className="p-6 w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 w-full h-full flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 w-full h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Track and Monitor</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Map section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <iframe
            title="Container Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.009392921721!2d72.8776407!3d19.0759837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c87e95555555%3A0x40c9b8934123ef88!2sMumbai%2C%20Maharashtra%2C%20India!5e0!3m2!1sen!2sus!4v1623498231058!5m2!1sen!2sus"
            className="w-full h-96"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
        
        {/* Weather info */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Weather</h2>
            {sensorData && sensorData.weather.condition.includes("Cloud") ? 
              <Cloud className="w-12 h-12 text-blue-500" /> : 
              <Sun className="w-12 h-12 text-yellow-500" />
            }
          </div>
          
          <div className="text-center my-8">
            <div className="text-6xl font-bold text-blue-600">
              {sensorData && sensorData.weather.condition}
            </div>
          </div>
          
          {/* Order details */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Order Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Id</span>
                <span className="font-medium">{containerDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Container Id</span>
                <span className="font-medium">{containerDetails.containerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name</span>
                <span className="font-medium">{containerDetails.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Content</span>
                <span className="font-medium">{containerDetails.content}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Outer container status */}
        <div className={`p-4 rounded-lg ${
          outerContainerStatus.status === "Healthy" 
            ? "bg-green-100 border border-green-300" 
            : "bg-red-100 border border-red-300"
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              outerContainerStatus.status === "Healthy" 
                ? "bg-green-500" 
                : "bg-red-500"
            }`}></div>
            <h2 className="text-lg font-semibold">
              Outer Container: {outerContainerStatus.status}
            </h2>
          </div>
        </div>
        
        {/* AI/ML Suspicious Activity Detection */}
        <div className={`p-4 rounded-lg ${
          suspiciousActivity.detected 
            ? "bg-red-100 border border-red-300" 
            : "bg-green-100 border border-green-300"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                suspiciousActivity.detected
                  ? "bg-red-500" 
                  : "bg-green-500"
              }`}></div>
              <h2 className="text-lg font-semibold">
                AI Security: {suspiciousActivity.detected ? "Suspicious Activity Detected" : "No Suspicious Activity"}
              </h2>
            </div>
            <Camera className={`w-6 h-6 ${
              suspiciousActivity.detected ? "text-red-500" : "text-green-600"
            }`} />
          </div>
          {suspiciousActivity.detected && (
            <div className="mt-2 flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
              <p className="text-sm text-red-700">
                AI model detected suspicious activity with {suspiciousActivity.confidence}% confidence
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Realtime parameters */}
      {sensorData && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Realtime Parameters</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <RealtimeParameter 
              title="HEALTH" 
              value={sensorData.health} 
              unit="%" 
              max={100} 
            />
            <RealtimeParameter 
              title="TEMPERATURE" 
              value={sensorData.temperature} 
              unit="°F" 
              max={100} 
            />
            <RealtimeParameter 
              title="PRESSURE" 
              value={sensorData.pressure} 
              unit="BAR" 
              max={2} 
            />
            <RealtimeParameter 
              title="LUMINOSITY" 
              value={sensorData.luminosity} 
              unit="LUMEN" 
              max={200} 
            />
            <RealtimeParameter 
              title="VIBRATION" 
              value={sensorData.vibration} 
              unit="HZ" 
              max={5} 
            />
            <RealtimeParameter 
              title="HUMIDITY" 
              value={sensorData.humidity} 
              unit="%" 
              max={100} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackAndMonitor; 