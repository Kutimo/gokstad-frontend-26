
import './App.css'
import Visning from "./components/Visning.tsx";
import Knapper from "./components/Knapper.tsx";

function App() {

  return (
    <main>
      <h1>Zustand-teller</h1>
      <p>
        Visning og Knapper er to sidestilte komponenter. Ingen av dem får props,
        og App sender ingenting nedover. Likevel deler de den samme tellingen.
      </p>
      <Visning />
      <Knapper />
    </main>
  )
}

export default App
