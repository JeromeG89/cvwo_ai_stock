import React, { useEffect, useState } from "react";
import axios from "axios";
import { Slider } from "@mui/material";
import "../style/Table.css"; // Import the CSS file

function GetPrediction() {
  const [aucMin, setAucMin] = useState(0.8); // State for slider value
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [tickerChose, setTicker] = useState("")
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const BaseURL = "https://cvwo-ai-stock.onrender.com";
  // Fetch logs whenever aucMin or tickerChose changes
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true); // Start loading
      setError(""); // Reset error message
      const apiLink =
        tickerChose === ""
          ? `${BaseURL}/logs/${aucMin}`
          : `${BaseURL}/logs/${tickerChose}/${aucMin}`;
      try {
        const response = await axios.get(apiLink);
        setLogs(response.data);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Failed to fetch logs from the backend.");
      } finally {
        setIsLoading(false); // Stop loading
      }
    };
    fetchLogs();
  }, [aucMin, tickerChose]);

  const handleTickerChange = (event) => {
    setTicker(event.target.value); // Update ticker value
  };
  // Handle slider value changes
  const handleSliderChange = (event, newValue) => {
    setAucMin(newValue); // Update slider value
  };


  return (
    <div className="App">
      <div className="header-container">
        <h1>Logs Data </h1>
        {tickerChose === "" ? null : <h2 className="symbol-header">{tickerChose.toUpperCase()}</h2>}
        <div className="ticker-container">
          <label htmlFor="tickerInput" style={{ marginRight: "10px" }}>
            Choose Symbol:
          </label>
          <input
            type="text"
            id="tickerInput"
            value={tickerChose}
            onChange={handleTickerChange}
            placeholder="Enter ticker (e.g., AAPL)"
            style={{
              padding: "5px",
              fontSize: "14px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <div className="slider-container">
          <p style={{ color: "#444", fontWeight: "bold", fontSize: "16px", margin: "10px 0" }}>Minimum AUC Score
          <Slider
            value={aucMin}
            onChange={handleSliderChange}
            defaultValue={0.8}
            step={0.05}
            marks
            min={0.7}
            max={1.0}
            valueLabelDisplay="auto"
            style={{ width: "80%", float: "right" }}
          />
          </p>
        </div>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {isLoading ? ( // Display loading state
        <p style={{ fontWeight: "bold", color: "#007BFF" }}>
          Loading Predictions...
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ticker</th>
              <th>Log Date</th>
              <th>Price</th>
              <th>Prediction</th>
              <th>Outcome Date</th>
              <th>Outcome Price</th>
              <th>Confidence Train</th>
              <th>Confidence Test</th>
              <th>AUC SCORE</th>
              <th>Prediction Outcome</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.ticker}</td>
                <td>{log.log_date}</td>
                <td>{log.price}</td>
                <td>{log.prediction}</td>
                <td>{log.output_date}</td>
                <td>{log.final_price}</td>
                <td>{log.confidence_train}</td>
                <td>{log.confidence_test}</td>
                <td>{log.auc_roc_score}</td>
                <td
                  className={
                    log.outcome === "Pending"
                      ? "outcome-pending"
                      : log.outcome
                      ? "outcome-true"
                      : "outcome-false"
                  }
                >
                  {log.outcome === "Pending"
                    ? "Pending"
                    : log.outcome
                    ? "True"
                    : "False"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GetPrediction;
