import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowDown, Search, Thermometer } from "lucide-react";

const ContainerSummary = ({ setSelectedContainerId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("orderId");
  const [sortDirection, setSortDirection] = useState("asc");
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch actual container data from ThingSpeak
  useEffect(() => {
    const fetchContainerData = async () => {
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
          
          // Determine container condition based on sensor data
          const temperature = parseFloat(latestFeed.field2);
          const humidity = parseFloat(latestFeed.field3);
          const securityBreach = parseFloat(latestFeed.field4) === 1;
          const fluidLevel = parseFloat(latestFeed.field1);
          
          const hasIssues = 
            temperature > 60 || 
            humidity > 70 || 
            securityBreach || 
            fluidLevel > 70;
          
          // Create an array with the real container plus mock ones
          setContainers([
            // Real container with actual data
            {
              orderId: "1477032963266",
              containerId: "SC101601",
              content: "Water",
              temperature: temperature.toFixed(1),
              dispatchDate: new Date().toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              }),
              status: "in-transit",
              progress: Math.min(100, Math.floor((Date.now() % 86400000) / 864000)),
              condition: hasIssues ? "Warning" : "Good",
              isReal: true
            },
            // Mock containers
            {
              orderId: "1477032965746",
              containerId: "SC101602",
              content: "Ethanol",
              temperature: "32.4",
              dispatchDate: new Date().toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              }),
              status: "in-transit",
              progress: 45,
              condition: "Good",
              isReal: false
            },
            {
              orderId: "1477032968248",
              containerId: "SC101603",
              content: "Cooking Oil",
              temperature: "78.2",
              dispatchDate: new Date().toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              }),
              status: "in-transit",
              progress: 60,
              condition: "Good",
              isReal: false
            },
            {
              orderId: "1477032966749",
              containerId: "SC101604",
              content: "Milk",
              temperature: "5.7",
              dispatchDate: new Date().toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              }),
              status: "in-transit",
              progress: 75,
              condition: "Good",
              isReal: false
            },
            {
              orderId: "1477032967254",
              containerId: "SC101605",
              content: "Diesel",
              temperature: "22.8",
              dispatchDate: new Date().toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              }),
              status: "in-transit",
              progress: 25,
              condition: "Good",
              isReal: false
            }
          ]);
        } else {
          throw new Error("No data received from API");
        }
      } catch (error) {
        console.error("Error fetching container data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContainerData();
    // Refresh data every minute
    const interval = setInterval(fetchContainerData, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const sortedContainers = [...containers]
    .filter(container => 
      container.containerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" ? 
      <ArrowUp className="w-4 h-4 inline" /> : 
      <ArrowDown className="w-4 h-4 inline" />;
  };
  
  if (loading && containers.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-800">Container Summary</h1>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="mr-2">Show</span>
          <select className="border rounded p-1 mr-2">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span>entries</span>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="border rounded py-2 px-4 pl-10 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("orderId")}
              >
                Order ID {getSortIcon("orderId")}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("containerId")}
              >
                Container ID {getSortIcon("containerId")}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("content")}
              >
                Container Content {getSortIcon("content")}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("temperature")}
              >
                Temperature (°C) {getSortIcon("temperature")}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("dispatchDate")}
              >
                Dispatch Date {getSortIcon("dispatchDate")}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status {getSortIcon("status")}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("progress")}
              >
                Progress {getSortIcon("progress")}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("condition")}
              >
                Condition {getSortIcon("condition")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedContainers.map((container) => (
              <tr key={container.containerId} className={`hover:bg-gray-50 ${container.isReal ? 'bg-blue-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {container.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {container.containerId}
                  {container.isReal && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Live</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {container.content}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Thermometer className="h-4 w-4 mr-1.5 text-red-500" />
                    {container.temperature}°C
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {container.dispatchDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {container.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${container.progress}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    container.condition === "Good" 
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {container.condition}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/container/${container.containerId}`}
                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-4 py-2 rounded"
                    onClick={() => setSelectedContainerId(container.containerId)}
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContainerSummary; 