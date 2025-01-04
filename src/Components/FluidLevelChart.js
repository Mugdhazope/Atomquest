import React, { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";

const FluidLevelChart = ({ feeds }) => {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);

	useEffect(() => {
		if (!feeds || !feeds.length || !chartRef.current) return;

		const timestamps = feeds.map((feed) =>
			new Date(feed.created_at).toLocaleString()
		);
		const fluidLevels = feeds.map((feed) => parseFloat(feed.field1) || 0);

		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		chartInstance.current = new Chart(chartRef.current, {
			type: "line",
			data: {
				labels: timestamps,
				datasets: [
					{
						label: "Fluid Level (%)",
						data: fluidLevels,
						backgroundColor: "rgba(75, 192, 192, 0.2)",
						borderColor: "rgba(75, 192, 192, 1)",
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
						text: "Fluid Level Monitoring",
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
							text: "Fluid Level (%)",
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

export default FluidLevelChart;
