import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ChatUI.css";

function ChatUI() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [mode, setMode] = useState("generic");
  const [customPrompt, setCustomPrompt] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const switchMode = (m) => {
    setMode(m);
    setChat([]);
    
    if (m === "generic" || m === "custom") {
      setCustomPrompt("");
    } else if (m === "finance") {
      setCustomPrompt("You are an AI Personal Finance Advisor.\n- Analyze income/expenses\n- Suggest savings\n- Give investment tips");
    } else if (m === "multiagent") {
      setCustomPrompt("You are a Multi-Agent AI system.\nSTRICT FORMAT:\nResearch:\n- Response Type:\n- Intent:\n- Key Info:\n\nAnalysis:\n- Step 1:\n- Step 2:\n- Step 3:\n\nFinal Answer:\n- Clear response");
    } else if (m === "workflow") {
      setCustomPrompt("You are an AI Workflow Assistant.\nTasks:\n- Summarize\n- Generate email\n- Create to-do\nReturn structured output.");
    } else if (m === "travel") {
      setCustomPrompt("You are a Travel Assistant.\n- Suggest itinerary\n- Plan budget\n- Provide tips\n\nOutput format:\nTrip Summary:\nItinerary:\nBudget:\nSuggestions:");
    } else if (m === "fitness") {
      setCustomPrompt("You are a certified fitness coach.\n\nYour job:\n1. Workout Plan (based on goal)\n2. Diet Plan (simple meals)\n3. Tips\n\nSTRICT FORMAT:\nWorkout Plan:\n- ...\nDiet Plan:\n- ...\nTips:\n- ...");
    }
  };



  const sendMessage = async () => {
    if (!message) return;

    const res = await axios.post("http://127.0.0.1:8000/chat", {
      message: message,
      mode: mode,
      custom_prompt: customPrompt,
    });

    setChat([...chat, { user: message, bot: res.data.response }]);
    setMessage("");
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
        <button onClick={() => switchMode("fitness")}>Fitness</button>
      </div>

      <p className="mode-text">Current Mode: {mode}</p>

      <div className="main-content">
      
      {mode === "generic" && (
        <div className="input-area" style={{ width: "90%", margin: "0 auto" }}>
          <input 
            placeholder="Type your message..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}

      
      {mode !== "generic" && (
        <div className="custom-panel" style={{ width: "90%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          <textarea 
            placeholder="Enter AI persona or custom instructions (e.g., 'You are a sarcastic bot...')" 
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="custom-prompt-input"
            style={{ padding: "12px", borderRadius: "8px", resize: "vertical", minHeight: "150px", fontFamily: "inherit" }}
          />
          <div className="input-area" style={{ padding: 0 }}>
            <input 
              placeholder="Type your message..." 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      
      <div className="chat-box">
        {chat.map((c, i) => (
          <div key={i}>
            <div className="user-msg">{c.user}</div>
            <div className="bot-msg">
              <pre>{c.bot.replace(/\*/g, '')}</pre>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default ChatUI;