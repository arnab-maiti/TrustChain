import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div style={{ padding: "10px", background: "#eee" }}>
      <Link to="/" style={{ marginRight: "10px" }}>
        Dashboard
      </Link>

      <Link to="/verify">
        Verify
      </Link>
    </div>
  );
};

export default Navbar;