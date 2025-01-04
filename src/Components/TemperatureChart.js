import React, { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";

const TemperatureChart = ({ feeds }) => {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);

	useEffect(() => {
		if (!feeds || !feeds.length || !chartRef.current) return;

		const timestamps = feeds.map((feed) =>
			new Date(feed.created_at).toLocaleString()
		);
		const temperatures = feeds.map((feed) => parseFloat(feed.field2) || 0);

		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		chartInstance.current = new Chart(chartRef.current, {
			type: "line",
			data: {
				labels: timestamps,
				datasets: [
					{
						label: "Temperature (°C)",
						data: temperatures,
						backgroundColor: "rgba(255, 99, 132, 0.2)",
						borderColor: "rgba(255, 99, 132, 1)",
						borderWidth: 2,
						tension: 0,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { position: "top" },
					title: {
						display: true,
						text: "Temperature Monitoring",
					},
				},
				scales: {
					x: {
						display: true,
						title: {
							display: true,
							text: "Time",
						},
						ticks: {
							maxRotation: 45,
							minRotation: 45,
						},
					},
					y: {
						beginAtZero: false,
						title: {
							display: true,
							text: "Temperature (°C)",
						},
						ticks: {
							callback: (value) => `${value}°C`,
						},
					},
				},
			},
		});

		return () => {
			if (chartInstance.current) {
				chartInstance.current.destroy();
			}
		};
	}, [feeds]);

	return (
		<div
			className="bg-white p-4 rounded-lg shadow-lg"
			style={{ height: "400px" }}
		>
			<canvas ref={chartRef} />
		</div>
	);
};

export default TemperatureChart;
