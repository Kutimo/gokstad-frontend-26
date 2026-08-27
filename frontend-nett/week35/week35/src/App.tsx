import { useState } from "react";
import PlayerCard from "./PlayerCard";
import "./App.css";

function App() {
  const [aliceScore, setAliceScore] = useState(0);
  const [bobScore, setBobScore] = useState(0);

  return (
    <div className="app">
      <PlayerCard
        name="Alice"
        score={aliceScore}
        onIncrement={() => setAliceScore((score) => score + 1)}
        onReset={() => setAliceScore(0)}
      />
      <PlayerCard
        name="Bob"
        score={bobScore}
        onIncrement={() => setBobScore((score) => score + 1)}
        onReset={() => setBobScore(0)}
      />
    </div>
  );
}

export default App;
