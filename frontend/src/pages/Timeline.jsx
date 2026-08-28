import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const Timeline = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const formatEvent = (type) => {
    return type
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getColor = (type) => {
    const colors = {
      product_created: "#6c757d",
      accepted: "#28a745",
      out_of_delivery: "#ffc107",
      otp_generated: "#17a2b8",
      delivery_completed: "#007bff",
      delivered: "#20c997",
    };
    return colors[type] || "#6c757d";
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await api.get(`/products/${id}/events`);
        setEvents(res.data.data || res.data);
        
        const productRes = await api.get(`/products`);
        const found = productRes.data.data?.find(p => p.id === parseInt(id));
        if (found) setProduct(found);
      } catch (err) {
        console.error(err);
        setError("Unable to load timeline.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (!id) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "#999" }}>No product selected</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ marginBottom: "30px", backgroundColor: "white", padding: "15px", borderRadius: "6px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "6px 12px",
              marginBottom: "10px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ margin: "10px 0 5px 0" }}>📍 Event Timeline</h1>
          {product && <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{product.name}</p>}
        </div>

        {error && (
          <div style={{
            color: "#721c24",
            padding: "12px",
            backgroundColor: "#f8d7da",
            borderRadius: "4px",
            border: "1px solid #f5c6cb",
            marginBottom: "15px",
          }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
            Loading events...
          </div>
        )}

        {!loading && events.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
            No events recorded yet
          </div>
        )}

        {!loading && events.length > 0 && (
          <div style={{ position: "relative", paddingLeft: "40px" }}>
            <div
              style={{
                position: "absolute",
                left: "10px",
                top: 0,
                bottom: 0,
                width: "2px",
                backgroundColor: "#ddd",
              }}
            />

            {events.map((event, index) => (
              <div
                key={event.id || index}
                style={{
                  position: "relative",
                  marginBottom: "20px",
                  backgroundColor: "white",
                  padding: "15px",
                  borderRadius: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  border: `1px solid ${getColor(event.event_type)}30`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-37px",
                    top: "16px",
                    width: "20px",
                    height: "20px",
                    backgroundColor: getColor(event.event_type),
                    borderRadius: "50%",
                    border: "3px solid white",
                  }}
                />

                <div>
                  <h3 style={{
                    margin: "0 0 8px 0",
                    color: getColor(event.event_type),
                    fontSize: "16px",
                  }}>
                    {formatEvent(event.event_type)}
                  </h3>

                  {event.description && (
                    <p style={{
                      margin: "5px 0",
                      color: "#666",
                      fontSize: "14px",
                    }}>
                      {event.description}
                    </p>
                  )}

                  <div style={{
                    display: "flex",
                    gap: "20px",
                    marginTop: "8px",
                    flexWrap: "wrap",
                  }}>
                    <span style={{
                      fontSize: "12px",
                      color: "#999",
                    }}>
                      📅 {new Date(event.created_at).toLocaleString()}
                    </span>

                    {event.actor_id && (
                      <span style={{
                        fontSize: "12px",
                        color: "#666",
                        backgroundColor: "#f0f0f0",
                        padding: "2px 8px",
                        borderRadius: "12px",
                      }}>
                        👤 Actor: {event.actor_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;