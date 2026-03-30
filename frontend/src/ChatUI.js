import React, { useState } from "react";
import axios from "axios";
import "./ChatUI.css";

function ChatUI() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [mode, setMode] = useState("generic");
  const [customPrompt, setCustomPrompt] = useState("");
  const [taskInput, setTaskInput] = useState("");

  const switchMode = (newMode) => {
    setMode(newMode);
    setChat([]);
  };

  const clearChat = () => {
    setChat([]);
    setMessage("");
    setTaskInput("");
  };

  const sendMessage = async () => {
    const input = mode === "workflow" ? taskInput : message;
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
    <div className="container">
      <h2>AI Multi-Mode Assistant</h2>

      {/* MODE BUTTONS */}
      <div className="mode-buttons">
        <button className={mode==="generic"?"active":""} onClick={()=>switchMode("generic")}>Generic</button>
        <button className={mode==="custom"?"active":""} onClick={()=>switchMode("custom")}>User Prompt</button>
        <button className={mode==="finance"?"active":""} onClick={()=>switchMode("finance")}>Finance</button>
        <button className={mode==="multiagent"?"active":""} onClick={()=>switchMode("multiagent")}>Multi-Agent</button>
        <button className={mode==="workflow"?"active":""} onClick={()=>switchMode("workflow")}>Workflow</button>
      </div>

      <p className="mode-text">Current Mode: {mode}</p>

      {/* CUSTOM PROMPT */}
      {mode === "custom" && (
        <textarea
          className="prompt-box"
          placeholder="Enter your prompt here..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
        />
      )}

      {/* WORKFLOW PANEL */}
      {mode === "workflow" && (
        <div className="workflow-panel">
          <textarea
            placeholder="Enter your task... (e.g., Summarize this text)"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />

          <div className="workflow-actions">
            <button onClick={sendMessage}>Run Task</button>
            <button onClick={clearChat}>Clear</button>
          </div>
        </div>
      )}

      {/* CHAT */}
      <div className="chat-box">
        {chat.map((c, i) => (
          <div key={i}>
            <div className="user-msg">{c.user}</div>

            <div className="bot-msg">
              <pre>{c.bot}</pre>
            </div>
          </div>
        ))}
      </div>

      {/* NORMAL INPUT (HIDDEN IN WORKFLOW) */}
      {mode !== "workflow" && (
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