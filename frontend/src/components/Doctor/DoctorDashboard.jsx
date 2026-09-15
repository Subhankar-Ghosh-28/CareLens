import React, { useState } from "react";
import PatientQueue from "./PatientQueue";
import ClinicalSummaryView from "./ClinicalSummaryView";

export default function DoctorDashboard({
  patients,
  onUpdatePatient
}) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || null);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  return (
    <div className="doctor-layout">
      {/* Left Column: Live Queue */}
      <PatientQueue
        patients={patients}
        selectedPatient={selectedPatient}
        onSelectPatient={(p) => setSelectedPatientId(p.id)}
      />

      {/* Right Column: Active Patient Consultation */}
      {selectedPatient ? (
        <ClinicalSummaryView
          patient={selectedPatient}
          onUpdatePatient={onUpdatePatient}
        />
      ) : (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          No patient selected from the queue.
        </div>
      )}
    </div>
  );
}
