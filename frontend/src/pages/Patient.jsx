import { Link } from 'react-router-dom'

function Patient() {
  return (
    <div className="app">
      <div className="card">
        <h1>Patient Registration</h1>

        <p>Welcome to CareLens.</p>

        <p>
          Let's collect some basic information before your consultation.
        </p>

        <Link to="/patient/profile">
  <button>Continue</button>
</Link>
      </div>
    </div>
  )
}

export default Patient