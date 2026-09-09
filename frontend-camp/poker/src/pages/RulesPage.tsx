import PayoutTable from '../components/PayoutTable/PayoutTable'
import './RulesPage.css'

function RulesPage() {
  return (
    <div className="rules-page">
      <h1>Regler</h1>

      <section>
        <h2>Slik spiller du</h2>
        <ol>
          <li>Velg hvor mange mynter du vil satse (1–5) og trykk «Del ut».</li>
          <li>Du får fem kort på hånden.</li>
          <li>
            Trykk på kortene du vil beholde. Disse markeres som «holdt». Kortene du ikke
            holder på blir byttet ut.
          </li>
          <li>
            Trykk «Bytt kort» for å bytte ut de kortene du ikke holder på med nye kort fra
            bunken.
          </li>
          <li>
            Den endelige hånden din avgjør gevinsten, som blir lagt til myntbeholdningen
            din automatisk.
          </li>
        </ol>
      </section>

      <section>
        <h2>Gevinster og utbetalinger</h2>
        <p>
          Utbetalingen avhenger av hvilken pokerhånd du sitter igjen med etter kortbyttet,
          og hvor mange mynter du satset. Et par gir bare gevinst dersom det er par av
          knekter (J), damer (Q), konger (K) eller ess (A) - lavere par regnes som tap.
        </p>
        <PayoutTable />
      </section>

      <section>
        <h2>Om appen</h2>
        <p>
          Dette er et video poker-spill (Jacks or Better) laget som en skoleoppgave med
          React, TypeScript, React Router og Zustand.
        </p>
      </section>
    </div>
  )
}

export default RulesPage
