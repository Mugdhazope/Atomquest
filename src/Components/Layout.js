import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Box, Truck, Package, Clock, LogOut } from "lucide-react";

const Layout = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? "bg-indigo-700 text-white" : "text-gray-300 hover:bg-indigo-800 hover:text-white";
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 flex flex-col bg-gray-900 text-white border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
              <img src="/profile-placeholder.png" alt="Manager" className="w-full h-full object-cover" 
                   onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/%3E%3C/svg%3E";
                  }}
              />
            </div>
            <div>
              <h2 className="font-medium">Manager</h2>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            <li>
              <Link 
                to="/" 
                className={`flex items-center px-6 py-3 ${isActive("/")}`}
              >
                <Home className="h-5 w-5 mr-3" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/track-and-monitor" 
                className={`flex items-center px-6 py-3 ${isActive("/track-and-monitor")}`}
              >
                <Truck className="h-5 w-5 mr-3" />
                <span>Track And Monitor</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/container-summary" 
                className={`flex items-center px-6 py-3 ${isActive("/container-summary")}`}
              >
                <Box className="h-5 w-5 mr-3" />
                <span>Container Summary</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/" 
                className="flex items-center px-6 py-3 text-gray-300 hover:bg-indigo-800 hover:text-white"
              >
                <Package className="h-5 w-5 mr-3" />
                <span>Pending Orders</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/" 
                className="flex items-center px-6 py-3 text-gray-300 hover:bg-indigo-800 hover:text-white"
              >
                <Clock className="h-5 w-5 mr-3" />
                <span>Order History</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <Link
            to="/"
            className="flex items-center text-gray-300 hover:text-white"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Log out</span>
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 w-full h-full overflow-auto bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout; 