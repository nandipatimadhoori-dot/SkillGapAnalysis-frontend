
import { useEffect, useState } from "react";
import { FolderKanban, RefreshCw } from "lucide-react";
import api from "../services/api";

export default function Projects() {
  const email = localStorage.getItem("email") || "";
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProjects() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/projects/recommend/${encodeURIComponent(email)}`
      );
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not load recommended projects."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (email) {
      loadProjects();
    } else {
      setError("Please sign in again.");
      setLoading(false);
    }
  }, [email]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Recommended Projects</h1>
          <p>Build practical experience and strengthen your portfolio.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadProjects} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="card loading">Finding projects for your skills...</div>
      ) : projects.length === 0 ? (
        <div className="card empty-state">
          <FolderKanban size={32} />
          <h3>No project recommendations yet</h3>
          <p>Check that sample projects exist in your database and your profile has skills.</p>
        </div>
      ) : (
        <div className="grid-2">
          {projects.map((project, index) => (
            <article className="card project-card" key={project.id ?? index}>
              <div className="stat-icon"><FolderKanban size={22} /></div>
              <h3>{project.title || "Untitled project"}</h3>
              <p className="card-description">{project.description || "Practical learning project."}</p>

              <div className="skill-list">
                {project.difficulty && <span className="tag">{project.difficulty}</span>}
                {project.projectType && <span className="tag">{project.projectType}</span>}
                {project.matchPercentage != null && (
                  <span className="tag">{project.matchPercentage}% match</span>
                )}
              </div>

              {Array.isArray(project.matchedSkills) && project.matchedSkills.length > 0 && (
                <div>
                  <strong style={{ fontSize: 12 }}>Matched skills</strong>
                  <div className="skill-list" style={{ marginTop: 7 }}>
                    {project.matchedSkills.map((skill) => (
                      <span className="tag" key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(project.missingSkills) && project.missingSkills.length > 0 && (
                <div>
                  <strong style={{ fontSize: 12 }}>Skills to practice</strong>
                  <div className="skill-list" style={{ marginTop: 7 }}>
                    {project.missingSkills.map((skill) => (
                      <span className="tag" key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
