import React, { useContext, useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";
import { showToast } from "../lib/CustomToast";
import AuthContext from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    contact: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      showToast("User registered successfully!", "success");
      setTimeout(() => {
        navigate("/login");
      }, [5000]);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <section className="auth bg-base d-flex flex-wrap min-h-screen">
      {/* Left image panel (large screens only) */}
      <div className="auth-left d-lg-block d-none">
        <div className="d-flex align-items-center flex-column  justify-content-center">
          <img
            src="assets/images/fullImageTM_register.png"
            alt="img"
            // width="1000"
            height="auto"
            style={{ maxWidth: "900px" }}
          />
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center w-full lg:w-1/2">
        <div className="max-w-464-px mx-auto w-100">
          {/* Logo + heading */}
          <div className="mb-40 max-w-290-px">
            <Link to="/">
              <img
                src="https://www.techmagnate.com/alpha/images/techmagnate-digital-excellence-logo.svg"
                alt="img"
              />{" "}
            </Link>
          </div>
          <h4 className="mb-12">Sign Up to your Account</h4>
          <p className="mb-32 text-secondary-light text-lg">
            Welcome back! Please enter your details
          </p>

          <form onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="icon-field mb-16 relative">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="f7:person" />
              </span>
              <input
                styl
                style={{ paddingLeft: "54px", paddingTop: "18px" }}
                e={{ paddingLeft: "54px", paddingTop: "18px" }}
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-control h-56-px bg-neutral-50 radius-12 ml-8"
                placeholder="First Name"
                required
              />
            </div>

            {/* Last Name */}
            <div className="icon-field mb-16 relative">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mdi:account-circle-outline" />
              </span>
              <input
                style={{ paddingLeft: "54px", paddingTop: "18px" }}
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-control h-56-px bg-neutral-50 r ml-8 ml-8"
                placeholder="Last Name"
                required
              />
            </div>

            {/* Email */}
            <div className="icon-field mb-16 relative">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mage:email" />
              </span>
              <input
                style={{ paddingLeft: "54px", paddingTop: "18px" }}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control h-56-px bg-neutral-50 r ml-8 ml-8"
                placeholder="Email"
                required
              />
            </div>

            {/* Contact */}
            <div className="icon-field mb-16 relative">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mdi:phone-outline" />
              </span>
              <input
                style={{ paddingLeft: "54px", paddingTop: "18px" }}
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="form-control h-56-px bg-neutral-50 r ml-8  ml-8"
                placeholder="Contact Number"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-20 relative">
              <div className="icon-field relative">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="solar:lock-password-outline" />
                </span>
                <input
                  style={{ paddingLeft: "54px", paddingTop: "18px" }}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="your-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control h-56-px bg-neutral-50 r ml-8 ml-8"
                  placeholder="Password"
                  required
                />
                <span
                  className="toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <Icon
                    icon={showPassword ? "ri:eye-off-line" : "ri:eye-line"}
                  />
                </span>
              </div>
              <span className="mt-12 text-sm text-secondary-light">
                Your password must have at least 8 characters
              </span>
            </div>

            {/* Role selector */}
            <div className="mb-20">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-control h-50-px bg-neutral-50 radius-12 ps-12 ml-8"
              >
                <option value="user">User</option>
                {/* <option value="admin">Admin</option> */}
              </select>
            </div>

            {/* Terms & Conditions */}
            <div className="mb-16">
              <div className="form-check d-flex align-items-start">
                <input
                  className="form-check-input border border-neutral-300 mt-4"
                  type="checkbox"
                  id="condition"
                  required
                />
                <label
                  className="form-check-label text-sm ms-8"
                  htmlFor="condition"
                >
                  By creating an account you agree to the{" "}
                  <Link to="#" className="text-primary-600 fw-semibold">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and our{" "}
                  <Link to="#" className="text-primary-600 fw-semibold">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
            >
              Sign Up
            </button>

            {/* Or sign up with … */}
            {/* <div className="mt-32 center-border-horizontal text-center">
              <span className="bg-base z-1 px-4">Or sign up with</span>
            </div>

            <div className="mt-32 d-flex align-items-center gap-3">
              <button
                type="button"
                className="fw-semibold text-primary-light py-16 px-24 w-50 border radius-12 text-md d-flex align-items-center justify-content-center gap-12 line-height-1 bg-hover-primary-50"
              >
                <Icon
                  icon="logos:facebook"
                  className="text-primary-600 text-xl line-height-1"
                />
                Facebook
              </button>
              <button
                type="button"
                className="fw-semibold text-primary-light py-16 px-24 w-50 border radius-12 text-md d-flex align-items-center justify-content-center gap-12 line-height-1 bg-hover-primary-50"
              >
                <Icon
                  icon="logos:google-icon"
                  className="text-primary-600 text-xl line-height-1"
                />
                Google
              </button>
            </div> */}

            {/* Already have an account */}

            <div className="mt-32 text-center text-sm">
              <p className="mb-0">
                Already have an account?{" "}
                <Link to="/login" className="text-primary-600 fw-semibold">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Signup;
