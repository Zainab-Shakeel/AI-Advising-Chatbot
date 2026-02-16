import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp, isValidOfficialEmail, ROLES } from '../services/userService';
import './Signup.css';

const ROLE_OPTIONS = [
  { value: ROLES.STUDENT, label: 'Student' },
  { value: ROLES.SYSTEM_ADMIN, label: 'System Administrator' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'information_system', label: 'Information System' },
  { value: 'information_technology', label: 'Information Technology' },
];


export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('computer_science');
  const [semester, setSemester] = useState(3);
  const [role, setRole] = useState(ROLES.STUDENT);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const isStudent = role === ROLES.STUDENT;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const emailTrimmed = email.trim();
    const usernameTrimmed = username.trim();
    const studentIdTrimmed = studentId.trim();

    if (!emailTrimmed) {
      setError('Please enter your email');
      return;
    }
    if (!isValidOfficialEmail(emailTrimmed)) {
      setError('Please use an official university email (e.g. @student.kau.edu.sa)');
      return;
    }
    if (!usernameTrimmed) {
      setError('Please enter a username');
      return;
    }
    if (usernameTrimmed.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (isStudent && !studentIdTrimmed) {
      setError('Please enter your student ID');
      return;
    }
    if (isStudent && !department) {
      setError('Please select your department');
      return;
    }
    if (isStudent && !semester) {
      setError('Please select your semester');
      return;
    }

    const result = signUp({
      email: emailTrimmed,
      username: usernameTrimmed,
      password,
      studentId: isStudent ? studentIdTrimmed : '',
      department: isStudent ? department : '',
      semester: isStudent ? semester : null,
      role,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p className="signup-subtitle">Tawjeeh Bot Registration</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Official University Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@student.kau.edu.sa"
              autoComplete="email"
            />
            <span className="field-hint">Use your university email</span>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Full name"
              autoComplete="username"
              minLength={3}
            />
          </div>

          {isStudent && (
            <>
              <div className="form-group">
                <label htmlFor="studentId">Student ID</label>
                <input
                  id="studentId"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your student ID"
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {DEPARTMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min 6 characters)"
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="signup-error">{error}</p>}

          <button type="submit" className="signup-button">
            Sign Up
          </button>

          <p className="signup-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
