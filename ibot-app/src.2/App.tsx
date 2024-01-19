// App.tsx
import React from "react";
import Session from "./components/Session";
import robots from "./images/robots.png";
import robot from "./images/robot.png";
import "./images/down-arrow.png";
import "./App.css";
import sleekcode from "./images/wink-yellow-50.png";

const App: React.FC = () => {
  return (
    <div>
      <header className="App-header">
        <img src={sleekcode} width="40px" height="40px" alt="SLEEKCODE" />
        sleekcode
      </header>
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
        <img src={robots} width="360px" height="120px" alt="Robot" />
        <div>
          <Session />
        </div>
      </div>
    </div>
  );
};

export default App;
