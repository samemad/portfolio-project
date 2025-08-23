import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const saveToken = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  return token ? <Dashboard token={token} /> : <Login setToken={saveToken} />;
}

export default App;
