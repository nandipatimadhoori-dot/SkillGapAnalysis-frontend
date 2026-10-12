
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  BriefcaseBusiness,
  FolderKanban,
  Store,
  LogOut,
  GraduationCap,
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/profile", label: "My Profile", icon: UserRound },
  { to: "/jobs", label: "Career Analysis", icon: BriefcaseBusiness },
  { to: "/projects", label: "Recommended Projects", icon: FolderKanban },
  { to: "/marketplace", label: "Marketplace", icon: Store },
];

export default function Navbar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <GraduationCap size={26} />
        </div>
        <div>
          <h2>CareerHub</h2>
          <span>STUDENT CAREER PLATFORM</span>
        </div>
      </div>

      <p className="nav-heading">WORKSPACE</p>

      <nav className="nav-links">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            to={to}
            end={end}
            key={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-mini">
          <div className="avatar">S</div>
          <div className="user-info">
            <strong>Student Account</strong>
            <span>Career Explorer</span>
          </div>
        </div>

        <button className="logout-button" onClick={logout}>
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
