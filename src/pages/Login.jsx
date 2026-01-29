import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react/dist/iconify.js";
import AuthContext from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail) {
      setFormData((fd) => ({
        ...fd,
        email: savedEmail,
        password: savedPassword,
      }));
      setRememberMe(true);
    }
    if (user) {
      navigate("/llm-dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
        localStorage.setItem("rememberedPassword", formData.password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth bg-base d-flex flex-wrap">
      <div className="auth-left d-lg-block d-none">
        <div
          className="d-flex align-items-center flex-column  justify-content-center"
          style={{ height: "600px" }}
        >
          <img
            src="assets/images/updateImageTM.png"
            alt="img"
            width="1000"
            height="auto"
            style={{ maxWidth: "800px",maxHeight:"678px" }}
          />
        </div>
      </div>
      <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
        <div className="max-w-464-px mx-auto w-100 pl-4">
          <div>
            <Link to="/" className="mb-40 max-w-290-px d-block">
              <img
                src="https://www.techmagnate.com/wp-content/themes/techmagnate/images/techmagnate-logo.svg"
                alt="img"
              />
            </Link>
            <h4 className="mb-12">Sign In to your Account</h4>
            <p className="mb-32 text-secondary-light text-lg">
              Welcome back! please enter your detail
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="icon-field mb-16 position-relative pl-8">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mage:email" />
              </span>
              <input
                style={{ paddingLeft: "50px" }}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control h-56-px bg-neutral-50 radius-12 ml-16 pl-52"
                placeholder="Email"
                required
              />
            </div>
            <div className="position-relative mb-20">
              <div className="icon-field position-relative">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="solar:lock-password-outline" />
                </span>
                <input
                  style={{ paddingLeft: "50px" }}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="your-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control h-56-px bg-neutral-50 radius-12 ml-8 pl-52"
                  placeholder="Password"
                  required
                />
              </div>
              <span
                onClick={() => setShowPassword((v) => !v)}
                className="toggle-password ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light"
                data-toggle="#your-password"
              />
            </div>
            <div className="mb-16">
              <div className="d-flex justify-content-between align-items-center">
                <div className="form-check style-check d-flex align-items-center">
                  <input
                    className="form-check-input border border-neutral-300"
                    type="checkbox"
                    id="remember"
                    checked={rememberMe} // ← bind checked
                    onChange={(e) => setRememberMe(e.target.checked)} // ← update state
                  />
                  <label className="form-check-label ms-2" htmlFor="remember">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/setting?forgot-password"
                  className="text-primary-600 fw-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <div>
              {loading ? (
                <>
                  {/* <div className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32">
                    <Spin size="large" />
                  </div> */}
                  <p
                    disabled={loading}
                    className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
                  >
                    Signing In....
                  </p>
                </>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
                >
                  Sign In
                </button>
              )}
            </div>
            {/* <div className="mt-32 center-border-horizontal text-center">
              <span className="bg-base z-1 px-4">Or sign in with</span>
            </div>
            <div className="mt-32 d-flex align-items-center gap-3">
              <button
                type="button"
                className="fw-semibold text-primary-light py-16 px-24 w-50 border radius-12 text-md d-flex align-items-center justify-content-center gap-12 line-height-1 bg-hover-primary-50"
              >
                <Icon
                  icon="ic:baseline-facebook"
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
            <div className="mt-32 text-center text-sm">
              <p className="mb-0">
                Don’t have an account?{" "}
                <Link to="/signup" className="text-primary-600 fw-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
