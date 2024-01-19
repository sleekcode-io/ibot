// App.tsx
import React from "react";
import Session from "./components/Session";
import iBotImage from "./images/ibotai.png";
import "./App.css";

const App: React.FC = () => {
  return (
    <div
      className="App"
      style={{
        backgroundImage: `linear-gradient(45deg, #010758, #490d61)`,
        height: "150vh",
        padding: "20px",
        color: "white",
        fontSize: "30px",
      }}
    >
      <h1>I B O T</h1>
      <img src={iBotImage} width="200px" height="200px" alt="Robot" />
      <div>
        <Session />
      </div>
    </div>
  );
};

export default App;
