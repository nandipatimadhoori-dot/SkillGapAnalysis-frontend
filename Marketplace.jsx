
import { useEffect, useState } from "react";
import { Store, RefreshCw } from "lucide-react";
import api from "../services/api";

export default function Marketplace() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProjects() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/projects");
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not load marketplace projects."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Project Marketplace</h1>
          <p>Explore projects, source-code ideas, and portfolio opportunities.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadProjects} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <Store size={24} color="#4f46e5" />
        <h2 className="section-title" style={{ marginTop: 12 }}>Discover projects</h2>
        <p className="card-description">
          Browse projects currently listed by your backend. Purchasing, selling,
          payments, and source-code downloads require additional marketplace
          APIs and are not implemented by this listing page.
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="card loading">Loading marketplace...</div>
      ) : projects.length === 0 ? (
        <div className="card empty-state">
          <Store size={32} />
          <h3>No projects listed yet</h3>
          <p>Add project records to your database to display them here.</p>
        </div>
      ) : (
        <div className="grid-3">
          {projects.map((project, index) => (
            <article className="card project-card" key={project.id ?? index}>
              <div className="stat-icon"><Store size={22} /></div>
              <h3>{project.title || "Untitled project"}</h3>
              <p className="card-description">
                {project.description || "Explore this project."}
              </p>

              <div className="skill-list">
                {project.difficulty && <span className="tag">{project.difficulty}</span>}
                {project.projectType && <span className="tag">{project.projectType}</span>}
              </div>

              <p className="muted">
                Listing details and purchase options can be added when marketplace
                listing and payment endpoints are available.
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
