import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
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
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    queries: 0,
    graduating: 0,
    loading: true
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // 1. Total Students
        const { count: studentsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');

        // 2. Total Courses
        const { count: coursesCount } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true });

        // 3. Total Chatbot Queries
        const { count: queriesCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user');

        // 4. Eligible for Graduation (using >= 8 semesters as a proxy for now)
        const { count: gradCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student')
          .gte('semester', 8);

        setStats({
          students: studentsCount || 0,
          courses: coursesCount || 0,
          queries: queriesCount || 0,
          graduating: gradCount || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="gpa-calculator-section">
      <div className="gpa-calculator-header">
        <h2>System Dashboard</h2>
      </div>
      <div className="gpa-calculator-card" style={{ background: '#f8fafc' }}>
        <h3 className="gpa-calculator-title">Overview</h3>

        {stats.loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading metrics...</p>
        ) : (
          <div className="admin-dashboard-grid">
            <div className="admin-summary-card">
              <div className="summary-icon">👨‍🎓</div>
              <div className="summary-value">{stats.students}</div>
              <div className="summary-title">Total Students</div>
            </div>

            <div className="admin-summary-card">
              <div className="summary-icon">📚</div>
              <div className="summary-value">{stats.courses}</div>
              <div className="summary-title">Total Courses</div>
            </div>

            <div className="admin-summary-card">
              <div className="summary-icon">🤖</div>
              <div className="summary-value">{stats.queries}</div>
              <div className="summary-title">Total Chatbot Queries</div>
            </div>

            <div className="admin-summary-card">
              <div className="summary-icon">🎓</div>
              <div className="summary-value">{stats.graduating}</div>
              <div className="summary-title">Eligible for Graduation</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function CourseManagementView() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch courses on load
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('courses').select('*').order('id', { ascending: false });
      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      alert('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEdit = (course) => {
    setEditingId(course.id);
    setEditFormData({ ...course });
  };

  const handleCancel = () => {
    // If it was a newly added incomplete row, remove it from list
    if (editingId && editingId.toString().startsWith('temp_')) {
      setCourses(courses.filter(c => c.id !== editingId));
    }
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!editFormData.course_code || !editFormData.course_title) {
      alert("Please fill in course code and name.");
      return;
    }

    setIsSaving(true);
    try {
      const isNewEntry = editingId.toString().startsWith('temp_');

      const payload = {
        course_code: editFormData.course_code,
        course_title: editFormData.course_title,
        department: editFormData.department || 'CS',
        credit_hours: parseInt(editFormData.credit_hours, 10) || 3,
        prerequisites: editFormData.prerequisites || null
      };

      if (isNewEntry) {
        const { error } = await supabase.from('courses').insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('courses')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      }

      await fetchCourses(); // Refresh full list
      setEditingId(null);
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course from the database? This may affect student records.')) {
      try {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) throw error;
        setCourses(courses.filter(c => c.id !== id));
      } catch (err) {
        console.error('Error deleting course:', err);
        alert('Failed to delete course: ' + err.message);
      }
    }
  };

  const handleChange = (e, field) => {
    setEditFormData({ ...editFormData, [field]: e.target.value });
  };

  const handleAddCourse = () => {
    const tempId = 'temp_' + Date.now();
    const newCourse = {
      id: tempId,
      course_code: '',
      course_title: '',
      credit_hours: 3,
      prerequisites: '',
      department: 'CS'
    };
    setCourses([newCourse, ...courses]);
    setEditingId(tempId);
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
              {loading && courses.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading database...</td>
                </tr>
              ) : courses.map(course => (
                <tr key={course.id}>
                  {editingId === course.id ? (
                    <>
                      <td><input className="admin-input" value={editFormData.course_code || ''} onChange={(e) => handleChange(e, 'course_code')} placeholder="e.g. CS101" /></td>
                      <td><input className="admin-input" value={editFormData.course_title || ''} onChange={(e) => handleChange(e, 'course_title')} placeholder="Course Name" /></td>
                      <td>
                        <select className="admin-input" value={editFormData.department || 'CS'} onChange={(e) => handleChange(e, 'department')}>
                          <option value="CS">Computer Science (CS)</option>
                          <option value="IS">Information System (IS)</option>
                          <option value="IT">Information Technology (IT)</option>
                        </select>
                      </td>
                      <td><input type="number" min="1" max="10" className="admin-input" value={editFormData.credit_hours || ''} onChange={(e) => handleChange(e, 'credit_hours')} style={{ width: '80px' }} /></td>
                      <td><input className="admin-input" value={editFormData.prerequisites || ''} onChange={(e) => handleChange(e, 'prerequisites')} placeholder="e.g. CS100" /></td>
                      <td style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '100%' }}>
                        <button className="admin-action-btn btn-save" onClick={handleSave} disabled={isSaving}>
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button className="admin-action-btn btn-cancel" onClick={handleCancel} disabled={isSaving}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><strong>{course.course_code}</strong></td>
                      <td>{course.course_title}</td>
                      <td>{course.department || 'CS'}</td>
                      <td>{course.credit_hours}</td>
                      <td>{course.prerequisites || 'None'}</td>
                      <td style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '100%' }}>
                        <button className="admin-action-btn btn-edit" onClick={() => handleEdit(course)}>Edit</button>
                        <button className="admin-action-btn btn-delete" onClick={() => handleDelete(course.id)}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {!loading && courses.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No courses found in the datastore.</td>
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
  const [students, setStudents] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState(null);

  // Fetch all enrolled students
  useEffect(() => {
    async function fetchStudents() {
      setLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student');
        if (error) throw error;
        setStudents(data || []);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchStudents();
  }, []);

  // Fetch transcript when a student is selected
  useEffect(() => {
    if (!selectedStudent) return;

    async function fetchTranscript() {
      setLoadingTranscript(true);
      setTranscriptError(null);
      try {
        const { data, error } = await supabase
          .from('student_courses')
          .select(`
            id,
            status,
            grade,
            courses:course_id (
              course_code,
              course_title,
              credit_hours
            )
          `)
          .eq('student_id', selectedStudent.id);

        if (error) {
          console.error('Transcript DB error:', error);
          setTranscriptError(`DB Error: ${error.message}`);
          return;
        }

        // Map data to a flat structure for rendering
        const formatted = (data || []).map(record => ({
          id: record.id,
          code: record.courses?.course_code || 'Unknown',
          name: record.courses?.course_title || 'Unknown Course',
          credits: record.courses?.credit_hours || 0,
          grade: record.grade || 'N/A',
          status: record.status || 'N/A'
        }));

        setCompletedCourses(formatted);
      } catch (err) {
        console.error('Error fetching transcript:', err);
        setTranscriptError(err.message);
      } finally {
        setLoadingTranscript(false);
      }
    }

    fetchTranscript();
  }, [selectedStudent]);


  return (
    <div className="gpa-calculator-section">
      <div className="gpa-calculator-header">
        <h2>{selectedStudent ? `Student Record: ${selectedStudent.username}` : 'Student Records'}</h2>
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
                  {loadingUsers && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading students...</td>
                    </tr>
                  )}
                  {!loadingUsers && students.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No students found.</td>
                    </tr>
                  )}
                  {!loadingUsers && students.map(student => (
                    <tr key={student.id}>
                      <td><strong>{student.student_id}</strong></td>
                      <td>{student.username}</td>
                      <td>{student.department || 'N/A'}</td>
                      <td>{student.semester || 'N/A'}</td>
                      <td>{student.gpa || 'N/A'}</td>
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
                    <th>Status</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingTranscript && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading transcript...</td>
                    </tr>
                  )}
                  {transcriptError && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#b91c1c', background: '#fee2e2' }}>
                        ⚠️ {transcriptError} — This may be an RLS (Row-Level Security) permission issue. Ask your admin to grant SELECT access on student_courses.
                      </td>
                    </tr>
                  )}
                  {!loadingTranscript && !transcriptError && completedCourses.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No courses found for this student.</td>
                    </tr>
                  )}
                  {!loadingTranscript && !transcriptError && completedCourses.map((course) => (
                    <tr key={course.id}>
                      <td><strong>{course.code}</strong></td>
                      <td>{course.name}</td>
                      <td>{course.credits}</td>
                      <td>
                        <span style={{
                          background: course.status?.toLowerCase() === 'completed' ? '#dcfce7' : '#f1f5f9',
                          color: course.status?.toLowerCase() === 'completed' ? '#15803d' : '#64748b',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          {course.status}
                        </span>
                      </td>
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
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFaqs() {
      setLoading(true);
      try {
        // Fetch all user messages (not bot replies)
        const { data, error } = await supabase
          .from('chat_messages')
          .select('message, created_at')
          .eq('role', 'user')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          setFaqs([]);
          return;
        }

        // Count frequency of each unique message text
        const frequencyMap = {};
        const lastAskedMap = {};

        data.forEach(row => {
          const key = row.message?.trim().toLowerCase();
          if (!key) return;
          frequencyMap[key] = (frequencyMap[key] || 0) + 1;
          // Keep the most recent timestamp for each unique question
          if (!lastAskedMap[key]) {
            lastAskedMap[key] = row.created_at;
          }
        });

        // Convert to array and sort by frequency descending
        const sorted = Object.entries(frequencyMap)
          .map(([msg, count], idx) => ({
            id: idx,
            question: msg.charAt(0).toUpperCase() + msg.slice(1),
            frequency: count,
            lastAsked: lastAskedMap[msg]
          }))
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 20); // Show top 20 questions

        setFaqs(sorted);
      } catch (err) {
        console.error('Error fetching FAQ data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFaqs();
  }, []);

  // Helper to format timestamps as relative time
  const timeAgo = (isoString) => {
    if (!isoString) return 'Unknown';
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

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
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading questions...</td>
                </tr>
              )}
              {!loading && faqs.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No student queries found yet.</td>
                </tr>
              )}
              {!loading && faqs.map(faq => (
                <tr key={faq.id}>
                  <td><strong>{faq.question}</strong></td>
                  <td>
                    <span style={{
                      background: '#e0f2fe',
                      color: '#0369a1',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {faq.frequency}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{timeAgo(faq.lastAsked)}</td>
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
