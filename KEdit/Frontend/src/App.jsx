import { useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";

import VideoEditor from "./pages/VideoEditor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/video" element={<VideoEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
