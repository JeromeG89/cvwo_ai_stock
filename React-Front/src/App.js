import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home_page/Home";
import Logs from "./components/predictions/Logs";
import Forum from "./components/forums/Forum";

const App = () => {
    return (
      <>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/forum" element={<Forum />} />
        </Routes>
      </>
    );
};

export default App;
