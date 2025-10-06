import { BrowserRouter } from 'react-router-dom'
import './App.css'
import Router from './Router'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { setupAxiosInterceptors } from './component/api/axiosSetup'

function App() {
  // Setup axios interceptors when app loads
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

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
