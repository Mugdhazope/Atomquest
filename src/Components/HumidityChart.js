import React, { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";

const HumidityChart = ({ feeds }) => {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);

	useEffect(() => {
		if (!feeds || !feeds.length || !chartRef.current) return;

		const timestamps = feeds.map((feed) =>
			new Date(feed.created_at).toLocaleString()
		);
		const humidityValues = feeds.map(
			(feed) => parseFloat(feed.field3) || 0
		);

		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		chartInstance.current = new Chart(chartRef.current, {
			type: "line",
			data: {
				labels: timestamps,
				datasets: [
					{
						label: "Humidity (%)",
						data: humidityValues,
						backgroundColor: "rgba(54, 162, 235, 0.2)",
						borderColor: "rgba(54, 162, 235, 1)",
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
						text: "Humidity Monitoring",
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
							text: "Humidity (%)",
						},
						ticks: {
							callback: (value) => `${value}%`,
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

export default HumidityChart;
