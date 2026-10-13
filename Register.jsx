
// File: frontend/src/pages/Register.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import api from "./api.jsx";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function update(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fullName = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!fullName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        fullName,
        email,
        password,
        role: "STUDENT",
      });

      console.log("Registration response:", response.data);

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Registration error:", {
        status: err.response?.status,
        data: err.response?.data,
      });

      const data = err.response?.data;

      if (err.response?.status === 400) {
        setError(
          data?.message ||
            data?.error ||
            (typeof data === "string" ? data : null) ||
            "Registration rejected. Check the backend validation rules."
        );
      } else if (err.response?.status === 409) {
        setError("This email is already registered. Please sign in.");
      } else if (!err.response) {
        setError(
          "Cannot connect to the backend. Make sure Spring Boot is running on port 8081."
        );
      } else {
        setError(
          data?.message ||
            data?.error ||
            "Registration failed. Check the backend console."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
            color: "#4f46e5",
          }}
        >
          <GraduationCap size={34} />
          <span style={{ fontSize: "24px", fontWeight: 750 }}>
            CareerHub
          </span>
        </div>

        <h1>Create your account</h1>
        <p>Start discovering jobs that match your skills.</p>

        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={update}
              placeholder="Your full name"
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" role="status">
              {success}
            </div>
          )}

          <button
            className="btn"
            type="submit"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: "24px", textAlign: "center" }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
