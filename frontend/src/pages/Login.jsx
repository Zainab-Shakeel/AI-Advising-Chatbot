import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const PORTAL_ROUTES = {
  student: '/student',
  academic_staff: '/academic-staff',
  student_affairs: '/student-affairs',
  system_admin: '/system-admin',
};

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleClearStorage = () => {
    localStorage.clear();
    logout();
    window.location.reload();
  };

  useEffect(() => {
    if (user) {
      const route = PORTAL_ROUTES[user.role];
      if (route) navigate(route, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail.trim()) {
      setError('Please enter your username or email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    const result = loginByCredentials(usernameOrEmail, password);

    if (result.success) {
      login(result.user);
      navigate(PORTAL_ROUTES[result.user.role], { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Tawjeeh Bot</h1>
          <p className="login-subtitle">AI Advisory Chatbot</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Enter your username or email"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <p className="login-footer">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
        <button type="button" className="clear-storage-btn" onClick={handleClearStorage}>
          Clear all data
        </button>
      </div>
    </div>
  );
}
