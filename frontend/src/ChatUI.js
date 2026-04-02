import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "./ChatUI.css";

function ChatUI() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [mode, setMode] = useState("generic");

  const [customPrompt, setCustomPrompt] = useState("");
  const [taskInput, setTaskInput] = useState("");

  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");

  const [currency, setCurrency] = useState("INR");
  const [darkMode, setDarkMode] = useState(false);

  const currencyOptions = [
    { value: "INR", label: "₹ INR" },
    { value: "USD", label: "$ USD" },
    { value: "EUR", label: "€ EUR" },
    { value: "GBP", label: "£ GBP" },
    { value: "AED", label: "AED" },
    { value: "JPY", label: "¥ JPY" },
    { value: "CAD", label: "C$ CAD" },
    { value: "AUD", label: "A$ AUD" }
  ];

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const renderTravelCards = (text) => {
    const clean = text.replace(/\*\*/g, "");

    const sections = {
      summary: "",
      itinerary: "",
      budget: "",
      suggestions: "",
    };

    let current = "";

    clean.split("\n").forEach((line) => {
      const lower = line.toLowerCase();

      if (lower.includes("trip summary")) current = "summary";
      else if (lower.includes("itinerary")) current = "itinerary";
      else if (lower.includes("budget")) current = "budget";
      else if (lower.includes("suggestions")) current = "suggestions";

      if (current) sections[current] += line + "\n";
    });

    return (
      <>
        {sections.summary && (
          <div className="card summary">
            <h3>Trip Summary</h3>
            <pre>{sections.summary}</pre>
          </div>
        )}

        {sections.itinerary && (
          <div className="card itinerary">
            <h3>Itinerary</h3>
            <pre>{sections.itinerary}</pre>
          </div>
        )}

        {sections.budget && (
          <div className="card budget">
            <h3>Budget</h3>
            <pre>{sections.budget}</pre>
          </div>
        )}

        {sections.suggestions && (
          <div className="card suggestions">
            <h3>Suggestions</h3>
            <pre>{sections.suggestions}</pre>
          </div>
        )}
      </>
    );
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setChat([]);
  };

  const clearChat = () => {
    setChat([]);
    setMessage("");
    setTaskInput("");
    setLocation("");
    setBudget("");
    setDays("");
    setCurrency("INR");
  };

  const openMaps = () => {
    if (!location) return;
    const url = `https://www.google.com/maps?q=${encodeURIComponent(location)}`;
    window.open(url, "_blank");
  };

  const sendMessage = async () => {
    let input = message;

    if (mode === "workflow") input = taskInput;

    if (mode === "travel") {
      input = `Location: ${location}, Budget: ${budget} ${currency}, Days: ${days}`;
    }

    if (!input) return;

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        message: input,
        mode,
        custom_prompt: customPrompt,
      });

      setChat([...chat, { user: input, bot: res.data.response }]);

      setMessage("");
      setTaskInput("");
    } catch (err) {
      console.error(err);
      alert("Backend not connected!");
    }
  };

  return (
    <div className={`container ${darkMode ? "dark" : ""}`}>
      <h2>AI Multi-Mode Assistant</h2>

      <div className="dark-toggle">
        <button onClick={toggleDarkMode}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="mode-buttons">
        <button onClick={() => switchMode("generic")}>Generic</button>
        <button onClick={() => switchMode("custom")}>User Prompt</button>
        <button onClick={() => switchMode("finance")}>Finance</button>
        <button onClick={() => switchMode("multiagent")}>Multi-Agent</button>
        <button onClick={() => switchMode("workflow")}>Workflow</button>
        <button onClick={() => switchMode("travel")}>Travel</button>
      </div>

      <p className="mode-text">Current Mode: {mode}</p>

      
      {mode === "custom" && (
        <div className="workflow-panel">
          <textarea
            className="prompt-box"
            placeholder="Enter your prompt..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
        </div>
      )}

      
      {mode === "workflow" && (
        <div className="workflow-panel">
          <textarea
            placeholder="Enter your task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
          <div className="workflow-actions">
            <button onClick={sendMessage}>Run Task</button>
            <button onClick={clearChat}>Clear</button>
          </div>
        </div>
      )}

      
      {mode === "travel" && (
        <div className="travel-panel">

          {/* INPUTS ROW */}
          <div className="travel-inputs">
            <input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <input
              placeholder="Budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />

            <input
              placeholder="Days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />

            <Select
              options={currencyOptions}
              value={currencyOptions.find(opt => opt.value === currency)}
              onChange={(selected) => setCurrency(selected.value)}
              className="currency-dropdown"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? "#2a2a2a" : "white",
                  borderColor: "#555",
                  borderRadius: "10px",
                  minHeight: "42px",
                  height: "42px"
                }),
                valueContainer: (base) => ({
                  ...base,
                  height: "42px"
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: "42px"
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? "#2a2a2a" : "white",
                  borderRadius: "10px"
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? "#4cafef"
                    : darkMode
                    ? "#2a2a2a"
                    : "white",
                  color: darkMode ? "#ddd" : "#444"
                }),
                singleValue: (base) => ({
                  ...base,
                  color: darkMode ? "#bbb" : "#666"
                }),
                indicatorSeparator: () => ({ display: "none" })
              }}
            />
          </div>

          
          <div className="travel-actions">
            <button onClick={sendMessage}>Plan Trip</button>
            <button onClick={clearChat}>Clear</button>
            <button onClick={openMaps}>Open in Maps</button>
          </div>

        </div>
      )}

      
      <div className="chat-box">
        {chat.map((c, i) => (
          <div key={i}>
            <div className="user-msg">{c.user}</div>
            <div className="bot-msg">
              {mode === "travel" ? (
                <div className="travel-cards">
                  {renderTravelCards(c.bot)}
                </div>
              ) : (
                <pre>{c.bot.replace(/\*\*/g, "")}</pre>
              )}
            </div>
          </div>
        ))}
      </div>

      
      {mode !== "workflow" && mode !== "travel" && (
        <div className="input-area">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default ChatUI;