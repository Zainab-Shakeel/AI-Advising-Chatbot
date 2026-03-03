import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Portal.css';
import './AdminPortal.css';
import './AdminDashboard.css';
import './AdminCourseManagement.css';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'course_management', label: 'Course Management', icon: '📚' },
  { id: 'student_records', label: 'Student Records', icon: '👩‍🎓' },
  { id: 'faq_management', label: 'FAQ Management', icon: '💬' },
];

function DashboardView() {
  return (
    <div className="gpa-calculator-section">
      <div className="gpa-calculator-header">
        <h2>System Dashboard</h2>
      </div>
      <div className="gpa-calculator-card" style={{ background: '#f8fafc' }}>
        <h3 className="gpa-calculator-title">Overview</h3>

        <div className="admin-dashboard-grid">
          <div className="admin-summary-card">
            <div className="summary-icon">👨‍🎓</div>
            <div className="summary-value">1,245</div>
            <div className="summary-title">Total Students</div>
          </div>

          <div className="admin-summary-card">
            <div className="summary-icon">📚</div>
            <div className="summary-value">342</div>
            <div className="summary-title">Total Courses</div>
          </div>

          <div className="admin-summary-card">
            <div className="summary-icon">🤖</div>
            <div className="summary-value">8,930</div>
            <div className="summary-title">Total Chatbot Queries</div>
          </div>

          <div className="admin-summary-card">
            <div className="summary-icon">🎓</div>
            <div className="summary-value">150</div>
            <div className="summary-title">Eligible for Graduation</div>
          </div>
        </div>

      </div>
    </div>
  );
}

