import { useState } from "react"

function PatientProfile() {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")

  return (
    <div className="app">
      <div className="card">
        <h1>Patient Profile</h1>

        <p>Please provide your basic information.</p>

        <div>
          <label>Name</label>
          <br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <br />

        <div>
          <label>Age</label>
          <br />
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
          />
        </div>

        <br />

        <div>
          <label>Gender</label>
          <br />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">
              Prefer not to say
            </option>
          </select>
        </div>

        <br />

        <button>Continue</button>
      </div>
    </div>
  )
}

export default PatientProfile