import React, { useState, useEffect, useCallback } from "react";
import TemperatureChart from "./Components/TemperatureChart";
import HumidityChart from "./Components/HumidityChart";
import BreachAlertChart from "./Components/BreachAlertChart";
import FluidLevelChart from "./Components/FluidLevelChart";
import NotificationModal from "./Components/NotificationModal";

const App = () => {
	const [sensorData, setSensorData] = useState({
		feeds: [],
		lastUpdate: null,
	});
	const [showAlert, setShowAlert] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [hasUserInteracted, setHasUserInteracted] = useState(false); // Track if the user has interacted

	const playAudioAlert = () => {
		if (!hasUserInteracted) return; // Prevent playing the sound if the user hasn't interacted

		const audio = new Audio("/alert-sound.mp3"); // Path to your audio file
		audio.play().catch((error) => {
			console.error("Error playing audio:", error);
		});
	};

	const checkThresholds = useCallback(
		(feeds) => {
			let temperatureAlert = false;
			let humidityAlert = false;
			let breachAlert = false;
			let fluidLevelAlert = false;
			let message = "";

			feeds.forEach((feed) => {
				const temperature = parseFloat(feed.field2);
				const humidity = parseFloat(feed.field3);
				const breach = parseFloat(feed.field4);
				const fluidLevel = parseFloat(feed.field1);

				if (temperature > 60) {
					temperatureAlert = true;
					message += "Temperature above threshold. ";
				}
				if (humidity > 70) {
					humidityAlert = true;
					message += "Humidity above threshold. ";
				}
				if (breach === 1) {
					breachAlert = true;
					message += "Breach detected. ";
				}
				if (fluidLevel > 70) {
					fluidLevelAlert = true;
					message += "Fluid level above threshold. ";
				}
			});

			if (
				temperatureAlert ||
				humidityAlert ||
				breachAlert ||
				fluidLevelAlert
			) {
				playAudioAlert(); // Trigger the sound alert
				setAlertMessage(message);
				setShowAlert(true);
			}
		},
		[hasUserInteracted]
	); // Dependency now includes hasUserInteracted

	useEffect(() => {
		const updateSensorData = async () => {
			try {
				const response = await fetch(
					`https://api.thingspeak.com/channels/${process.env.REACT_APP_THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${process.env.REACT_APP_THINGSPEAK_API_KEY}`
				);
				const data = await response.json();
				if (data && data.feeds) {
					setSensorData({
						feeds: data.feeds,
						lastUpdate: new Date(),
					});
					checkThresholds(data.feeds); // Check thresholds after data is fetched
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		updateSensorData();
		const interval = setInterval(updateSensorData, 10000);
		return () => clearInterval(interval);
	}, [checkThresholds]); // Now checkThresholds is in the dependency array

	// Handle user interaction to allow audio playback
	const handleUserInteraction = () => {
		setHasUserInteracted(true); // User interaction occurred
	};

	return (
		<div
			className="bg-gray-50 min-h-screen flex flex-col items-center py-10"
			onClick={handleUserInteraction}
		>
			<div className="bg-white w-full max-w-7xl p-6 rounded-lg shadow-lg">
				<h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
					Sensor Data Dashboard
				</h1>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
					<div className="chart-card">
						<TemperatureChart feeds={sensorData.feeds} />
					</div>
					<div className="chart-card">
						<HumidityChart feeds={sensorData.feeds} />
					</div>
					<div className="chart-card">
						<BreachAlertChart feeds={sensorData.feeds} />
					</div>
					<div className="chart-card">
						<FluidLevelChart feeds={sensorData.feeds} />
					</div>
				</div>

				{sensorData.lastUpdate && (
					<div className="text-sm text-gray-500 text-center mt-6">
						Last updated: {sensorData.lastUpdate.toLocaleString()}
					</div>
				)}
			</div>

			{/* Show Modal if alert is triggered */}
			{showAlert && (
				<NotificationModal
					message={alertMessage}
					onClose={() => setShowAlert(false)} // Close the modal
				/>
			)}
		</div>
	);
};

export default App;