function CourseManagementView() {
  const [courses, setCourses] = useState([
    { id: 1, code: 'CPCS202', name: 'Programming I', credits: 3, prereqs: 'None', department: 'CS' },
    { id: 2, code: 'CPCS203', name: 'Programming II', credits: 3, prereqs: 'CPCS202', department: 'CS' },
    { id: 3, code: 'CPCS204', name: 'Data Structures', credits: 3, prereqs: 'CPCS203', department: 'CS' },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleEdit = (course) => {
    setEditingId(course.id);
    setEditFormData({ ...course });
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = () => {
    if (!editFormData.code || !editFormData.name) {
      alert("Please fill in course code and name.");
      return;
    }
    setCourses(courses.map(c => c.id === editingId ? editFormData : c));
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const handleChange = (e, field) => {
    setEditFormData({ ...editFormData, [field]: e.target.value });
  };

  const handleAddCourse = () => {
    const newCourse = {
      id: Date.now(),
      code: '',
      name: '',
      credits: 3,
      prereqs: '',
      department: 'CS'
    };
    setCourses([...courses, newCourse]);
    setEditingId(newCourse.id);
    setEditFormData(newCourse);
  };

  return (
    <div className="gpa-calculator-section">
      <div className="gpa-calculator-header admin-header-actions">
        <h2>Course Management</h2>
        <button className="gpa-add-btn" onClick={handleAddCourse}>+ Add New Course</button>
      </div>
      <div className="gpa-calculator-card">
        <h3 className="gpa-calculator-title">Curriculum Datastore</h3>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Department</th>
                <th>Credit Hours</th>
                <th>Prerequisites</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  {editingId === course.id ? (
                    <>
                      <td><input className="admin-input" value={editFormData.code} onChange={(e) => handleChange(e, 'code')} placeholder="e.g. CS101" /></td>
                      <td><input className="admin-input" value={editFormData.name} onChange={(e) => handleChange(e, 'name')} placeholder="Course Name" /></td>
                      <td>
                        <select className="admin-input" value={editFormData.department} onChange={(e) => handleChange(e, 'department')}>
                          <option value="CS">Computer Science (CS)</option>
                          <option value="IS">Information System (IS)</option>
                          <option value="IT">Information Technology (IT)</option>
                        </select>
                      </td>
                      <td><input type="number" min="1" max="10" className="admin-input" value={editFormData.credits} onChange={(e) => handleChange(e, 'credits')} style={{ width: '80px' }} /></td>
                      <td><input className="admin-input" value={editFormData.prereqs} onChange={(e) => handleChange(e, 'prereqs')} placeholder="e.g. CS100" /></td>
                      <td style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '100%' }}>
                        <button className="admin-action-btn btn-save" onClick={handleSave}>Save</button>
                        <button className="admin-action-btn btn-cancel" onClick={handleCancel}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><strong>{course.code}</strong></td>
                      <td>{course.name}</td>
                      <td>{course.department}</td>
                      <td>{course.credits}</td>
                      <td>{course.prereqs || 'None'}</td>
                      <td style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '100%' }}>
                        <button className="admin-action-btn btn-edit" onClick={() => handleEdit(course)}>Edit</button>
                        <button className="admin-action-btn btn-delete" onClick={() => handleDelete(course.id)}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No courses found in the datastore.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentRecordsView() {
  const [students] = useState([
    { id: 1, studentId: '2100001', name: 'Ahmad Ali', department: 'CS', semester: 4, gpa: 4.5 },
    { id: 2, studentId: '2100002', name: 'Sara Omer', department: 'IS', semester: 6, gpa: 4.8 },
    { id: 3, studentId: '2100003', name: 'Khalid Zaid', department: 'IT', semester: 2, gpa: 3.9 },
  ]);

  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mock completed courses for a selected student
  const getCompletedCourses = (studentId) => {
    return [
      { code: 'CPCS202', name: 'Programming I', grade: 'A', credits: 3 },
      { code: 'CPIT201', name: 'Introduction to IT', grade: 'B+', credits: 3 },
      { code: 'MATH202', name: 'Calculus II', grade: 'A+', credits: 4 },
    ];
  };

  return (
    <div className="gpa-calculator-section">
      <div className="gpa-calculator-header">
        <h2>{selectedStudent ? `Student Record: ${selectedStudent.name}` : 'Student Records'}</h2>
      </div>
      <div className="gpa-calculator-card">

        {!selectedStudent ? (
          <>
            <h3 className="gpa-calculator-title">Enrolled Students</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>GPA</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td><strong>{student.studentId}</strong></td>
                      <td>{student.name}</td>
                      <td>{student.department}</td>
                      <td>{student.semester}</td>
                      <td>{student.gpa}</td>
                      <td>
                        <button
                          className="admin-action-btn btn-edit"
                          onClick={() => setSelectedStudent(student)}
                        >
                          View Transcript
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="gpa-calculator-title" style={{ margin: 0 }}>Completed Courses</h3>
              <button className="admin-action-btn btn-cancel" onClick={() => setSelectedStudent(null)}>← Back to List</button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {getCompletedCourses(selectedStudent.studentId).map((course, idx) => (
                    <tr key={idx}>
                      <td><strong>{course.code}</strong></td>
                      <td>{course.name}</td>
                      <td>{course.credits}</td>
                      <td><span style={{ fontWeight: 600, color: '#076A07' }}>{course.grade}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

function FaqManagementView() {
  const [faqs] = useState([
    { id: 1, question: 'What are the prerequisites for Data Structures?', frequency: 145, lastAsked: '2 hrs ago' },
    { id: 2, question: 'How do I calculate my GPA?', frequency: 112, lastAsked: '5 hrs ago' },
    { id: 3, question: 'Explain course withdrawal policy', frequency: 89, lastAsked: '1 day ago' },
    { id: 4, question: 'When is the deadline to drop a course?', frequency: 76, lastAsked: '2 days ago' },
    { id: 5, question: 'Who is my academic advisor?', frequency: 54, lastAsked: '3 days ago' },
  ]);

  return (
    <div className="gpa-calculator-section">
      <div className="gpa-calculator-header">
        <h2>Chatbot FAQ Management</h2>
      </div>
      <div className="gpa-calculator-card">
        <h3 className="gpa-calculator-title">Most Asked Questions</h3>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Times Asked</th>
                <th>Last Asked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map(faq => (
                <tr key={faq.id}>
                  <td><strong>{faq.question}</strong></td>
                  <td>
                    <span style={{
                      background: '#e0f2fe',
                      color: '#0369a1',
                      padding: '4px 8px',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {faq.frequency}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{faq.lastAsked}</td>
                  <td>
                    <button className="admin-action-btn btn-edit">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default function SystemAdminPortal() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="portal">
      <header className="portal-header">
        <h1>Administrator Portal</h1>
        <div className="portal-user">
          <span>Welcome, {user?.username || 'Admin'}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="portal-main admin-portal-main" dir="ltr">
        <aside className="admin-sidebar">
          <h2 className="admin-sidebar-title">
            <span className="admin-sidebar-icon">⚙️</span>
            Admin Menu
          </h2>
          <nav className="admin-nav">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="admin-content-card">
          {activeSection === 'dashboard' && <DashboardView />}
          {activeSection === 'course_management' && <CourseManagementView />}
          {activeSection === 'student_records' && <StudentRecordsView />}
          {activeSection === 'faq_management' && <FaqManagementView />}
        </div>
      </main>
    </div>
  );
}
