import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, HelpCircle, Mic } from "lucide-react";

const FloatingChatbot = ({ apiKey, feeds, selectedFluid }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([]);
	const [inputText, setInputText] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const messagesEndRef = useRef(null);
	const [hasShownWelcome, setHasShownWelcome] = useState(false);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (isOpen && !hasShownWelcome && feeds.length > 0) {
			const latestData = feeds[feeds.length - 1];
			const welcomeMessage = {
				role: "assistant",
				content: `Hi! I can help you analyze your sensor data. Current readings:

Temperature: ${parseFloat(latestData.field2).toFixed(1)}°C
Humidity: ${parseFloat(latestData.field3).toFixed(1)}%
Fluid Level: ${parseFloat(latestData.field1).toFixed(1)}%
Breach Status: ${parseInt(latestData.field4) === 1 ? "Alert" : "Normal"}

How can I assist you?`,
			};
			setMessages([welcomeMessage]);
			setHasShownWelcome(true);
		}
	}, [isOpen, hasShownWelcome, feeds]);

	const getSuggestedQuestions = () => [
		"Current temperature?",
		"Humidity trend?",
		"Any alerts?",
		"System status",
	];

	const sendMessage = async () => {
		if (!inputText.trim()) return;

		const userMessage = {
			role: "user",
			content: inputText,
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputText("");
		setIsLoading(true);

		try {
			// Prepare historical data
			const historicalData = feeds.map((feed) => ({
				timestamp: feed.created_at,
				temperature: parseFloat(feed.field2).toFixed(1),
				humidity: parseFloat(feed.field3).toFixed(1),
				fluidLevel: parseFloat(feed.field1).toFixed(1),
				breachStatus: parseInt(feed.field4),
			}));

			const response = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						contents: [
							{
								parts: [
									{
										text: `You are a sensor data analysis assistant. Here is the historical sensor data for ${selectedFluid} from newest to oldest:

${historicalData
	.map(
		(d) => `
Timestamp: ${d.timestamp}
Temperature: ${d.temperature}°C
Humidity: ${d.humidity}%
Fluid Level: ${d.fluidLevel}%
Breach Status: ${d.breachStatus === 1 ? "Alert" : "Normal"}
`
	)
	.join("---")}

Keep responses brief and focused on sensor data analysis. If the question isn't about sensor data, suggest relevant questions instead.

User question: ${inputText}`,
									},
								],
							},
						],
					}),
				}
			);

			const data = await response.json();

			if (data.candidates && data.candidates[0].content) {
				const aiMessage = {
					role: "assistant",
					content: data.candidates[0].content.parts[0].text,
				};
				setMessages((prev) => [...prev, aiMessage]);
			} else if (data.error) {
				console.error("Gemini API Error:", data.error);
				const errorMessage = {
					role: "assistant",
					content:
						"Sorry, I encountered an error communicating with the AI service. Please try again later.",
				};
				setMessages((prev) => [...prev, errorMessage]);
			}
		} catch (error) {
			console.error("Error:", error);
			const errorMessage = {
				role: "assistant",
				content: "Sorry, I encountered an error. Please try again.",
			};
			setMessages((prev) => [...prev, errorMessage]);
		}

		setIsLoading(false);
	};

	// Speech-to-Text Functionality
	const handleSpeechRecognition = () => {
		if (!("webkitSpeechRecognition" in window)) {
			alert("Your browser does not support Speech Recognition.");
			return;
		}

		const recognition = new window.webkitSpeechRecognition();
		recognition.continuous = false;
		recognition.interimResults = false;
		recognition.lang = "en-US";

		recognition.onstart = () => setIsListening(true);

		recognition.onresult = (event) => {
			const transcript = event.results[0][0].transcript;
			setInputText(transcript);
		};

		recognition.onend = () => setIsListening(false);

		recognition.onerror = (event) => {
			console.error("Speech Recognition Error:", event.error);
			setIsListening(false);
		};

		recognition.start();
	};

	// Rest of the component remains unchanged
	return (
		<>
			{/* Floating button */}
			<button
				onClick={() => setIsOpen(true)}
				className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 flex items-center justify-center transition-all duration-200 ${
					isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
				}`}
			>
				<MessageCircle className="w-6 h-6" />
			</button>

			{/* Chat window */}
			<div
				className={`fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl transition-all duration-200 transform ${
					isOpen
						? "scale-100 opacity-100"
						: "scale-95 opacity-0 pointer-events-none"
				}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<div className="flex items-center space-x-2">
						<HelpCircle className="w-5 h-5 text-indigo-600" />
						<h2 className="text-lg font-semibold text-gray-800">
							Sensor Assistant
						</h2>
					</div>
					<button
						onClick={() => setIsOpen(false)}
						className="text-gray-500 hover:text-gray-700"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Messages */}
				<div className="h-96 overflow-y-auto p-4 space-y-4">
					{messages.map((message, index) => (
						<div
							key={index}
							className={`flex ${
								message.role === "user"
									? "justify-end"
									: "justify-start"
							}`}
						>
							<div
								className={`max-w-[75%] rounded-lg p-3 ${
									message.role === "user"
										? "bg-indigo-600 text-white"
										: "bg-gray-100 text-gray-900"
								}`}
							>
								<pre className="whitespace-pre-wrap font-sans">
									{message.content}
								</pre>
							</div>
						</div>
					))}
					{isLoading && (
						<div className="flex justify-start">
							<div className="bg-gray-100 rounded-lg p-3 text-gray-900">
								Analyzing...
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Quick questions */}
				<div className="border-t p-2 bg-gray-50">
					<div className="flex gap-2 overflow-x-auto pb-2">
						{getSuggestedQuestions().map((question, index) => (
							<button
								key={index}
								onClick={() => setInputText(question)}
								className="text-sm bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 whitespace-nowrap text-gray-700"
							>
								{question}
							</button>
						))}
					</div>
				</div>

				{/* Input area */}
				<div className="border-t p-4">
					<div className="flex space-x-2">
						<input
							type="text"
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							onKeyPress={(e) =>
								e.key === "Enter" && sendMessage()
							}
							placeholder="Ask about sensor data..."
							className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
						<button
							onClick={handleSpeechRecognition}
							className={`bg-gray-200 rounded-lg px-4 py-2 hover:bg-gray-300 focus:outline-none focus:ring-2 ${
								isListening
									? "bg-green-200 text-green-800"
									: "text-gray-800"
							}`}
						>
							<Mic className="w-5 h-5" />
						</button>
						<button
							onClick={sendMessage}
							disabled={isLoading}
							className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							<Send className="w-5 h-5" />
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default FloatingChatbot;
