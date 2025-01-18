import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/Forum.css";
import Auth from "./Authentication";
import PostChat from "./MakePost";
import UpdateChat from "./UpdateChat";
import DeleteChat from "./DeleteChat";

function Forum() {
  const [chat, setChat] = useState([]);
  const [tickerChose, setTicker] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  const fetchChat = async () => {
    setLoading(true);
    const apiLink =
      tickerChose === ""
        ? `http://127.0.0.1:8000/forum/chat`
        : `http://127.0.0.1:8000/forum/chat/${tickerChose}`;
    try {
      const response = await axios.get(apiLink);
      setChat(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching chat:", err);
      setError("Failed to fetch chat logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
  }, [tickerChose]);

  const handleLoginSuccess = (id) => {
    setUserId(id);
  };

  return (
    <div className="forum-container">
      <button onClick={() => navigate("/")} className="back-button">
        Back to Homepage
      </button>
      <main className="forum-content">
        <h1 className="forum-title">Forum</h1>
        <Auth onLoginSuccess={handleLoginSuccess} />
        {userId && <PostChat userId={userId} onMessageSent={fetchChat} />}
        <div className="ticker-input">
          <label htmlFor="tickerInput">Search by Ticker:</label>
          <input
            type="text"
            id="tickerInput"
            value={tickerChose}
            onChange={(e) => setTicker(e.target.value.trim())}
            placeholder="Enter ticker (e.g., AAPL)"
          />
        </div>
        {loading && <p className="loading">Loading chat logs...</p>}
        {error && <p className="error">{error}</p>}
        <div className="chat-logs">
          {chat.length > 0 ? (
            chat.map((log) => (
              <div className="chat-log" key={log.id} >
                <strong>{log.user}</strong> <span>({log.ticker || "N/A"})</span>
                <p>{log.message}</p>
                <small>{new Date(log.timestamp).toLocaleString()}</small>
                {userId === log.user && (
                  <div className="chat-actions">
                    <UpdateChat chatId={log.id} currentMessage={log.message} onUpdateSuccess={fetchChat} />
                    <DeleteChat chatId={log.id} onDeleteSuccess={fetchChat} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No chat logs found.</p>
          )}
        </div>
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Jerome Thing. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Forum;
