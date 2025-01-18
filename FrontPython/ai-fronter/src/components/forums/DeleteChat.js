import React, { use } from "react";
import axios from "axios";
import "../style/Forum.css";

function DeleteChat({ chatId, onDeleteSuccess }) {

  const handleDelete = async () => {
    try {
      console.log(chatId);
      const response = await axios.delete(
        `http://127.0.0.1:8000/forum/chat/${chatId}`,

      );
      
      if (onDeleteSuccess) onDeleteSuccess(); // Refresh chat logs
    } catch (err) {
      console.error("Error deleting chat:", err);

      // Process validation error
      const errorDetail = err.response?.data?.detail;
      if (errorDetail) {
        const errorMessages = Array.isArray(errorDetail)
          ? errorDetail.map((e) => e.msg).join(", ")
          : errorDetail;
        alert(`Error: ${errorMessages}`);
      } else {
        alert("Failed to delete the message.");
      }
    }
  };

  return (
    <button className="delete" onClick={handleDelete}>
      Delete Message
    </button>
  );
}

export default DeleteChat;
