import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Playground from "./pages/Playground";
import "./App.css";
import Guide from "./pages/Guide";
import Game from "./pages/Game";

function App() {
  console.log("App rendered");

  return (
    <>
      <Routes>
        <Route path="/" element={<Playground />} />{" "}
        <Route path="/guide" element={<Guide />} />{" "}
        <Route path="/game" element={<Game />} />{" "}
      </Routes>
    </>
  );
}

export default App;
