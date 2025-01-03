import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8080/api/logs")
      .then(response => {
        setLogs(response.data);
      })
      .catch(err => {
        console.error("Error fetching logs:", err);
        setError("Failed to fetch logs from the backend.");
      });
  }, []);

  return (
    <div className="App">
      <h1>Logs Data</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ticker</th>
            <th>Log Date</th>
            <th>Price</th>
            <th>Prediction</th>
            <th>Confidence Train</th>
            <th>Confidence Test</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.ticker}</td>
              <td>{log.log_date}</td>
              <td>{log.price}</td>
              <td>{log.prediction}</td>
              <td>{log.confidence_train}</td>
              <td>{log.confidence_test}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
