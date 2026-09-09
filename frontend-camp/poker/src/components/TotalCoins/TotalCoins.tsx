import '../../styles/stat-box.css'

interface TotalCoinsProps {
  coins: number
}

function TotalCoins({ coins }: TotalCoinsProps) {
  return (
    <div className="stat-box">
      <span className="stat-box__label">Mynter</span>
      <span className="stat-box__value">{coins}</span>
    </div>
  )
}

export default TotalCoins
