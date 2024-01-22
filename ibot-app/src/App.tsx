// App.tsx
import React from "react";
import Session from "./components/Session";
import iBotImage from "./images/ibotai.png";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="App-title-row">
        <img src={iBotImage} width="150px" height="150px" alt="Robot" />
        <div
          style={{
            fontFamily: "HomemadeRobot",
            fontSize: "50px",
          }}
        >
          I B O T
        </div>
      </div>
      <div>
        <Session />
      </div>
    </div>
  );
};

export default App;
