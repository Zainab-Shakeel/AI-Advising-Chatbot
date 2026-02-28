import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient';
import './CourseEligibility.css';

/**
 * CourseEligibility page — comprehensive course eligibility analysis
 * Shows overview, semester selection, eligible/not eligible courses,
 * selected courses, credit tracking, and smart study plan
 */

const DEPARTMENT_CREDITS = {
  CS: 115,
  IS: 115,
  IT: 116,
};

function normalizeDepartmentCode(value) {
  if (!value) return null;
  const raw = String(value).toUpperCase();
  if (raw === 'COMPUTER_SCIENCE' || raw === 'COMPUTER SCIENCE') return 'CS';
  if (raw === 'INFORMATION_SYSTEM' || raw === 'INFORMATION SYSTEM') return 'IS';
  if (raw === 'INFORMATION_TECHNOLOGY' || raw === 'INFORMATION TECHNOLOGY') return 'IT';
  if (['CS', 'IS', 'IT'].includes(raw)) return raw;
  return null;
}

function normalizePrerequisites(raw) {
  if (!raw) return [];

  // If already an array (e.g. Postgres text[] or JSON[] mapped by Supabase)
  if (Array.isArray(raw)) {
    return raw
      .map((p) => (typeof p === 'string' ? p.trim() : ''))
      .filter(Boolean);
  }

  // If stored as JSON string, try to parse
  if (typeof raw === 'string' && raw.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((p) => (typeof p === 'string' ? p.trim() : ''))
          .filter(Boolean);
      }
    } catch {
      // fall through to comma-splitting
    }
  }

  // Fallback: comma-separated string like "CS101, CS102"
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
  }

  return [];
}

