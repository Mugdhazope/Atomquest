import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ContainerDashboard from "./Components/ContainerDashboard";
import Layout from "./Components/Layout";
import HomePage from "./Components/HomePage";
import ContainerSummary from "./Components/ContainerSummary";
import TrackAndMonitor from "./Components/TrackAndMonitor";
import "./App.css";

function App() {
	const [selectedContainerId, setSelectedContainerId] = useState(null);
	
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<HomePage />} />
					<Route path="container-summary" element={<ContainerSummary setSelectedContainerId={setSelectedContainerId} />} />
					<Route path="track-and-monitor" element={<TrackAndMonitor />} />
					<Route path="container/:containerId" element={<ContainerDashboard />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
