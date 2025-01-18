import React, { useState } from "react";
import axios from "axios";

function PostChat({ userId, onMessageSent }) {
  const [ticker, setTicker] = useState(""); // Ticker symbol (optional)
  const [message, setMessage] = useState(""); // Post content
  const [error, setError] = useState(""); // Error message
  const [success, setSuccess] = useState(""); // Success message

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
  
    if (!message) {
      setError("Message content is required.");
      return;
    }
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/forum/chat", {
        user: String(userId), 
        ticker: ticker || null, 
        message,
      });
  
      setSuccess(`Post submitted successfully! Post ID: ${response.data.id}`); // Use specific field
      console.log("Post response:", response.data);
  
      // Clear the form
      setTicker("");
      setMessage("");
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (err) {
      console.error("Error submitting post:", err);
      if (err.response?.data?.detail) {
        setError(
          Array.isArray(err.response.data.detail)
            ? err.response.data.detail.map((d) => `${d.msg}`).join(", ")
            : err.response.data.detail
        );
      } else {
        setError("An error occurred.");
      }
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", fontFamily: "Arial" }}>
      <h2>Create a Post</h2>

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Success Message */}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Ticker (optional):
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter ticker (e.g., AAPL)"
              style={{
                padding: "5px",
                marginLeft: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "100%",
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Message:
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              placeholder="Write your post here..."
              style={{
                width: "100%",
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </label>
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Submit Post
        </button>
      </form>
    </div>
  );
}

export default PostChat;
