import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Results from "@/pages/Results";
import Bookmarks from "@/pages/Bookmarks";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Results />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;