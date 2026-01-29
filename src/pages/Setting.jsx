import React, { useContext, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useLocation, useNavigate } from "react-router-dom";
import { showToast } from "../lib/CustomToast";
import AuthContext from "../context/AuthContext";
import { changePassword, getProfile } from "../services/api";
import "../styles/Setting.css";

const Setting = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useContext(AuthContext);
  const params = useLocation();
  let pathType = params?.search?.slice(1);

  // 2) password fields (initially blank)
  const [passwords, setPasswords] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const onPasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword, email } = passwords;

    let finalEmail = pathType === "forgot-password" ? email : user.email

    // 1) Ensure fields are filled

    const missingPwdFields = !newPassword || !confirmPassword;

    if (pathType === "forgot-password") {
      // For forgot-password you also need email
      if (!finalEmail || missingPwdFields) {
        showToast("Please fill all fields", "error");
        return;
      }
    } else {
      // For normal change-password you don’t need email
      if (!oldPassword || missingPwdFields) {
        showToast("Please fill all fields", "error");
        return;
      }
    }
    // 2) New & confirm must match
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    // 3) Enforce complexity on the NEW password only
    const complexity = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!complexity.test(newPassword)) {
      showToast(
        "Password must be at least 8 characters, include a number and a special character",
        "error"
      );
      return;
    }

    let payload = {
      oldPassword: pathType === "forgot-password" ? "" : oldPassword,
      newPassword: newPassword,
      email: finalEmail,
    };

    // 4) Call changePassword API with both old & new
    try {
      await changePassword(payload, pathType);
      showToast("Password changed successfully!", "success");
      setTimeout(() => {
        logout();
        navigate("/");
        // window.location.reload();
      }, [2000]);
    } catch (err) {
      // If wrong old password, server should return 400/401
      showToast(err.message || "Failed to change password", "error");
    }
  };

  return (
    <section
      className="auth flex-wrap min-h-screen"
      style={{
        position: "relative",
        padding: "1rem 1rem",
      }}
    >
      <div style={{ display: "flex", marginBottom: "20px", justifyContent: "flex-end" }}>
        <button
          onClick={() => window.history.back()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            fontSize: "1rem",
            margin: 0,
            background: "#0d6efd",
            color: "#fff",
            // border: "1px solid #c7d2fe",
            borderRadius: "5%",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "1.1rem", lineHeight: 1, paddingBottom: "2px" }}>←</span>
          Back
        </button>
      </div>

      <div
        style={{
          maxWidth: "1000px",
          width: "100%",
          margin: "0 30px",
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <form onSubmit={handleSubmit}>

          <div
            style={{
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >

            <div style={{ flex: 1, minWidth: "250px" }}>

              <h6 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
                {pathType === "forgot-password" ? "Reset Password" : "Change Password"}
              </h6>

              {pathType === "forgot-password" ? (
                <div className="icon-field mb-16">
                  <Icon icon="mage:email" className="icon" />
                  <input
                    name="email"
                    type="email"
                    value={passwords.email}
                    onChange={onPasswordChange}
                    placeholder="Old Password"
                  />
                </div>
              ) : (
                <div className="icon-field mb-16">
                  <Icon icon="solar:lock-password-outline" className="icon" />
                  <input
                    name="oldPassword"
                    type="password"
                    value={passwords.oldPassword}
                    onChange={onPasswordChange}
                    placeholder="Old Password"
                  />
                </div>
              )}

              <div className="icon-field mb-8">
                <Icon icon="ri:shield-keyhole-line" className="icon" />
                <input
                  name="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={onPasswordChange}
                  placeholder="New Password"
                />
              </div>
              <small className="d-block mb-16 text-secondary-light">
                Must be ≥8 chars with at least one number & one special
                character
              </small>

              <div className="icon-field mb-24">
                <Icon icon="ri:shield-keyhole-line" className="icon" />
                <input
                  name="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={onPasswordChange}
                  placeholder="Confirm New Password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{ padding: "0.75rem", marginTop: "1rem" }}
          >
            Save Changes
          </button>
        </form>
      </div>
    </section>
  );
};

export default Setting;
