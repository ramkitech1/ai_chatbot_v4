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

  
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");

  
  const [foodInput, setFoodInput] = useState("");
  const [foodLog, setFoodLog] = useState([]);
  const [isTrackingCalories, setIsTrackingCalories] = useState(false);

  const [currency, setCurrency] = useState("INR");
  const [darkMode, setDarkMode] = useState(false);

  const currencyOptions = [
    { value: "INR", label: "₹ INR" },
    { value: "USD", label: "$ USD" },
    { value: "EUR", label: "€ EUR" },
    { value: "GBP", label: "£ GBP" },
    { value: "JPY", label: "¥ JPY" },
    { value: "AUD", label: "A$ AUD" },
    { value: "CAD", label: "C$ CAD" },
    { value: "CHF", label: "CHF" },
    { value: "CNY", label: "¥ CNY" },
    { value: "SGD", label: "S$ SGD" },
    { value: "NZD", label: "NZ$ NZD" }
  ];

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
  };

  const clearChat = () => {
    setChat([]);
    setMessage("");
    setTaskInput("");
    setLocation("");
    setBudget("");
    setDays("");
    setAge("");
    setHeight("");
    setWeight("");
    setGoal("");
    setFoodInput("");
    setFoodLog([]);
  };

  const calculateBMI = () => {
    if (weight && height) {
      const hInMeters = height / 100;
      const bmiValue = (weight / (hInMeters * hInMeters)).toFixed(1);
      let category = "Normal";
      if (bmiValue < 18.5) category = "Underweight";
      else if (bmiValue >= 25 && bmiValue < 30) category = "Overweight";
      else if (bmiValue >= 30) category = "Obese";
      return { bmi: bmiValue, category };
    }
    return null;
  };
  const bmiData = calculateBMI();

  const trackCalories = async () => {
    if (!foodInput) return;
    setIsTrackingCalories(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        message: `Estimate the total calories for the following food item. Respond ONLY with the number of calories (e.g., 250). Do not include any text, letters, or explanation. Food: ${foodInput}`,
        mode: "custom",
      });
      const cals = parseInt(res.data.response.replace(/\D/g, ""), 10) || 0;
      setFoodLog([...foodLog, { food: foodInput, calories: cals }]);
      setFoodInput("");
    } catch (e) {
      console.error(e);
    }
    setIsTrackingCalories(false);
  };

  const sendMessage = async () => {
    let input = message;

    if (mode === "workflow") input = taskInput;
    if (mode === "travel")
      input = `Location: ${location}, Budget: ${budget} ${currency}, Days: ${days}`;
    if (mode === "fitness")
      input = `Age: ${age}, Height: ${height}cm, Weight: ${weight}kg, Goal: ${goal}`;

    if (!input) return;

    const res = await axios.post("http://127.0.0.1:8000/chat", {
      message: input,
      mode,
      custom_prompt: customPrompt,
    });

    setChat([...chat, { user: input, bot: res.data.response }]);
    if (["generic", "custom", "multiagent", "finance"].includes(mode)) setMessage("");
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
      
      {["generic", "multiagent", "finance"].includes(mode) && (
        <div className="input-area" style={{ width: "90%", margin: "0 auto" }}>
          <input 
            placeholder={mode === "multiagent" ? "Ask the multi-agent team..." : mode === "finance" ? "Ask your finance query..." : "Type your message..."} 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}

      
      {mode === "custom" && (
        <div className="custom-panel" style={{ width: "90%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          <textarea 
            placeholder="Enter AI persona or custom instructions (e.g., 'You are a sarcastic bot...')" 
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="custom-prompt-input"
            style={{ padding: "12px", borderRadius: "8px", resize: "vertical", minHeight: "60px", fontFamily: "inherit" }}
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

      
      {mode === "workflow" && (
        <div className="workflow-panel">
          <textarea
            placeholder="Describe your workflow task (e.g., Extract data and format as JSON)..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
          <div className="workflow-actions">
            <button onClick={sendMessage}>Run Workflow</button>
            <button onClick={() => setTaskInput("")}>Clear</button>
            <button onClick={clearChat}>Reset</button>
          </div>
        </div>
      )}

      
      {mode === "travel" && (
        <div className="travel-panel">
          <div className="travel-inputs">
            <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
            <input placeholder="Budget" type="number" value={budget} onChange={e => setBudget(e.target.value)} />
            <Select 
              className="currency-dropdown"
              options={currencyOptions}
              value={currencyOptions.find(c => c.value === currency)}
              onChange={(option) => setCurrency(option.value)}
              styles={{
                control: (base) => ({
                  ...base,
                  height: "42px",
                  minHeight: "42px",
                  borderRadius: "10px",
                  borderColor: "#ccc",
                })
              }}
            />
            <input placeholder="Days" type="number" value={days} onChange={e => setDays(e.target.value)} />
          </div>
          <div className="travel-actions">
            <button onClick={sendMessage}>Get Itinerary</button>
            <button onClick={clearChat}>Clear</button>
          </div>
        </div>
      )}

      
      {mode === "fitness" && (
        <div className="fitness-panel">
          <div className="fitness-layout">
            <div className="fitness-card">
              <h3>Workout Plan</h3>
              <div className="fitness-inputs">
                <input placeholder="Age" value={age} onChange={e => setAge(e.target.value)} />
                <input placeholder="Height (cm)" value={height} onChange={e => setHeight(e.target.value)} />
                <input placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} />
                <select value={goal} onChange={e => setGoal(e.target.value)}>
                  <option value="">Goal</option>
                  <option value="weight loss">Weight Loss</option>
                  <option value="muscle gain">Muscle Gain</option>
                  <option value="fitness">Fitness</option>
                </select>
              </div>
              {bmiData && (
                <div className={`bmi-display ${bmiData.category.toLowerCase()}`}>
                  <span>BMI: {bmiData.bmi}</span>
                  <span className="bmi-category">{bmiData.category}</span>
                </div>
              )}
              <div className="fitness-actions">
                <button onClick={sendMessage}>Get Plan</button>
                <button onClick={clearChat}>Clear</button>
              </div>
            </div>

            <div className="fitness-card calorie-card">
              <h3>Calorie Tracker</h3>
              <div className="calorie-inputs">
                <input 
                  placeholder="What did you eat?" 
                  value={foodInput} 
                  onChange={e => setFoodInput(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && trackCalories()}
                />
                <button onClick={trackCalories} disabled={isTrackingCalories}>
                  {isTrackingCalories ? "..." : "+"}
                </button>
              </div>
              <div className="food-log">
                {foodLog.map((log, i) => (
                  <div key={i} className="food-log-item">
                    <span>{log.food}</span>
                    <span className="food-cals">{log.calories} kcal</span>
                  </div>
                ))}
              </div>
              <div className="food-log-total">
                <strong>Total: </strong>
                <span>{foodLog.reduce((acc, curr) => acc + curr.calories, 0)} kcal</span>
              </div>
            </div>
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