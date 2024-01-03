import { BrowserRouter } from 'react-router-dom'
import './App.css'
import Router from './Router'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div className="App">
      <Toaster
        position="bottom-right"
        reverseOrder={false}
      />
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </div>
  )
}

export default App
