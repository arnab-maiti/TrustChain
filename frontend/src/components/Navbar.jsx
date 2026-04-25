import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div style={{ padding: "10px", background: "#eee" }}>
      <Link to="/" style={{ marginRight: "10px" }}>
        Dashboard
      </Link>

      <Link to="/verify" style={{ marginRight: "10px" }}>
        Verify
      </Link>
      
      <Link to="/check-trust" style={{ marginRight: "10px" }}>Check Trust</Link>
    </div>
  );
};

export default Navbar;