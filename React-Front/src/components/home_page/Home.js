import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="navbar">
        <h1 className="logo">Jerome's stock predictions</h1>
        <nav>
          <button onClick={() => navigate("/logs")} className="nav-button">Logs</button>
          <button onClick={() => navigate("/forum")} className="nav-button">Forums</button>
        </nav>
      </header>
      <main className="hero-section">
        <h1 className="hero-title">Welcome to the stock forum</h1>
        <p className="hero-description">
          Analyze stocks, participate in discussions, and stay ahead in the market.
        </p>
        <div className="cta-buttons">
          <button onClick={() => navigate("/logs")} className="cta-button">
            View Logs
          </button>
          <button onClick={() => navigate("/forum")} className="cta-button">
            Join Forums
          </button>
        </div>
      </main>
      <footer className="footer">
        <p>&copy; 2025 Jerome's aistocker.</p>
        <p>Disclaimer, take all predictions at your own risk Jerome.LC is not responsible at all.</p>
      </footer>
    </div>
  );
};

export default Home;
