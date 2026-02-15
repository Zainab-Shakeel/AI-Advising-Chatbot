import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Portal.css';

export default function SystemAdminPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="portal">
      <header className="portal-header">
        <h1>System Administrator Portal</h1>
        <div className="portal-user">
          <span>Welcome, {user?.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      <main className="portal-main">
        <p className="portal-welcome">AI Advisory Chatbot – System Administration Dashboard</p>
        <p className="portal-placeholder">Your system admin portal content will appear here.</p>
      </main>
    </div>
  );
}
