import { Link } from "react-router-dom";

const getStatusColor = (status) => {
  if (status === "accepted") return "orange";
  if (status === "out-of-delivery") return "gold";
  if (status === "delivered") return "green";
  if (status === "created") return "blue";
  return "gray";
};

const ProductCard = ({ product }) => {
  console.log("Rendering ProductCard for:", product);
  return (
    
    <Link
      to={`/timeline/${product.id}`}
      style={{ color: "inherit", textDecoration: "none" }}
    >
      <div style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "10px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
      }}>
        <h3>{product.name}</h3>

        <p>
          Status:{" "}
          <span style={{ color: getStatusColor(product.status), fontWeight: "bold" }}>
            {product.status}
          </span>
        </p>

        <p style={{ fontSize: "12px", color: "gray" }}>
          ID: {product.id}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
