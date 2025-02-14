import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

function App() {
  const [text, setText] = useState("");
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const MAX_TEXT_LENGTH = 1000;


  useEffect(() => {
    fetchLogs();
  }, []);

  // fetch logs from backend API
  const fetchLogs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/logs");
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  // handles text submission for analysis
  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("Please enter text before submitting!");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/score", { text });
      setResult(response.data); // store result
      fetchLogs(); // reset logs
      setText(""); // clear input
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  // clears logs from frontend and backend
  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear all data?")) return;

    try {
      await axios.delete("http://127.0.0.1:5000/clear");
      setLogs([]); // clear logs state
      setResult(null); // reset analysis results
      setText(""); // reset input
    } catch (error) {
      console.error("Error clearing logs:", error);
    }
  };

  //  tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const log = logs.find((l) => l.id === payload[0].payload.id); // find log entry by id
      if (!log) return null; // handle case where log missing

      return (
        <div style={{
          background: "rgba(255, 255, 255, 0.9)", // transparent tooltip
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
          <p><strong>ID:</strong> {log.id}</p>
          <p><strong>Text:</strong> {log.text}</p>
          <p><strong>Gibberish:</strong> {log.gibberish} ({(log.gibberish_score * 100).toFixed(2)}%)</p>
          <p><strong>Emotion:</strong> {log.emotion} ({(log.emotion_score * 100).toFixed(2)}%)</p>
        </div>
      );
    }
    return null;
  };

  // character limit  
  const handleChange = (e) => {
    if (e.target.value.length > MAX_TEXT_LENGTH) {
      alert(`Text is too long! Maximum ${MAX_TEXT_LENGTH} characters.`);
      return;
    }
    setText(e.target.value);
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      width: "100vw",
      minHeight: "100vh",
      fontFamily: "Poppins, sans-serif",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "900px", width: "100%", textAlign: "center" }}>
        <h1>Trustwise Text Analysis</h1>
      </div>

      {/* text input section */}
      <div style={{ 
        background: "#fff", 
        padding: "20px", 
        borderRadius: "10px", 
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", 
        width: "100%", 
        maxWidth: "900px", 
        marginBottom: "20px"
      }}>
        <h3 style={{ textAlign: "left", marginBottom: "10px", paddingLeft: "10px" }}>Enter Text for Analysis</h3>
        <textarea
          rows="3"
          placeholder="Enter text to analyze..."
          value={text}
          onChange={handleChange}
          style={{ 
            width: "calc(100% - 20px)",
            marginLeft: "10px",
            padding: "10px", 
            borderRadius: "5px", 
            border: "1px solid #ccc", 
            fontSize: "16px",
            resize: "vertical", 
            maxHeight: "120px",
            overflowY: "auto"
          }}
        />
        <p style={{ textAlign: "right", fontSize: "12px", color: text.length > 450 ? "red" : "black" }}>
          {text.length}/{MAX_TEXT_LENGTH}
        </p>
        <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "10px" }}>
          <button onClick={handleSubmit} style={{ backgroundColor: "#007bff", color: "white", padding: "10px 15px", borderRadius: "5px", border: "none", cursor: "pointer" }}>
            Analyze
          </button>
          <button onClick={handleClearLogs} style={{ backgroundColor: "red", color: "white", padding: "10px 15px", borderRadius: "5px", border: "none", cursor: "pointer" }}>
            Clear Data
          </button>
        </div>
      </div>

      {/* score trends and analysis results*/}
      <div style={{ 
        background: "#fff", 
        padding: "20px", 
        borderRadius: "10px", 
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", 
        width: "100%", 
        maxWidth: "900px", 
        marginBottom: "20px",
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center"
      }}>
        {/*graph section */}
        <div style={{ width: "75%" }}>
          <h3>Score Trends</h3>
          {logs.length > 0 ? (
            <LineChart width={600} height={300} data={logs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="id" />
              <YAxis domain={[0, 1]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="gibberish_score" stroke="red" strokeWidth={2} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="emotion_score" stroke="blue" strokeWidth={2} dot={{ r: 5 }} />
            </LineChart>
          ) : (
            <p>No data available to display the graph.</p>
          )}
        </div>

        {/* analysis results section */}
        {result && (
          <div style={{ width: "25%", padding: "10px", textAlign: "center" }}>
            <h3>Analysis Results</h3>
            <p><strong>Gibberish:</strong> {result.gibberish} ({(result.gibberish_score * 100).toFixed(2)}%)</p>
            <p><strong>Emotion:</strong> {result.emotion} ({(result.emotion_score * 100).toFixed(2)}%)</p>
          </div>
        )}
      </div>

      {/* history table */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "900px" }}>
        <h3>History</h3>
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Text</th>
                <th>Gibberish Score</th>
                <th>Gibberish Type</th>
                <th>Emotion Score</th>
                <th>Emotion Type</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.text}</td>
                  <td>{(log.gibberish_score * 100).toFixed(2)}%</td>
                  <td>{log.gibberish}</td>
                  <td>{(log.emotion_score * 100).toFixed(2)}%</td>
                  <td>{log.emotion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