function CourseEligibility() {
  const { user } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState('Fall 2026');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentCourses, setStudentCourses] = useState([]);
  const [showAllEligible, setShowAllEligible] = useState(false);
  const [showAllNotEligible, setShowAllNotEligible] = useState(false);
  const [expandedCourseCode, setExpandedCourseCode] = useState(null);

  // Load courses for the student's department
  useEffect(() => {
    const fetchCourses = async () => {
      const deptCode = normalizeDepartmentCode(user?.department);

      let data = null;
      let error = null;

      if (deptCode) {
        const res = await supabase.from('courses').select('*').eq('department', deptCode);
        data = res.data;
        error = res.error;
      } else if (user?.department) {
        const res = await supabase
          .from('courses')
          .select('*')
          .ilike('department', `%${user.department}%`);
        data = res.data;
        error = res.error;
      }

      if (!error && Array.isArray(data) && data.length > 0) {
        setCourses(
          data.map((row) => ({
            code: row.course_code,
            name: row.course_title,
            credits: row.credit_hours,
            prerequisites: normalizePrerequisites(row.prerequisites),
            offeredSemesters: row.offered_semesters || [],
            schedule: row.schedule || '',
            description: row.description || '',
          })),
        );
        return;
      }

      const fallback = await supabase.from('courses').select('*');
      if (!fallback.error && Array.isArray(fallback.data)) {
        setCourses(
          fallback.data.map((row) => ({
            code: row.course_code,
            name: row.course_title,
            credits: row.credit_hours,
            prerequisites: normalizePrerequisites(row.prerequisites),
            offeredSemesters: row.offered_semesters || [],
            schedule: row.schedule || '',
            description: row.description || '',
          })),
        );
      }
    };

    fetchCourses();
  }, [user]);

  // Load student's courses and keep them in sync in real time
  useEffect(() => {
    if (!user?.id) return;

    const fetchStudentCourses = async () => {
      const { data, error } = await supabase
        .from('student_courses')
        .select(
          `
          id,
          grade,
          status,
          courses (
            id,
            course_code,
            credit_hours
          )
        `,
        )
        .eq('student_id', user.id);

      if (!error && Array.isArray(data)) {
        const formatted = data.map((item) => ({
          id: item.id,
          code: item.courses.course_code,
          credits: item.courses.credit_hours,
          grade: item.grade,
          status: item.status,
        }));
        setStudentCourses(formatted);
      }
    };

    fetchStudentCourses();

    const channel = supabase
      .channel(`student_courses_eligibility_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_courses', filter: `student_id=eq.${user.id}` },
        () => {
          fetchStudentCourses();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const totalCreditsRequired = useMemo(() => {
    const code = normalizeDepartmentCode(user?.department);
    if (!code) return 0;
    return DEPARTMENT_CREDITS[code] ?? 0;
  }, [user]);

  const completedForGpa = useMemo(
    () => studentCourses.filter((c) => c.status === 'completed' && c.grade !== 'IC'),
    [studentCourses],
  );

  const currentGpa = useMemo(() => {
    const totalPoints = completedForGpa.reduce(
      (sum, c) => sum + (parseFloat(c.grade) * c.credits || 0),
      0,
    );
    const credits = completedForGpa.reduce((sum, c) => sum + (c.credits || 0), 0);
    return credits > 0 ? (totalPoints / credits).toFixed(2) : '0.00';
  }, [completedForGpa]);

  const MIN_GPA_REQUIRED = 2.0;
  const MAX_ALLOWED_CREDITS = 18;

  const maxAllowedCredits = useMemo(() => {
    // Business rule: fixed cap of 18 credit hours per term.
    return MAX_ALLOWED_CREDITS;
  }, []);

  const currentlyRegisteredCredits = useMemo(
    () =>
      studentCourses
        .filter((c) => c.status && c.status !== 'completed')
        .reduce((sum, c) => sum + (c.credits || 0), 0),
    [studentCourses],
  );

  const academicStanding = useMemo(() => {
    return parseFloat(currentGpa) >= MIN_GPA_REQUIRED ? 'Good Standing' : 'Probation';
  }, [currentGpa]);

  const remainingCredits = useMemo(() => {
    return maxAllowedCredits - currentlyRegisteredCredits;
  }, [maxAllowedCredits, currentlyRegisteredCredits]);

  const selectedCredits = useMemo(() => {
    return selectedCourses.reduce((sum, code) => {
      const course = courses.find((c) => c.code === code);
      return sum + (course ? course.credits : 0);
    }, 0);
  }, [selectedCourses, courses]);

  const remainingAfterSelection = useMemo(() => {
    return remainingCredits - selectedCredits;
  }, [selectedCredits, remainingCredits]);

  const completedCourseCodes = useMemo(
    () => studentCourses.filter((c) => c.status === 'completed').map((c) => c.code),
    [studentCourses],
  );

  // Check if course is eligible
  function isCourseEligible(course) {
    // Already completed
    if (completedCourseCodes.includes(course.code)) return false;

    // Not offered in selected semester (if we have offering data)
    if (course.offeredSemesters.length > 0 && !course.offeredSemesters.includes(selectedSemester)) {
      return false;
    }

    // Missing prerequisites
    const hasMissingPrereqs = course.prerequisites.some((p) => !completedCourseCodes.includes(p));
    if (hasMissingPrereqs) return false;

    // Would exceed credit limit
    if (selectedCredits + course.credits > remainingCredits) return false;

    return true;
  }

  // Get eligibility reasons
  function getNotEligibleReasons(course) {
    const reasons = [];

    if (completedCourseCodes.includes(course.code)) {
      reasons.push('Already completed');
    }

    if (course.offeredSemesters.length > 0 && !course.offeredSemesters.includes(selectedSemester)) {
      reasons.push(`Not offered in ${selectedSemester}`);
    }

    const missingPrereqs = course.prerequisites.filter((p) => !completedCourseCodes.includes(p));
    if (missingPrereqs.length > 0) {
      reasons.push(`Missing prerequisites: ${missingPrereqs.join(', ')}`);
    }

    if (selectedCredits + course.credits > remainingCredits) {
      reasons.push('Would exceed maximum allowed credits');
    }

    return reasons;
  }

  // Split courses
  const eligible = useMemo(() => {
    return courses.filter((c) => isCourseEligible(c));
  }, [courses, selectedSemester, selectedCredits, completedCourseCodes, remainingCredits]);

  const notEligible = useMemo(() => {
    return courses
      .filter((c) => !isCourseEligible(c))
      .map((c) => ({ course: c, reasons: getNotEligibleReasons(c) }));
  }, [courses, selectedSemester, selectedCredits, completedCourseCodes, remainingCredits]);

  // Toggle course selection
  function toggleCourse(courseCode) {
    if (selectedCourses.includes(courseCode)) {
      setSelectedCourses(selectedCourses.filter((c) => c !== courseCode));
    } else {
      // Only allow if eligible
      if (eligible.some((c) => c.code === courseCode)) {
        setSelectedCourses([...selectedCourses, courseCode]);
      }
    }
  }

  const selectedCourseDetails = selectedCourses
    .map((code) => courses.find((c) => c.code === code))
    .filter(Boolean);

  return (
    <div className="ce-container">
      {/* Header */}
      <div className="ce-header">
        <h2>Course Eligibility</h2>
        <p>Check which courses you can take this semester and plan your schedule</p>
      </div>

      {/* Overview Card */}
      <div className="ce-overview-card">
        <h3>Eligibility Overview</h3>
        <div className="ce-overview-grid">
          <div className="ce-overview-item">
            <div className="ce-overview-label">Current GPA</div>
            <div className="ce-overview-value">{currentGpa}</div>
          </div>
          <div className="ce-overview-item">
            <div className="ce-overview-label">Graduation Requirement</div>
            <div className="ce-overview-value">{totalCreditsRequired} C.H</div>
          </div>
          <div className="ce-overview-item">
            <div className="ce-overview-label">Max Allowed Credits</div>
            <div className="ce-overview-value">{maxAllowedCredits}</div>
          </div>
          <div className="ce-overview-item">
            <div className="ce-overview-label">Currently Registered</div>
            <div className="ce-overview-value">{currentlyRegisteredCredits}</div>
          </div>
          <div className="ce-overview-item">
            <div className="ce-overview-label">Remaining Allowed</div>
            <div className="ce-overview-value" style={{ color: remainingCredits > 0 ? '#166534' : '#dc2626' }}>
              {remainingCredits}
            </div>
          </div>
          <div className="ce-overview-item">
            <div className="ce-overview-label">Academic Standing</div>
            <div className="ce-overview-value" style={{ color: academicStanding === 'Good Standing' ? '#166534' : '#b45309', fontSize: '1rem' }}>
              {academicStanding}
            </div>
          </div>
        </div>
      </div>

      {/* Semester Selector */}
      <div className="ce-semester-section">
        <label className="ce-semester-label">
          Select Semester:
          <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="ce-semester-select">
            <option>Fall 2026</option>
            <option>Spring 2027</option>
            <option>Summer 2027</option>
          </select>
        </label>
      </div>

      <div className="ce-grid">
        {/* Main Content */}
        <div className="ce-main">
          {/* Eligible Courses */}
          <section className="ce-section">
            <div className="ce-section-header-row">
              <h3 className="ce-section-title">✅ Eligible Courses</h3>
              {eligible.length > 3 && (
                <button
                  type="button"
                  className="ce-view-toggle"
                  onClick={() => setShowAllEligible((v) => !v)}
                >
                  {showAllEligible ? 'Show less' : 'View all'}
                </button>
              )}
            </div>
            {eligible.length === 0 ? (
              <div className="ce-empty-state">No eligible courses for {selectedSemester}</div>
            ) : (
              <div className="ce-course-list">
                {(showAllEligible ? eligible : eligible.slice(0, 3)).map((course) => {
                  const isExpanded = expandedCourseCode === course.code;
                  return (
                    <div key={course.code} className="ce-course-card ce-eligible">
                      <div className="ce-course-header">
                        <div className="ce-course-name">{course.name}</div>
                        <div className="ce-course-actions">
                          <button
                            onClick={() => toggleCourse(course.code)}
                            className={`ce-btn ce-btn-select ${selectedCourses.includes(course.code) ? 'selected' : ''}`}
                          >
                            {selectedCourses.includes(course.code) ? '✓ Selected' : 'Select Course'}
                          </button>
                          <button
                            type="button"
                            className="ce-btn ce-btn-details"
                            onClick={() =>
                              setExpandedCourseCode(isExpanded ? null : course.code)
                            }
                          >
                            {isExpanded ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="ce-course-details">
                          <div>Course ID: {course.code}</div>
                          <div>Credit hours: {course.credits}</div>
                          <div>
                            Prerequisites:{' '}
                            {course.prerequisites.length === 0
                              ? 'None'
                              : course.prerequisites.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Not Eligible Courses */}
          <section className="ce-section">
            <div className="ce-section-header-row">
              <h3 className="ce-section-title">❌ Not Eligible Courses</h3>
              {notEligible.length > 3 && (
                <button
                  type="button"
                  className="ce-view-toggle"
                  onClick={() => setShowAllNotEligible((v) => !v)}
                >
                  {showAllNotEligible ? 'Show less' : 'View all'}
                </button>
              )}
            </div>
            {notEligible.length === 0 ? (
              <div className="ce-empty-state">All courses are eligible!</div>
            ) : (
              <div className="ce-course-list">
                {(showAllNotEligible ? notEligible : notEligible.slice(0, 3)).map(
                  ({ course, reasons }) => {
                    const isExpanded = expandedCourseCode === course.code;
                    return (
                      <div key={course.code} className="ce-course-card ce-not-eligible">
                        <div className="ce-course-header">
                          <div className="ce-course-name">{course.name}</div>
                          <div className="ce-course-actions">
                            <button
                              type="button"
                              className="ce-btn ce-btn-details"
                              onClick={() =>
                                setExpandedCourseCode(isExpanded ? null : course.code)
                              }
                            >
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </button>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="ce-course-details">
                            <div>Course ID: {course.code}</div>
                            <div>Credit hours: {course.credits}</div>
                            <div>
                              Prerequisites:{' '}
                              {course.prerequisites.length === 0
                                ? 'None'
                                : course.prerequisites.join(', ')}
                            </div>
                            {reasons.length > 0 && (
                              <div className="ce-course-reasons">
                                {reasons.map((reason, idx) => (
                                  <div key={idx} className="ce-reason">
                                    ✕ {reason}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="ce-sidebar">
          {/* Selected Courses */}
          <div className="ce-card ce-selected-card">
            <h3>Selected Courses</h3>
            {selectedCourses.length === 0 ? (
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>No courses selected</div>
            ) : (
              <div className="ce-selected-list">
                {selectedCourseDetails.map((course) => (
                  <div key={course.code} className="ce-selected-item">
                    <div>
                      <div className="ce-selected-code">{course.code}</div>
                      <div className="ce-selected-name">{course.name}</div>
                    </div>
                    <button
                      onClick={() => toggleCourse(course.code)}
                      className="ce-btn-remove"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Credit Progress */}
          <div className="ce-card ce-credit-card">
            <h3>Credit Progress</h3>
            <div className="ce-credit-stat">
              <div className="ce-credit-label">Selected Credits</div>
              <div className="ce-credit-value">{selectedCredits}</div>
            </div>
            <div className="ce-credit-stat">
              <div className="ce-credit-label">Available</div>
              <div className="ce-credit-value">{remainingCredits}</div>
            </div>
            <div className="ce-credit-stat">
              <div className="ce-credit-label">After Selection</div>
              <div className="ce-credit-value" style={{ color: remainingAfterSelection >= 0 ? '#166534' : '#dc2626' }}>
                {remainingAfterSelection}
              </div>
            </div>

            <div className="ce-progress-bar">
              <div className="ce-progress-fill" style={{ width: `${Math.min(100, (selectedCredits / remainingCredits) * 100)}%` }} />
            </div>

            {remainingAfterSelection < 0 && (
              <div className="ce-warning">⚠ You exceeded maximum credit hours by {Math.abs(remainingAfterSelection)} credits</div>
            )}

            {selectedCourses.length > 0 && (
              <button onClick={() => setSelectedCourses([])} className="ce-btn-clear">
                Clear Selection
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CourseEligibility;
