import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Portal.css';
import './StudentPortal.css';
import GraduationProgress from './GraduationProgress';
import CourseEligibility from './CourseEligibility';

const SIDEBAR_ITEMS = [
  { id: 'course_eligibility', label: 'Course Eligibility', icon: '✓' },
  { id: 'graduation_progress', label: 'Graduation Progress', icon: '🎓' },
  { id: 'academic_policies', label: 'Academic Policies', icon: '📄' },
  { id: 'gpa_calculator', label: 'Cumulative GPA Calculator', icon: 'GPA' },
];

const SUGGESTED_ACTIONS = [
  'View my graduation status',
  'What are the prerequisites for Data Structures?',
  'Explain course withdrawal',
  'Explain course withdrawal policy',
];

const GRADE_OPTIONS = [
  { value: 4.0, label: 'A' },
  { value: 3.7, label: 'A-' },
  { value: 3.3, label: 'B+' },
  { value: 3.0, label: 'B' },
  { value: 2.7, label: 'B-' },
  { value: 2.3, label: 'C+' },
  { value: 2.0, label: 'C' },
  { value: 1.7, label: 'C-' },
  { value: 1.3, label: 'D+' },
  { value: 1.0, label: 'D' },
  { value: 0, label: 'F' },
];

const initialCourse = { course: '', creditHours: '', grade: '' };

function calculateGPAFromCourses(courseList) {
  const valid = courseList.filter((c) => c.course.trim() && c.creditHours && c.grade !== '');
  if (valid.length === 0) return null;
  let totalPoints = 0;
  let totalHours = 0;
  for (const c of valid) {
    const hours = parseFloat(c.creditHours) || 0;
    const gradeValue = parseFloat(c.grade);
    totalPoints += hours * gradeValue;
    totalHours += hours;
  }
  return totalHours > 0 ? { gpa: (totalPoints / totalHours).toFixed(2), totalHours } : null;
}

export default function StudentPortal() {
  const [activeSection, setActiveSection] = useState('course_eligibility');
  const [message, setMessage] = useState('');
  const [courses, setCourses] = useState([{ ...initialCourse }]);
  const [gpaResult, setGpaResult] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (message.trim()) {
      setMessage('');
    }
  };

  const handleSuggestedAction = (action) => {
    setMessage(action);
  };

  const addCourse = () => {
    setCourses([...courses, { ...initialCourse }]);
  };

  const updateCourse = (index, field, value) => {
    const updated = [...courses];
    updated[index] = { ...updated[index], [field]: value };
    setCourses(updated);
  };

  const removeCourse = (index) => {
    if (courses.length > 1) {
      setCourses(courses.filter((_, i) => i !== index));
    }
  };

  const calculateGPA = () => {
    const result = calculateGPAFromCourses(courses);
    if (result) {
      setGpaResult(result);
    } else {
      setGpaResult({ error: 'Please enter at least one course with course name, credit hours, and grade.' });
    }
  };

  return (
    <div className="portal">
      <header className="portal-header">
        <h1>Student Portal</h1>
        <div className="portal-user">
          <span>Welcome, {user?.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="portal-main student-portal-main" dir="ltr">
        <aside className="tawjeeh-bot-sidebar">
          <h2 className="tawjeeh-bot-title">
            <span className="tawjeeh-bot-icon">🤖</span>
            Tawjeeh Bot
          </h2>
          <nav className="tawjeeh-bot-nav">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`tawjeeh-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="tawjeeh-bot-card">
          {activeSection === 'course_eligibility' ? (
            <CourseEligibility />
          ) : activeSection === 'graduation_progress' ? (
            <GraduationProgress />
          ) : activeSection === 'gpa_calculator' ? (
            <div className="gpa-calculator-section">
              <div className="gpa-calculator-header">
                <h2>Tawjeeh GPA Calculator</h2>
              </div>
              <div className="gpa-calculator-card">
                <h3 className="gpa-calculator-title">Cumulative GPA Calculation</h3>
                <div className="gpa-courses-table">
                  <div className="gpa-table-header">
                    <span>Course</span>
                    <span>Credit Hours</span>
                    <span>Grade</span>
                    <span className="gpa-col-actions" />
                  </div>
                  {courses.map((row, index) => (
                    <div key={index} className="gpa-table-row">
                      <input
                        type="text"
                        placeholder="Enter course name"
                        value={row.course}
                        onChange={(e) => updateCourse(index, 'course', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="0"
                        min="1"
                        max="10"
                        step="0.5"
                        value={row.creditHours}
                        onChange={(e) => updateCourse(index, 'creditHours', e.target.value)}
                      />
                      <select
                        value={row.grade}
                        onChange={(e) => updateCourse(index, 'grade', e.target.value)}
                      >
                        <option value="">Select grade</option>
                        {GRADE_OPTIONS.map((opt) => (
                          <option key={opt.label} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="gpa-col-actions">
                        {courses.length > 1 && (
                          <button type="button" className="gpa-remove-btn" onClick={() => removeCourse(index)}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="gpa-actions">
                  <button type="button" className="gpa-add-btn" onClick={addCourse}>
                    Add Course
                  </button>
                  <button type="button" className="gpa-calculate-btn" onClick={calculateGPA}>
                    Calculate
                  </button>
                </div>
                {gpaResult && (
                  <div className={`gpa-result ${gpaResult.error ? 'gpa-error' : ''}`}>
                    {gpaResult.error ? (
                      gpaResult.error
                    ) : (
                      <>
                        <strong>GPA:</strong> {gpaResult.gpa} (Total credit hours: {gpaResult.totalHours})
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
          <div className="tawjeeh-bot-chat">
            <div className="chat-header">
              <h2 className="chat-title">
                <span className="chat-title-icon">🤖</span>
                Tawjeeh Bot
              </h2>
            </div>

            <div className="chat-messages">
              <div className="message user-message">
                What are the courses I can take next semester?
              </div>
              <div className="message bot-message">
                <p>Based on your academic record, these are some of the courses you can take next semester:</p>
                <ul>
                  <li>Introduction to Artificial Intelligence</li>
                  <li>Data Structures</li>
                  <li>Software Engineering</li>
                </ul>
              </div>
              <div className="suggested-actions">
                {SUGGESTED_ACTIONS.map((action) => (
                  <button
                    key={action}
                    type="button"
                    className="suggested-action-btn"
                    onClick={() => handleSuggestedAction(action)}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" className="chat-send-btn" aria-label="Send">
                →
              </button>
            </form>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
