import "./PlayerCard.css";

interface PlayerCardProps {
  name: string;
  score: number;
  onIncrement: () => void;
  onReset: () => void;
}

export default function PlayerCard({ name, score, onIncrement, onReset }: PlayerCardProps) {
  return (
    <div className="player-card">
      <h2 className="player-card__name">{name}</h2>
      <p className="player-card__score">{score}</p>
      <button className="player-card__button" onClick={onIncrement}>+1</button>
      <button className="player-card__button player-card__button--reset" onClick={onReset}>Reset</button>
    </div>
  );
}
