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
  const [createFormErrors, setCreateFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  function showNotification(message, type) {
    setNotification({ show: true, message, type });
  }

  function loadPatients() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => setPatients(data));
  }

  function handleEditClick(patient) {
    setEditingPatient(patient.id);
    setEditForm({ ...patient });
    setEditFormErrors({});
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
    // Clear error for this field when user starts typing
    if (editFormErrors[name]) {
      setEditFormErrors({ ...editFormErrors, [name]: "" });
    }
  }

  function handleEditBlur(e) {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setEditFormErrors({ ...editFormErrors, [name]: error });
    }
  }

  function validateForm(formData) {
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key] || "");
      if (error) {
        errors[key] = error;
      }
    });
    return errors;
  }

  function handleSaveEdit(id) {
    const errors = validateForm(editForm);
    setEditFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return; // Don't submit if there are validation errors
    }
    
    if (window.confirm("Are you sure you want to update this patient?")) {
      fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(errorData.message || errorData.error || "Failed to update patient");
          }
          return res.json();
        })
        .then(() => {
          setEditingPatient(null);
          setEditForm({});
          setEditFormErrors({});
          loadPatients();
          showNotification("Patient updated successfully!", "success");
        })
        .catch((error) => {
          const errorMessage = error.message || "An error occurred while updating the patient";
          if (errorMessage.toLowerCase().includes("email") ||
              errorMessage.toLowerCase().includes("duplicate") ||
              errorMessage.toLowerCase().includes("already exists") ||
              errorMessage.toLowerCase().includes("unique")) {
            setEditFormErrors({ ...editFormErrors, email: "A patient with this email address already exists. Please use a different email." });
            showNotification("A patient with this email address already exists.", "error");
          } else {
            showNotification(errorMessage, "error");
          }
        });
    }
  }

  function handleCancelEdit() {
    setEditingPatient(null);
    setEditForm({});
    setEditFormErrors({});
  }

  function handleNewPatientChange(e) {
    const { name, value } = e.target;
    setNewPatientForm({ ...newPatientForm, [name]: value });
    // Clear error for this field when user starts typing
    if (createFormErrors[name]) {
      setCreateFormErrors({ ...createFormErrors, [name]: "" });
    }
    // Clear general create error if email field is being edited
    if (name === "email" && createError) {
      setCreateError("");
    }
  }

  function handleNewPatientBlur(e) {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setCreateFormErrors({ ...createFormErrors, [name]: error });
    }
  }

  function handleAddPatient(e) {
    e.preventDefault();
    setCreateError("");
    
    const errors = validateForm(newPatientForm);
    setCreateFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return; // Don't submit if there are validation errors
    }

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
          setCreateFormErrors({});
          setShowAddForm(false);
          loadPatients();
          showNotification("Patient created successfully!", "success");
        })
        .catch((error) => {
          const errorMessage = error.message || "An error occurred while creating the patient";
          if (errorMessage.toLowerCase().includes("email") ||
              errorMessage.toLowerCase().includes("duplicate") ||
              errorMessage.toLowerCase().includes("already exists") ||
              errorMessage.toLowerCase().includes("unique")) {
            setCreateFormErrors({ ...createFormErrors, email: "A patient with this email address already exists. Please use a different email." });
            showNotification("A patient with this email address already exists.", "error");
          } else {
            setCreateError(errorMessage);
            showNotification(errorMessage, "error");
          }
        });
  }

  function deletePatient(id) {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      fetch(`${API_URL}/${id}`, { method: "DELETE" })
          .then(async (res) => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({ message: res.statusText }));
              throw new Error(errorData.message || errorData.error || "Failed to delete patient");
            }
            return res.json();
          })
          .then(() => {
            loadPatients();
            showNotification("Patient deleted successfully!", "success");
          })
          .catch((error) => {
            const errorMessage = error.message || "An error occurred while deleting the patient";
            showNotification(errorMessage, "error");
          });
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

  function validateField(name, value) {
    const trimmedValue = value.trim();
    
    switch (name) {
      case "firstName":
      case "lastName":
        if (!trimmedValue) {
          return `${fieldLabels[name]} is required`;
        }
        if (trimmedValue.length < 2) {
          return `${fieldLabels[name]} must be at least 2 characters`;
        }
        if (trimmedValue.length > 100) {
          return `${fieldLabels[name]} must be less than 100 characters`;
        }
        if (!/^[a-zA-Z\s'-]+$/.test(trimmedValue)) {
          return `${fieldLabels[name]} can only contain letters, spaces, hyphens, and apostrophes`;
        }
        return "";
      
      case "email":
        if (!trimmedValue) {
          return "Email is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) {
          return "Please enter a valid email address";
        }
        if (trimmedValue.length > 100) {
          return "Email must be less than 100 characters";
        }
        return "";
      
      case "phoneNumber":
        if (!trimmedValue) {
          return "Phone Number is required";
        }
        
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(trimmedValue.replace(/\s/g, ""))) {
          return "Please enter a valid phone number (e.g., (123) 456-7890)";
        }
        return "";
      
      case "address":
        if (!trimmedValue) {
          return "Address is required";
        }
        if (trimmedValue.length < 5) {
          return "Address must be at least 5 characters";
        }
        if (trimmedValue.length > 100) {
          return "Address must be less than 100 characters";
        }
        return "";
      
      case "city":
        if (!trimmedValue) {
          return "City is required";
        }
        if (trimmedValue.length < 2) {
          return "City must be at least 2 characters";
        }
        if (trimmedValue.length > 50) {
          return "City must be less than 50 characters";
        }
        if (!/^[a-zA-Z\s'-]+$/.test(trimmedValue)) {
          return "City can only contain letters, spaces, hyphens, and apostrophes";
        }
        return "";
      
      case "state":
        if (!trimmedValue) {
          return "State is required";
        }
        if (trimmedValue.length < 2) {
          return "State must be at least 2 characters";
        }
        if (trimmedValue.length > 50) {
          return "State must be less than 50 characters";
        }
        return "";
      
      case "zipCode":
        if (!trimmedValue) {
          return "Zip Code is required";
        }
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (!zipRegex.test(trimmedValue)) {
          return "Please enter a valid zip code (e.g., 12345 or 12345-6789)";
        }
        return "";
      
      default:
        return "";
    }
  }

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
        {notification.show && (
            <div className={`toast-notification toast-${notification.type}`}>
              <span className="toast-icon">
                {notification.type === "success" ? "✓" : "⚠️"}
              </span>
              <span className="toast-message">{notification.message}</span>
              <button
                  className="toast-close"
                  onClick={() => setNotification({ show: false, message: "", type: "" })}
                  title="Close"
              >
                ×
              </button>
            </div>
        )}
        <div className="dashboard-header">
          <h1>Patient Dashboard</h1>
          <button
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setCreateError("");
                setCreateFormErrors({});
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
                            onChange={handleNewPatientChange}
                            onBlur={handleNewPatientBlur}
                            className={createFormErrors[key] ? "input-error" : ""}
                        />
                        {createFormErrors[key] && (
                            <span className="field-error">{createFormErrors[key]}</span>
                        )}
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
                              <div className="table-input-wrapper">
                                <input
                                    type={key === "email" ? "email" : key === "phoneNumber" ? "tel" : "text"}
                                    name={key}
                                    value={editForm[key] || ""}
                                    onChange={handleEditChange}
                                    onBlur={handleEditBlur}
                                    className={`table-input ${editFormErrors[key] ? "input-error" : ""}`}
                                />
                                {editFormErrors[key] && (
                                    <span className="table-field-error">{editFormErrors[key]}</span>
                                )}
                              </div>
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