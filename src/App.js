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
    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    }).then(() => {
      setEditingPatient(null);
      loadPatients();
    });
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
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPatientForm)
    }).then(() => {
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
      setShowAddForm(false);
      loadPatients();
    });
  }

  function deletePatient(id) {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(() => loadPatients());
    }
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
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "+ Add New Patient"}
        </button>
      </div>

      {showAddForm && (
        <div className="patient-card add-patient-card">
          <h2>Add New Patient</h2>
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
                    onChange={handleNewPatientChange}
                    required
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
    </div>
  );
}
