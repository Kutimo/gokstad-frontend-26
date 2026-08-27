import styles from "./PlayerCard.module.css"

interface PlayerCardProps {
    playerName: string;
    score: number
    onIncrement: () => void;
    OnReset: () => void
}

export default function PlayerCards({playerName, score, onIncrement, OnReset}: PlayerCardProps) {


    return (
        <div className={styles.card}>
            <h2>{playerName}</h2>
            <p>{score}</p>
            <button className={styles.button} onClick={onIncrement}>+1</button>
            <button className={styles.button} onClick={OnReset}>Reset</button>
        </div>
    )
}