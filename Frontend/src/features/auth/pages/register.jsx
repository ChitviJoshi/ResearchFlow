import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import AuthAside from "../components/AuthAside.jsx";
import "../auth.form.scss";

const ROLES = [
  { value: "student", title: "Student", text: "Upload your work and request reviews" },
  { value: "professor", title: "Professor", text: "Review papers and give feedback" },
];

function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <AuthAside />

      <main className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="eyebrow">Get started</p>
          <h1>Create your account</h1>
          <p className="auth-lead">Set up your workspace in a minute.</p>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <label>
            Name
            <input type="text" name="name" value={form.name} onChange={handleChange} required autoFocus />
          </label>

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
          </label>

          <fieldset className="auth-role">
            <legend>I am a</legend>
            <div className="role-grid">
              {ROLES.map((r) => (
                <label key={r.value} className="role-option">
                  <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={handleChange} />
                  <span className="role-title">{r.title}</span>
                  <span className="role-text">{r.text}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="btn btn-accent auth-submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default Register;
