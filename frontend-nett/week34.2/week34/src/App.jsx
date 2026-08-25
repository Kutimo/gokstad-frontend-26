import "./App.css"
import { useState } from "react"

function App() {
  const [movies, setMovies] = useState([
    "Jurassic park",
    "Fear and loathing",
    "lord of the rings",
    "twilight",
    "mot i brøstet 5",
  ])
  const [newMovie, setNewMovie] = useState("")

  function AddMovies(e) {
    e.preventDefault() // hindrer refresh av nettsiden

    // legge til nytt item i array
    setMovies([...movies, newMovie])

    // tømme input felten
    setNewMovie("")
  }

  return (
    <div>
      <form onSubmit={AddMovies}>
        <input
          type="text"
          value={newMovie}
          onChange={(e) => setNewMovie(e.target.value)}
        />
        <button type="submit">Legg til film</button>
      </form>

      <ul>
        {movies.map((movie, index) => (
          <li key={index}>
            {movie} <button>x</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
