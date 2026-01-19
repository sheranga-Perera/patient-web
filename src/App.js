import './App.css';
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/patient";

export default function App() {
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newPatientForm, setNewPatientForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    email: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingPatientId, setViewingPatientId] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  function loadPatients() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => setPatients(data));
  }

  function handleEditClick(patient) {
    setEditingPatient(patient.id);
    setEditForm({ ...patient });
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function handleSaveEdit(id) {
    if (window.confirm("Are you sure you want to update this patient?")) {
      fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      }).then(() => {
        setEditingPatient(null);
        loadPatients();
      });
    }
  }

  function handleCancelEdit() {
    setEditingPatient(null);
    setEditForm({});
  }

  function handleNewPatientChange(e) {
    setNewPatientForm({ ...newPatientForm, [e.target.name]: e.target.value });
  }

  function handleAddPatient(e) {
    e.preventDefault();
    setCreateError("");

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPatientForm)
    })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(errorData.message || errorData.error || "Failed to create patient");
          }
          return res.json();
        })
        .then(() => {
          setNewPatientForm({
            firstName: "",
            lastName: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            phoneNumber: "",
            email: ""
          });
          setCreateError("");
          setShowAddForm(false);
          loadPatients();
        })
        .catch((error) => {
          const errorMessage = error.message || "An error occurred while creating the patient";
          if (errorMessage.toLowerCase().includes("email") ||
              errorMessage.toLowerCase().includes("duplicate") ||
              errorMessage.toLowerCase().includes("already exists") ||
              errorMessage.toLowerCase().includes("unique")) {
            setCreateError("A patient with this email address already exists. Please use a different email.");
          } else {
            setCreateError(errorMessage);
          }
        });
  }

  function deletePatient(id) {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      fetch(`${API_URL}/${id}`, { method: "DELETE" })
          .then(() => loadPatients());
    }
  }

  function handleViewPatient(id) {
    setViewingPatientId(id);
    setLoadingPatient(true);
    setPatientDetails(null);

    fetch(`${API_URL}/${id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch patient');
          }
          return res.json();
        })
        .then(data => {
          setPatientDetails(data);
          setLoadingPatient(false);
        })
        .catch(error => {
          console.error('Error fetching patient:', error);
          setLoadingPatient(false);
          alert('Failed to fetch patient details. Please try again.');
        });
  }

  function handleCloseViewModal() {
    setViewingPatientId(null);
    setPatientDetails(null);
    setLoadingPatient(false);
  }

  const fieldLabels = {
    firstName: "First Name",
    lastName: "Last Name",
    address: "Address",
    city: "City",
    state: "State",
    zipCode: "Zip Code",
    phoneNumber: "Phone Number",
    email: "Email"
  };

  const tableFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'city', 'state', 'zipCode'];

  function filterPatients(patients, query) {
    if (!query.trim()) {
      return patients;
    }

    const lowerQuery = query.toLowerCase();
    return patients.filter(patient => {
      return tableFields.some(field => {
        const value = patient[field] || "";
        return value.toString().toLowerCase().includes(lowerQuery);
      });
    });
  }

  const filteredPatients = filterPatients(patients, searchQuery);

  return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Patient Dashboard</h1>
          <button
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setCreateError("");
              }}
          >
            {showAddForm ? "Cancel" : "+ Add New Patient"}
          </button>
        </div>

        {showAddForm && (
            <div className="patient-card add-patient-card">
              <h2>Add New Patient</h2>
              {createError && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <span>{createError}</span>
                  </div>
              )}
              <form onSubmit={handleAddPatient} className="patient-form">
                <div className="form-grid">
                  {Object.keys(newPatientForm).map(key => (
                      <div key={key} className="form-field">
                        <label>{fieldLabels[key]}</label>
                        <input
                            type={key === "email" ? "email" : key === "phoneNumber" ? "tel" : "text"}
                            name={key}
                            placeholder={fieldLabels[key]}
                            value={newPatientForm[key]}
                            onChange={(e) => {
                              handleNewPatientChange(e);
                              if (createError && key === "email") {
                                setCreateError("");
                              }
                            }}
                            required
                            className={createError && key === "email" ? "input-error" : ""}
                        />
                      </div>
                  ))}
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Create Patient</button>
                </div>
              </form>
            </div>
        )}

        <div className="search-container-wrapper">
          <div className="search-container">
            <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
            />
            {searchQuery && (
                <button
                    onClick={() => setSearchQuery("")}
                    className="search-clear"
                    title="Clear search"
                >
                  ×
                </button>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="patients-table">
            <thead>
            <tr>
              {tableFields.map(field => (
                  <th key={field}>{fieldLabels[field]}</th>
              ))}
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {filteredPatients.map(patient => (
                <tr
                    key={patient.id}
                    className={editingPatient === patient.id ? "editing-row" : ""}
                >
                  {editingPatient === patient.id ? (
                      <>
                        {tableFields.map(key => (
                            <td key={key}>
                              <input
                                  type={key === "email" ? "email" : key === "phoneNumber" ? "tel" : "text"}
                                  name={key}
                                  value={editForm[key] || ""}
                                  onChange={handleEditChange}
                                  className="table-input"
                              />
                            </td>
                        ))}
                        <td className="actions-cell">
                          <button
                              onClick={() => handleSaveEdit(patient.id)}
                              className="btn btn-success btn-sm"
                          >
                            Save
                          </button>
                          <button
                              onClick={handleCancelEdit}
                              className="btn btn-secondary btn-sm"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                  ) : (
                      <>
                        <td>{patient.firstName || "—"}</td>
                        <td>{patient.lastName || "—"}</td>
                        <td>{patient.email || "—"}</td>
                        <td>{patient.phoneNumber || "—"}</td>
                        <td>{patient.address || "—"}</td>
                        <td>{patient.city || "—"}</td>
                        <td>{patient.state || "—"}</td>
                        <td>{patient.zipCode || "—"}</td>
                        <td className="actions-cell">
                          <button
                              onClick={() => handleViewPatient(patient.id)}
                              className="btn btn-view btn-sm"
                              title="View Details"
                          >
                            View
                          </button>
                          <button
                              onClick={() => handleEditClick(patient)}
                              className="btn btn-edit btn-sm"
                              title="Edit"
                          >
                            Edit
                          </button>
                          <button
                              onClick={() => deletePatient(patient.id)}
                              className="btn btn-delete btn-sm"
                              title="Delete"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                  )}
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        {patients.length === 0 && !showAddForm && (
            <div className="empty-state">
              <p>No patients found. Click "Add New Patient" to get started.</p>
            </div>
        )}

        {patients.length > 0 && filteredPatients.length === 0 && (
            <div className="empty-state">
              <p>No patients match your search query "{searchQuery}".</p>
            </div>
        )}

        {viewingPatientId && (
            <div className="modal-overlay" onClick={handleCloseViewModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Patient Details</h2>
                  <button
                      className="modal-close"
                      onClick={handleCloseViewModal}
                      title="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  {loadingPatient ? (
                      <div className="loading-state">
                        <p>Loading patient details...</p>
                      </div>
                  ) : patientDetails ? (
                      <div className="patient-details-view">
                        <div className="detail-section">
                          <h3>Personal Information</h3>
                          <div className="detail-grid">
                            <div className="detail-item-full">
                              <span className="detail-label">Patient ID:</span>
                              <span className="detail-value">{patientDetails.id}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">First Name:</span>
                              <span className="detail-value">{patientDetails.firstName || "—"}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Last Name:</span>
                              <span className="detail-value">{patientDetails.lastName || "—"}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Email:</span>
                              <span className="detail-value">{patientDetails.email || "—"}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Phone Number:</span>
                              <span className="detail-value">{patientDetails.phoneNumber || "—"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="detail-section">
                          <h3>Address Information</h3>
                          <div className="detail-grid">
                            <div className="detail-item-full">
                              <span className="detail-label">Address:</span>
                              <span className="detail-value">{patientDetails.address || "—"}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">City:</span>
                              <span className="detail-value">{patientDetails.city || "—"}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">State:</span>
                              <span className="detail-value">{patientDetails.state || "—"}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Zip Code:</span>
                              <span className="detail-value">{patientDetails.zipCode || "—"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                  ) : (
                      <div className="error-state">
                        <p>Failed to load patient details.</p>
                      </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                      onClick={handleCloseViewModal}
                      className="btn btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}