import React, { useMemo, useState } from 'react';
import './CourseEligibility.css';

/**
 * CourseEligibility page — comprehensive course eligibility analysis
 * Shows overview, semester selection, eligible/not eligible courses,
 * selected courses, credit tracking, and smart study plan
 */

const studentMockData = {
  gpa: 2.8,
  maxAllowedCredits: 18,
  currentlyRegisteredCredits: 6,
  minGPARequired: 2.0,
};

const coursesMockData = [
  {
    code: 'CS201',
    name: 'Data Structures',
    credits: 3,
    prerequisites: ['CS101'],
    offeredSemesters: ['Fall 2026', 'Spring 2027'],
    schedule: 'Mon 10:00-12:00',
    description: 'Fundamental data structures including arrays, linked lists, trees, and graphs.',
  },
  {
    code: 'CS202',
    name: 'Algorithms',
    credits: 3,
    prerequisites: ['CS201'],
    offeredSemesters: ['Spring 2027'],
    schedule: 'Tue 14:00-16:00',
    description: 'Analysis and design of algorithms, sorting, searching, and optimization.',
  },
  {
    code: 'CS301',
    name: 'Operating Systems',
    credits: 4,
    prerequisites: ['CS201', 'CS202'],
    offeredSemesters: ['Fall 2026'],
    schedule: 'Wed 10:00-12:00',
    description: 'Process management, memory management, file systems, and concurrency.',
  },
  {
    code: 'CS105',
    name: 'Intro to Programming',
    credits: 3,
    prerequisites: [],
    offeredSemesters: ['Fall 2026', 'Spring 2027'],
    schedule: 'Mon 14:00-16:00',
    description: 'Python programming basics for beginners.',
  },
  {
    code: 'MATH201',
    name: 'Discrete Mathematics',
    credits: 3,
    prerequisites: [],
    offeredSemesters: ['Fall 2026'],
    schedule: 'Thu 09:00-11:00',
    description: 'Logic, sets, combinatorics, graph theory, and proof techniques.',
  },
  {
    code: 'CS999',
    name: 'Special Topics in CS',
    credits: 2,
    prerequisites: ['CS101'],
    offeredSemesters: ['Fall 2026'],
    schedule: 'Fri 09:00-11:00',
    description: 'Advanced and emerging topics in computer science.',
  },
];

const completedCoursesData = ['CS101', 'CS102'];

