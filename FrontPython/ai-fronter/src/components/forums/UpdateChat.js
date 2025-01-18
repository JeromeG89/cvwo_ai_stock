import React, { useState } from "react";
import axios from "axios";
import "../style/Forum.css";

function UpdateChat({ chatId, currentMessage, onUpdateSuccess }) {
  const [newMessage, setNewMessage] = useState(currentMessage);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdate = async () => {
    console.log(chatId, newMessage)
    try {
        const response = await axios.put(
            `http://127.0.0.1:8000/forum/chat/${chatId}`,
            {
              message: newMessage.trim(),
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
      setSuccess(response.data.message);
      setError("");
      if (onUpdateSuccess) onUpdateSuccess(); // Refresh chat logs
    } catch (err) {
      console.error("Error updating chat:", err);

      // Process validation error
      const errorDetail = err.response?.data?.detail;
      if (errorDetail) {
        const errorMessages = Array.isArray(errorDetail)
          ? errorDetail.map((e) => e.msg).join(", ")
          : errorDetail;
        setError(errorMessages);
      } else {
        setError("Failed to update the message.");
      }
    }
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        rows="3"
        style={{ width: "100%", padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
      />
      <button className="update" onClick={handleUpdate}>
        Update Message
      </button>
      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default UpdateChat;
