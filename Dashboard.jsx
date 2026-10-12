
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  FolderKanban,
  Target,
  ArrowRight,
  Sparkles,
  UserRound,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

export default function Dashboard() {
  const email = localStorage.getItem("email") || "";
  const [analysis, setAnalysis] = useState(null);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const results = await Promise.allSettled([
          api.get(`/analysis/${encodeURIComponent(email)}`),
          api.get(`/projects/recommend/${encodeURIComponent(email)}`),
        ]);

        if (results[0].status === "fulfilled") {
          setAnalysis(results[0].value.data);
        }

        if (results[1].status === "fulfilled") {
          const data = results[1].value.data;
          setProjects(Array.isArray(data) ? data : []);
        }

        if (
          results.every((result) => result.status === "rejected")
        ) {
          setError("Could not load dashboard data. Check your backend.");
        }
      } catch {
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    if (email) {
      loadDashboard();
    } else {
      setLoading(false);
      setError("Your email is missing. Please sign in again.");
    }
  }, [email]);

  const jobs = Array.isArray(analysis?.recommendations)
    ? analysis.recommendations
    : [];

  const topJob = [...jobs].sort(
    (a, b) => Number(b.matchPercentage || 0) - Number(a.matchPercentage || 0)
  )[0];

  const currentSkills = Array.isArray(analysis?.currentSkills)
    ? analysis.currentSkills
    : typeof analysis?.currentSkills === "string"
      ? analysis.currentSkills.split(",").map((skill) => skill.trim()).filter(Boolean)
      : [];

  return (
    <>
      <div className="page-header">
        <div>
          <p style={{ color: "#4f46e5", fontWeight: 700 }}>
            YOUR CAREER WORKSPACE
          </p>
          <h1>Welcome back! 👋</h1>
          <p>Build your skills, discover suitable jobs, and grow your career.</p>
        </div>
        <Link to="/profile" className="btn">
          <UserRound size={17} /> Complete Profile
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="card loading">Loading your career insights...</div>
      ) : (
        <>
          <div className="grid-3" style={{ marginBottom: 22 }}>
            <div className="card stat-card">
              <div className="stat-icon"><BriefcaseBusiness size={22} /></div>
              <div>
                <h3>{jobs.length}</h3>
                <p>Job matches available</p>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon"><Target size={22} /></div>
              <div>
                <h3>{currentSkills.length}</h3>
                <p>Skills identified</p>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon"><FolderKanban size={22} /></div>
              <div>
                <h3>{projects.length}</h3>
                <p>Recommended projects</p>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 22 }}>
            <section className="card">
              <h2 className="section-title">
                <Sparkles size={19} style={{ verticalAlign: "middle" }} />{" "}
                Your best job match
              </h2>

              {topJob ? (
                <>
                  <h3>{topJob.jobTitle || topJob.title || topJob.jobRole || "Recommended role"}</h3>
                  <p className="card-description">
                    Based on your current skills and the backend's job matching results.
                  </p>
                  <div style={{ margin: "18px 0 9px", display: "flex", justifyContent: "space-between" }}>
                    <span className="muted">Skill match</span>
                    <strong>{topJob.matchPercentage ?? topJob.score ?? 0}%</strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, Math.max(0, Number(topJob.matchPercentage ?? topJob.score ?? 0)))}%`,
                      }}
                    />
                  </div>
                  <Link to="/jobs" className="btn" style={{ marginTop: 20 }}>
                    View career analysis <ArrowRight size={16} />
                  </Link>
                </>
              ) : (
                <div className="empty-state">
                  No job analysis available yet. Update your profile skills and try again.
                  <p><Link to="/profile">Update my skills →</Link></p>
                </div>
              )}
            </section>

            <section className="card">
              <h2 className="section-title">Your skills</h2>
              {currentSkills.length ? (
                <div className="skill-list">
                  {currentSkills.map((skill) => (
                    <span className="tag" key={skill}>{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="muted">
                  Your skills will appear here after you save your profile.
                </p>
              )}
              <Link to="/profile" className="btn btn-secondary" style={{ marginTop: 22 }}>
                Update profile
              </Link>
            </section>
          </div>

          <section className="card">
            <div className="page-header" style={{ marginBottom: 18 }}>
              <div>
                <h2 className="section-title">Recommended projects</h2>
                <p>Practice your skills through hands-on projects.</p>
              </div>
              <Link to="/projects" className="btn btn-secondary">
                View all <ArrowRight size={16} />
              </Link>
            </div>

            {projects.length ? (
              <div className="grid-2">
                {projects.slice(0, 4).map((project, index) => (
                  <div className="card" key={project.id ?? index}>
                    <h3>{project.title || project.name || "Project"}</h3>
                    <p className="card-description">
                      {project.description || "Build practical experience with this project."}
                    </p>
                    {project.matchPercentage != null && (
                      <span className="tag">{project.matchPercentage}% match</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                No project recommendations returned yet.
                <p>Check that your projects are inserted in the database.</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