function CourseEligibility() {
  const [selectedSemester, setSelectedSemester] = useState('Fall 2026');
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Compute standing
  const academicStanding = useMemo(() => {
    return studentMockData.gpa >= studentMockData.minGPARequired ? 'Good Standing' : 'Probation';
  }, []);

  const remainingCredits = useMemo(() => {
    return studentMockData.maxAllowedCredits - studentMockData.currentlyRegisteredCredits;
  }, []);

  const selectedCredits = useMemo(() => {
    return selectedCourses.reduce((sum, code) => {
      const course = coursesMockData.find((c) => c.code === code);
      return sum + (course ? course.credits : 0);
    }, 0);
  }, [selectedCourses]);

  const remainingAfterSelection = useMemo(() => {
    return remainingCredits - selectedCredits;
  }, [selectedCredits, remainingCredits]);

  // Check if course is eligible
  function isCourseEligible(course) {
    // Already completed
    if (completedCoursesData.includes(course.code)) return false;

    // Not offered in selected semester
    if (!course.offeredSemesters.includes(selectedSemester)) return false;

    // Missing prerequisites
    const hasMissingPrereqs = course.prerequisites.some((p) => !completedCoursesData.includes(p));
    if (hasMissingPrereqs) return false;

    // Would exceed credit limit
    if (selectedCredits + course.credits > remainingCredits) return false;

    return true;
  }

  // Get eligibility reasons
  function getNotEligibleReasons(course) {
    const reasons = [];

    if (completedCoursesData.includes(course.code)) {
      reasons.push('Already completed');
    }

    if (!course.offeredSemesters.includes(selectedSemester)) {
      reasons.push(`Not offered in ${selectedSemester}`);
    }

    const missingPrereqs = course.prerequisites.filter((p) => !completedCoursesData.includes(p));
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
    return coursesMockData.filter((c) => isCourseEligible(c));
  }, [selectedSemester, selectedCredits]);

  const notEligible = useMemo(() => {
    return coursesMockData
      .filter((c) => !isCourseEligible(c))
      .map((c) => ({ course: c, reasons: getNotEligibleReasons(c) }));
  }, [selectedSemester, selectedCredits]);

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

  // Smart study plan
  function generateSmartPlan() {
    const recommended = eligible
      .filter((c) => !selectedCourses.includes(c.code))
      .sort((a, b) => {
        // Prefer courses with fewer prerequisites satisfied
        const aPrereqsSat = a.prerequisites.filter((p) => completedCoursesData.includes(p)).length;
        const bPrereqsSat = b.prerequisites.filter((p) => completedCoursesData.includes(p)).length;
        return aPrereqsSat - bPrereqsSat;
      })
      .slice(0, 3);

    setSelectedCourses([...selectedCourses, ...recommended.map((c) => c.code)]);
  }

  const selectedCourseDetails = selectedCourses.map((code) => coursesMockData.find((c) => c.code === code)).filter(Boolean);

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
            <div className="ce-overview-value">{studentMockData.gpa}</div>
          </div>
          <div className="ce-overview-item">
            <div className="ce-overview-label">Max Allowed Credits</div>
            <div className="ce-overview-value">{studentMockData.maxAllowedCredits}</div>
          </div>
          <div className="ce-overview-item">
            <div className="ce-overview-label">Currently Registered</div>
            <div className="ce-overview-value">{studentMockData.currentlyRegisteredCredits}</div>
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
            <h3 className="ce-section-title">✅ Eligible Courses</h3>
            {eligible.length === 0 ? (
              <div className="ce-empty-state">No eligible courses for {selectedSemester}</div>
            ) : (
              <div className="ce-course-list">
                {eligible.map((course) => (
                  <div key={course.code} className="ce-course-card ce-eligible">
                    <div className="ce-course-header">
                      <div>
                        <div className="ce-course-code">{course.code}</div>
                        <div className="ce-course-name">{course.name}</div>
                      </div>
                      <div className="ce-course-credits">{course.credits} cr</div>
                    </div>
                    <div className="ce-course-info">
                      <div className="ce-course-schedule">{course.schedule}</div>
                      <div className="ce-course-prereqs">
                        Prerequisites: {course.prerequisites.length === 0 ? 'None' : course.prerequisites.join(', ')}
                      </div>
                    </div>
                    <div className="ce-course-description">{course.description}</div>
                    <div className="ce-course-actions">
                      <button
                        onClick={() => toggleCourse(course.code)}
                        className={`ce-btn ce-btn-select ${selectedCourses.includes(course.code) ? 'selected' : ''}`}
                      >
                        {selectedCourses.includes(course.code) ? '✓ Selected' : 'Select Course'}
                      </button>
                      <button className="ce-btn ce-btn-details">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Not Eligible Courses */}
          <section className="ce-section">
            <h3 className="ce-section-title">❌ Not Eligible Courses</h3>
            {notEligible.length === 0 ? (
              <div className="ce-empty-state">All courses are eligible!</div>
            ) : (
              <div className="ce-course-list">
                {notEligible.map(({ course, reasons }) => (
                  <div key={course.code} className="ce-course-card ce-not-eligible">
                    <div className="ce-course-header">
                      <div>
                        <div className="ce-course-code">{course.code}</div>
                        <div className="ce-course-name">{course.name}</div>
                      </div>
                    </div>
                    <div className="ce-course-reasons">
                      {reasons.map((reason, idx) => (
                        <div key={idx} className="ce-reason">
                          ✕ {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
              <button onClick={generateSmartPlan} className="ce-btn-smart">
                Generate Smart Study Plan
              </button>
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
