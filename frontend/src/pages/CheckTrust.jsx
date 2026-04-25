import React, { useState } from "react";
import api from "../services/api";

const CheckTrust = () => {
  const [courierId, setCourierId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    try {
      setError("");
      const res = await api.get(`/users/trust/${courierId}`);
      setResult(res.data.data);
    } catch (err) {
      setError("User not found");
      setResult(null);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h2>Check Trust Score</h2>

      <input
        type="text"
        placeholder="Enter Courier ID"
        value={courierId}
        onChange={(e) => setCourierId(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <button onClick={handleCheck}>Check</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "15px" }}>
          <h3>{result.name}</h3>
          <p>Trust Score: {result.trust_score}</p>
        </div>
      )}
    </div>
  );
};

export default CheckTrust;