import { useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";

import VideoEditor from "./pages/VideoEditor";
import { ConfigProvider } from "antd";
import { createContext } from "react";
import NotFound from "./components/NotFound";

export const LoginContext = createContext([]);

function App() {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <LoginContext.Provider value={[isLogin, setIsLogin]}>
      <BrowserRouter>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#0d0d0d",
            },
            components: {
              Button: {},
            },
          }}
        >
          <Routes>
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/" element={<VideoEditor />} />
              <Route path="/video" element={<VideoEditor />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ConfigProvider>
      </BrowserRouter>
    </LoginContext.Provider>
  );
}

export default App;
