import "./index.css"
import PlayerCards from "./components/PlayerCard.tsx";
import {useState} from "react";


export default function App() {
    const [oliverScore, oliverSetScore] = useState(0)
    const [olaScore, olaSetScore] = useState(0)

    return (
        <main className="player-card-wrapper">
            <PlayerCards playerName="Oliver" score={oliverScore} onIncrement={() => oliverSetScore(oliverScore + 1)} OnReset={() => oliverSetScore(0)} />
            <PlayerCards playerName="Ola" score={olaScore} onIncrement={() => olaSetScore(olaScore + 1)} OnReset={() => olaSetScore(0)}/>
        </main>
    )
}
