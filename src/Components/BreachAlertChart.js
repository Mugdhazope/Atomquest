import React, { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";

const BreachAlertChart = ({ feeds }) => {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);

	useEffect(() => {
		if (!feeds || !feeds.length || !chartRef.current) return;

		const timestamps = feeds.map((feed) =>
			new Date(feed.created_at).toLocaleString()
		);
		const breachValues = feeds.map((feed) => parseFloat(feed.field4) || 0);

		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		chartInstance.current = new Chart(chartRef.current, {
			type: "bar",
			data: {
				labels: timestamps,
				datasets: [
					{
						label: "Breach Status",
						data: breachValues,
						backgroundColor: breachValues.map((value) =>
							value
								? "rgba(255, 99, 132, 0.8)"
								: "rgba(75, 192, 192, 0.8)"
						),
						borderColor: breachValues.map((value) =>
							value ? "rgb(255, 99, 132)" : "rgb(75, 192, 192)"
						),
						borderWidth: 1,
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
						text: "Security Breach Status",
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
						beginAtZero: true,
						max: 1,
						title: {
							display: true,
							text: "Status",
						},
						ticks: {
							stepSize: 1,
							callback: (value) =>
								value === 0 ? "Secure" : "Breach",
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

export default BreachAlertChart;
