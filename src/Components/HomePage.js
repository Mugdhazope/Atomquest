import React, { useState, useEffect } from "react";
import { Package, Truck, ThumbsUp, AlertTriangle, Activity, Clock } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => {
  return (
    <div className={`p-6 rounded-lg shadow-md ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600">{title}</p>
          <h3 className={`text-4xl font-bold mt-2 ${color}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [dashboardData, setDashboardData] = useState({
    pendingOrders: 0,
    inTransit: 0,
    delivered: 0,
    exceptions: 0,
    badContainers: 0,
    ordersOnTime: 100
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from ThingSpeak
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
          
          // Detect exception conditions
          const temperature = parseFloat(latestFeed.field2);
          const humidity = parseFloat(latestFeed.field3);
          const securityBreach = parseFloat(latestFeed.field4) === 1;
          const fluidLevel = parseFloat(latestFeed.field1);
          
          // Count exceptions
          let exceptionCount = 0;
          if (temperature > 60) exceptionCount++;
          if (humidity > 70) exceptionCount++;
          if (securityBreach) exceptionCount++;
          if (fluidLevel > 70) exceptionCount++;
          
          // We have one real container in transit
          setDashboardData({
            pendingOrders: 3, // Using a constant for now
            inTransit: 1,     // We have one container
            delivered: 0,     // None delivered yet
            exceptions: exceptionCount,
            badContainers: securityBreach ? 1 : 0,
            ordersOnTime: 100
          });
        } else {
          throw new Error("No data received from API");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <div className="p-8 w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 w-full h-full flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Home Page</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* First row of stats */}
        <StatCard 
          title="PENDING ORDERS" 
          value={dashboardData.pendingOrders.toString()} 
          icon={Package} 
          color="text-blue-600" 
          bgColor="bg-blue-50" 
        />
        
        <StatCard 
          title="IN-TRANSIT" 
          value={dashboardData.inTransit.toString()} 
          icon={Truck} 
          color="text-yellow-600" 
          bgColor="bg-yellow-50" 
        />
        
        <StatCard 
          title="DELIVERED" 
          value={dashboardData.delivered.toString()} 
          icon={ThumbsUp} 
          color="text-green-600" 
          bgColor="bg-green-50" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Second row of stats */}
        <StatCard 
          title="EXCEPTIONS" 
          value={dashboardData.exceptions.toString()} 
          icon={AlertTriangle} 
          color="text-red-600" 
          bgColor="bg-red-50" 
        />
        
        <StatCard 
          title="BAD CONTAINERS" 
          value={dashboardData.badContainers.toString()} 
          icon={Activity} 
          color="text-yellow-600" 
          bgColor="bg-yellow-50" 
        />
        
        <StatCard 
          title="ORDERS ON-TIME (%)" 
          value={dashboardData.ordersOnTime.toString()} 
          icon={Clock} 
          color="text-purple-600" 
          bgColor="bg-purple-50" 
        />
      </div>

      <div className="mt-10 text-center text-sm text-gray-500">
        &copy; 2023 Brought to you by Atomquest
      </div>
    </div>
  );
};

export default HomePage; 