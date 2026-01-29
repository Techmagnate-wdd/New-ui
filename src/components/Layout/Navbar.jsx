import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaClipboardList,
  FaBars,
  FaTimes,
} from "react-icons/fa";
// import "../../styles/Navbar.css";
import AuthContext from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar" style={{ display: "none" }}>
      <div className="logo" onClick={() => navigate("/")}>
        Task Manager
      </div>

      {/* Mobile Menu Toggle */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? (
          <FaTimes size={25} color="white" />
        ) : (
          <FaBars size={25} color="white" />
        )}
      </div>

      {/* Navigation Links */}
      <ul className={menuOpen ? "nav-menu active" : "nav-menu"}>
        {user ? (
          <li>
            <Link to="/" onClick={() => logout()}>
              <FaClipboardList /> Logout
            </Link>
          </li>
        ) : (
          <>
            <li>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>
                <FaClipboardList /> Sign Up
              </Link>
            </li>
            <li>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <FaPlusCircle /> Login
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
