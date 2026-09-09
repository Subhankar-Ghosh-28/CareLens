import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Patient from "./pages/Patient"
import PatientProfile from "./pages/PatientProfile"

function Home() {
  return (
    <div className="app">
      <div className="card">
        <h1>CareLens</h1>

        <p>AI-Assisted Clinical Intake Platform</p>

        <p>Welcome! Please select your role.</p>

        <div className="buttons">
          <Link to="/patient">
            <button>Patient</button>
          </Link>

          <button>Doctor</button>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patient" element={<Patient />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App