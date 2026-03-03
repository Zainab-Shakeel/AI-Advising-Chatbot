import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Portal.css';
import './StudentPortal.css';
import GraduationProgress from './GraduationProgress';
import CourseEligibility from './CourseEligibility';
import { supabase } from "../config/supabaseClient";

const SIDEBAR_ITEMS = [
  { id: 'course_eligibility', label: 'Course Eligibility', icon: '✓' },
  { id: 'graduation_progress', label: 'Graduation Progress', icon: '🎓' },
  { id: 'tawjeeh_bot', label: 'Tawjeeh Bot', icon: '🤖' },
  { id: 'gpa_calculator', label: 'Cumulative GPA Calculator', icon: 'GPA' },
];


const SUGGESTED_ACTIONS = [
  'View my graduation status',
  'What are the prerequisites for Data Structures?',
  'Explain course withdrawal',
  'Explain course withdrawal policy',
];

const GRADE_OPTIONS = [
  { value: 5.0, label: 'A+ - Exceptional ' },
  { value: 4.75, label: 'A - Excellent' },
  { value: 4.5, label: 'B+ - Superior' },
  { value: 4.0, label: 'B - Very Good ' },
  { value: 3.5, label: 'C+ - Above Average ' },
  { value: 3.0, label: 'C - Good' },
  { value: 2.5, label: 'D+ - High Pass ' },
  { value: 2.0, label: 'D - Pass ' },
  { value: 0, label: 'F - Fail ' },
  { value: 0, label: 'DN - Denial ' },
  { value: 'IC', label: 'IC - Incomplete' },
];

const initialCourse = { course: '', creditHours: '', grade: '' };



function calculateGPAFromCourses(courseList) {
  const valid = courseList.filter((c) => c.course.trim() && c.creditHours && c.grade !== '' && c.grade !== 'IC');
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

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [user]);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();   // prevent redirect

    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      message: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch(
        "https://ai-advising-chatbot-backend.onrender.com/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            userId: user?.id,
          }),
        }
      );

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        role: "bot",
        message: data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "bot",
          message: "Server error. Please try again.",
        },
      ]);
    }

    setMessage("");   // clear input correctly
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
                <h2>KAU GPA Calculator</h2>
              </div>
              <div className="gpa-calculator-card">
                <h3 className="gpa-calculator-title">Cumulative GPA Calculation (5-point scale)</h3>
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
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.role === "user" ? "user-message" : "bot-message"}`}
                  >
                    {msg.message}
                  </div>
                ))}
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
