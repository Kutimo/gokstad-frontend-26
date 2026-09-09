import '../../styles/stat-box.css'

interface CurrentBetProps {
  bet: number
}

function CurrentBet({ bet }: CurrentBetProps) {
  return (
    <div className="stat-box">
      <span className="stat-box__label">Innsats</span>
      <span className="stat-box__value">{bet}</span>
    </div>
  )
}

export default CurrentBet
