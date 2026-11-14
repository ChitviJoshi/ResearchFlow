import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth.js";
import { Icon, BrandMark } from "./icons.jsx";
import { initials } from "../utils/format.js";
import "../style/shell.scss";

/** Top bar shared by every signed-in page. Pages render inside <Outlet />. */
function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <a href="#main" className="skip-link">Skip to content</a>

      <header className="topbar">
        <Link to="/" className="brand" aria-label="ResearchFlow home">
          <BrandMark />
          <span>ResearchFlow</span>
        </Link>

        <div className="topbar-user">
          <span className={`avatar role-${user?.role}`} aria-hidden="true">{initials(user?.name)}</span>
          <div className="topbar-user-text">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            <Icon name="logout" size={15} />
            <span className="logout-label">Log out</span>
          </button>
        </div>
      </header>

      <main id="main" className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
