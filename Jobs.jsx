
import { useEffect, useState } from "react";
import { BriefcaseBusiness, RefreshCw, Target } from "lucide-react";
import api from "./api.jsx";

export default function Jobs() {
  const email = localStorage.getItem("email") || "";
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalysis() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/analysis/${encodeURIComponent(email)}`
      );
      setAnalysis(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not load career analysis. Check your profile and backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (email) {
      loadAnalysis();
    } else {
      setError("Please sign in again.");
      setLoading(false);
    }
  }, [email]);

  const jobs = Array.isArray(analysis?.recommendations)
    ? [...analysis.recommendations].sort(
        (a, b) =>
          Number(b.matchPercentage ?? b.score ?? 0) -
          Number(a.matchPercentage ?? a.score ?? 0)
      )
    : [];

  function getTitle(job) {
    return job.jobTitle || job.title || job.jobRole || "Recommended job";
  }

  function getMatch(job) {
    return Math.min(
      100,
      Math.max(0, Number(job.matchPercentage ?? job.score ?? 0))
    );
  }

  function getMissing(job) {
    return Array.isArray(job.missingSkills) ? job.missingSkills : [];
  }

  function getMatched(job) {
    return Array.isArray(job.matchedSkills) ? job.matchedSkills : [];
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Career Analysis</h1>
          <p>Discover jobs that match your skills and find out what to learn next.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadAnalysis} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="card loading">Analyzing your skills...</div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 22 }}>
            <div className="stat-card">
              <div className="stat-icon"><Target size={23} /></div>
              <div>
                <h3>{jobs.length}</h3>
                <p>Potential career matches for {email}</p>
              </div>
            </div>
            <p className="muted" style={{ marginTop: 16 }}>
              Match percentages are rule-based estimates from the current backend,
              not predictions from a trained machine-learning model.
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="card empty-state">
              <BriefcaseBusiness size={30} />
              <h3>No recommendations available</h3>
              <p>Save your skills in My Profile, then refresh this page.</p>
            </div>
          ) : (
            <div className="grid-2">
              {jobs.map((job, index) => (
                <article className="card job-card" key={job.jobTitle || job.title || index}>
                  <div className="stat-icon">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <h3>{getTitle(job)}</h3>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="muted">Skill match</span>
                    <strong>{getMatch(job)}%</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${getMatch(job)}%` }}
                    />
                  </div>

                  <div>
                    <strong style={{ fontSize: 12 }}>Skills you already have</strong>
                    <div className="skill-list" style={{ marginTop: 8 }}>
                      {getMatched(job).length ? (
                        getMatched(job).map((skill) => (
                          <span className="tag" key={skill}>{skill}</span>
                        ))
                      ) : (
                        <span className="muted">No matched skills listed.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <strong style={{ fontSize: 12 }}>Skills to learn</strong>
                    <div className="skill-list" style={{ marginTop: 8 }}>
                      {getMissing(job).length ? (
                        getMissing(job).map((skill) => (
                          <span
                            key={skill}
                            className="tag"
                            style={{ background: "#fff0e4", color: "#b85a17" }}
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="muted">No missing skills listed.</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
