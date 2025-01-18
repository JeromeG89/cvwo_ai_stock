import React, { useState } from "react";
import axios from "axios";

function Auth({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Only used for registration
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!username || !password || (!isLogin && !email)) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      if (isLogin) {
        // Login request
        const response = await axios.post("http://127.0.0.1:8000/login", {
          username,
          password,
        });

        setMessage("Login successful!");
        console.log("Login response:", response.data);

        // Call the success callback and pass the user ID
        onLoginSuccess(username);
      } else {
        // Registration request
        const response = await axios.post("http://127.0.0.1:8000/register", {
          username,
          email,
          password,
        });

        setMessage("Registration successful! You can now log in.");
        console.log("Registration response:", response.data);
        setIsLogin(true); // Switch to login mode after successful registration
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.detail || "An error occurred.");
    }
  };

  return (
    <div>
      <h2>{isLogin ? "Login" : "Register"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </div>
        {!isLogin && (
          <div>
            <label>
              Email:
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </div>
        )}
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "transparent",
          border: "1px solid #007BFF",
          color: "#007BFF",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Switch to {isLogin ? "Register" : "Login"}
      </button>
    </div>
  );
}

export default Auth;
