import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useParams } from "react-router-dom";

const Timeline = () => {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  // ✅ Helper functions OUTSIDE useEffect
  const formatEvent = (type) => {
    return type
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getColor = (type) => {
    if (type === "created") return "blue";
    if (type === "accepted") return "orange";
    if (type === "out_for_delivery") return "gold";
    if (type === "otp_generated") return "purple";
    if (type === "otp_verified") return "teal";
    if (type === "delivered") return "green";
    return "gray";
  };

  useEffect(() => {
    if (!id) return;

    const fetchEvents = async () => {
      try {
        setError("");
        const res = await api.get(`/products/${id}/events`);
        setEvents(res.data.data);
      } catch (err) {
        setError("Unable to load shipment timeline.");
      }
    };

    fetchEvents();
  }, [id]);

  // ✅ Safety check
  if (!id) {
    return <p style={{ textAlign: "center" }}>No product selected</p>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Shipment Timeline</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {events.length === 0 && !error && (
        <p style={{ textAlign: "center" }}>No events found</p>
      )}

      <div style={{ borderLeft: "2px solid #ccc", paddingLeft: "25px" }}>
        {events.map((e) => (
          <div
            key={e.id}
            style={{ position: "relative", marginBottom: "30px" }}
          >
            {/* Dot */}
            <div
              style={{
                width: "14px",
                height: "14px",
                background: getColor(e.event_type),
                borderRadius: "50%",
                position: "absolute",
                left: "-33px",
                top: "5px",
              }}
            />

            {/* Content */}
            <p
              style={{
                margin: 0,
                fontWeight: "600",
                color: getColor(e.event_type),
              }}
            >
              {formatEvent(e.event_type)}
            </p>

            <p style={{ margin: 0, fontSize: "12px", color: "gray" }}>
              {new Date(e.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;