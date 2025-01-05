import React, { useState, useEffect, useCallback } from "react";
import TemperatureChart from "./Components/TemperatureChart";
import HumidityChart from "./Components/HumidityChart";
import BreachAlertChart from "./Components/BreachAlertChart";
import FluidLevelChart from "./Components/FluidLevelChart";
import NotificationModal from "./Components/NotificationModal";

const App = () => {
  const [sensorData, setSensorData] = useState({ feeds: [], lastUpdate: null });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshInterval, setRefreshInterval] = useState(10000);

  const playAudioAlert = useCallback(() => {
    if (!hasUserInteracted) return;
    const audio = new Audio("/alert-sound.mp3");
    audio.play().catch(console.error);
  }, [hasUserInteracted]);

  const checkThresholds = useCallback(
    (feeds) => {
      if (!feeds.length) return;

      const latestFeed = feeds[feeds.length - 1];
      const alerts = [];

      const temperature = parseFloat(latestFeed.field2);
      const humidity = parseFloat(latestFeed.field3);
      const breach = parseFloat(latestFeed.field4);
      const fluidLevel = parseFloat(latestFeed.field1);

      if (temperature > 60) alerts.push("🌡️ Temperature above threshold");
      if (humidity > 70) alerts.push("💧 Humidity above threshold");
      if (breach === 1) alerts.push("⚠️ Security breach detected");
      if (fluidLevel > 70) alerts.push("🌊 Fluid level above threshold");

      if (alerts.length > 0) {
        playAudioAlert();
        setAlertMessage(alerts.join(" • "));
        setShowAlert(true);
      }
    },
    [playAudioAlert]
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.thingspeak.com/channels/${process.env.REACT_APP_THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${process.env.REACT_APP_THINGSPEAK_API_KEY}`
      );
      const data = await response.json();
      if (data.feeds) {
        setSensorData({ feeds: data.feeds, lastUpdate: new Date() });
        checkThresholds(data.feeds);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [checkThresholds]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const handleUserInteraction = () => setHasUserInteracted(true);

  const getStatusIndicator = () => {
    if (!sensorData.feeds.length) return null;
    const latestFeed = sensorData.feeds[sensorData.feeds.length - 1];
    const hasIssues =
      parseFloat(latestFeed.field2) > 60 ||
      parseFloat(latestFeed.field3) > 70 ||
      parseFloat(latestFeed.field4) === 1 ||
      parseFloat(latestFeed.field1) > 70;

    return (
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full ${
          hasIssues ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}
      >
        <div
          className={`w-3 h-3 rounded-full ${
            hasIssues ? "bg-red-500" : "bg-green-500"
          }`}
        />
        {hasIssues ? "Issues Detected" : "All Systems Normal"}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100"
      onClick={handleUserInteraction}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sensor Data Dashboard
            </h1>
            <p className="mt-1 text-gray-500">
              Real-time monitoring and analytics
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            {getStatusIndicator()}
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={5000}>Refresh: 5s</option>
              <option value={10000}>Refresh: 10s</option>
              <option value={30000}>Refresh: 30s</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex gap-4 mb-6 overflow-x-auto">
            {["all", "temperature", "humidity", "security"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md ${
                  activeTab === tab
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {["all", "temperature", "humidity", "security"].map(
                (tab) =>
                  (activeTab === "all" || activeTab === tab) && (
                    <div
                      key={tab}
                      className="bg-white rounded-lg shadow-sm border p-4"
                    >
                      {tab === "temperature" && (
                        <TemperatureChart feeds={sensorData.feeds} />
                      )}
                      {tab === "humidity" && (
                        <HumidityChart feeds={sensorData.feeds} />
                      )}
                      {tab === "security" && (
                        <BreachAlertChart feeds={sensorData.feeds} />
                      )}
                      {tab === "all" && (
                        <FluidLevelChart feeds={sensorData.feeds} />
                      )}
                    </div>
                  )
              )}
            </div>
          )}

          {sensorData.lastUpdate && (
            <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
              <span>
                Last updated: {sensorData.lastUpdate.toLocaleString()}
              </span>
              <button
                onClick={fetchData}
                className="text-indigo-600 hover:text-indigo-700"
              >
                Refresh Now
              </button>
            </div>
          )}
        </div>
      </div>

      {showAlert && (
        <NotificationModal
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default App;
