// File: frontend/src/pages/Profile.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Save, UserRound } from "lucide-react";
import api from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email") || "";

  const [form, setForm] = useState({
    education: "",
    careerInterest: "",
    skills: "",
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!email || !localStorage.getItem("token")) {
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await api.get(
          `/profiles/${encodeURIComponent(email)}`
        );

        if (cancelled) return;

        const data = response.data;

        setForm({
          education: data.education || "",
          careerInterest: data.careerInterest || "",
          skills: data.skills || "",
        });
      } catch (err) {
        if (cancelled) return;

        if (err.response?.status === 401) {
          setError("Your session is invalid or expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("email");
          navigate("/login", { replace: true });
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [email, navigate]);

  function update(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleAuthError(err) {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      navigate("/login", { replace: true });
      return true;
    }

    return false;
  }

  async function saveProfile(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const currentEmail = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    if (!currentEmail || !token) {
      setError("Please log in again before saving your profile.");
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);

    try {
      await api.put(
        `/profiles/${encodeURIComponent(currentEmail)}`,
        {
          education: form.education.trim(),
          careerInterest: form.careerInterest.trim(),
          skills: form.skills.trim(),
        }
      );

      setMessage("Profile saved successfully!");
    } catch (err) {
      console.error(
        "Save profile error:",
        err.response?.status,
        err.response?.data || err.message
      );

      if (handleAuthError(err)) return;

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not save your profile. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function uploadResume(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const currentEmail = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    if (!currentEmail || !token) {
      setError("Please log in again before uploading your resume.");
      navigate("/login", { replace: true });
      return;
    }

    if (!file) {
      setError("Please select a PDF resume first.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Your resume must be smaller than 5 MB.");
      return;
    }

    const data = new FormData();
    data.append("file", file);

    setUploading(true);

    try {
      await api.post(
        `/resume/${encodeURIComponent(currentEmail)}`,
        data
      );

      setMessage("Resume uploaded successfully!");
      setFile(null);

      const input = document.getElementById("resume-file");
      if (input) input.value = "";
    } catch (err) {
      console.error(
        "Resume upload error:",
        err.response?.status,
        err.response?.data || err.message
      );

      if (handleAuthError(err)) return;

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Resume upload failed. Please check the backend."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your education, skills, and resume.</p>
        </div>

        <div className="stat-icon">
          <UserRound size={24} />
        </div>
      </div>

      <div className="card" style={{ maxWidth: 850 }}>
        <h2 className="section-title">Student Information</h2>
        <p className="muted">Account: {email || "Not logged in"}</p>

        <form onSubmit={saveProfile}>
          <div className="form-group">
            <label htmlFor="education">Education</label>
            <input
              id="education"
              name="education"
              value={form.education}
              onChange={update}
              placeholder="e.g. B.Tech CSE, 3rd year"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="careerInterest">Career Interest</label>
            <input
              id="careerInterest"
              name="careerInterest"
              value={form.careerInterest}
              onChange={update}
              placeholder="e.g. Java Developer, Data Analyst"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <textarea
              id="skills"
              name="skills"
              value={form.skills}
              onChange={update}
              placeholder="java, sql, html, css"
              rows={4}
              required
            />

            <span className="muted">
              Separate each skill with a comma.
            </span>
          </div>

          {message && (
            <div className="success-message" role="status">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button className="btn" type="submit" disabled={loading}>
            <Save size={17} />
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      <div
        className="card"
        style={{ maxWidth: 850, marginTop: 22 }}
      >
        <h2 className="section-title">Resume Upload</h2>

        <p className="card-description">
          Upload your PDF resume so the backend can process it for career
          analysis.
        </p>

        <form onSubmit={uploadResume}>
          <div className="form-group">
            <label htmlFor="resume-file">
              Select Resume (PDF, maximum 5 MB)
            </label>

            <input
              id="resume-file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
            />
          </div>

          <button className="btn" type="submit" disabled={uploading}>
            <Upload size={17} />
            {uploading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>
      </div>
    </>
  );
}