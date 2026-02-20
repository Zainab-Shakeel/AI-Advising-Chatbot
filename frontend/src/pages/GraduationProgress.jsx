import React, { useMemo } from 'react';
import './GraduationProgress.css';

/**
 * GraduationProgress page — displays degree progress, course status, and graduation eligibility.
 * Uses mock data for now; easily replaceable with API calls.
 */

const mockStudentData = {
  name: 'Alex Johnson',
  degreeType: 'BS Computer Science',
  gpa: 3.45,
  totalCreditsRequired: 120,
  totalCreditsCompleted: 84,
  coreCoursesRequired: 12,
  coreCoursesCompleted: 10,
  electivesRequired: 30,
  electivesCompleted: 20,
  minGPARequired: 2.0,
};

const mockCourses = {
  completed: [
    { code: 'CS101', name: 'Intro to CS', credits: 3, status: 'completed' },
    { code: 'CS102', name: 'Programming I', credits: 3, status: 'completed' },
    { code: 'CS201', name: 'Data Structures', credits: 3, status: 'completed' },
    { code: 'MATH101', name: 'Calculus I', credits: 4, status: 'completed' },
  ],
  inProgress: [
    { code: 'CS202', name: 'Algorithms', credits: 3, status: 'in-progress' },
    { code: 'CS301', name: 'Operating Systems', credits: 4, status: 'in-progress' },
  ],
  remaining: [
    { code: 'CS401', name: 'Database Systems', credits: 3, status: 'not-started' },
    { code: 'CS402', name: 'Software Engineering', credits: 3, status: 'not-started' },
    { code: 'ELEC101', name: 'Elective - AI Basics', credits: 3, status: 'not-started' },
  ],
};

function getStatusIndicator(status) {
  const map = {
    completed: { color: '#166534', label: '✓', title: 'Completed' },
    'in-progress': { color: '#b45309', label: '→', title: 'In Progress' },
    'not-started': { color: '#7c2d12', label: '○', title: 'Not Started' },
  };
  return map[status] || map['not-started'];
}

function GraduationProgress() {
  const creditPercentage = useMemo(() => {
    return Math.round((mockStudentData.totalCreditsCompleted / mockStudentData.totalCreditsRequired) * 100);
  }, []);

  const corePercentage = useMemo(() => {
    return Math.round((mockStudentData.coreCoursesCompleted / mockStudentData.coreCoursesRequired) * 100);
  }, []);

  const electivePercentage = useMemo(() => {
    return Math.round((mockStudentData.electivesCompleted / mockStudentData.electivesRequired) * 100);
  }, []);

  const gpaStatus = useMemo(() => {
    if (mockStudentData.gpa >= 3.5) return { indicator: 'green', label: 'Excellent', color: '#166534' };
    if (mockStudentData.gpa >= 3.0) return { indicator: 'green', label: 'Good', color: '#166534' };
    if (mockStudentData.gpa >= 2.5) return { indicator: 'yellow', label: 'Satisfactory', color: '#b45309' };
    return { indicator: 'red', label: 'Below Target', color: '#dc2626' };
  }, []);

  const graduationEligible = useMemo(() => {
    return (
      mockStudentData.totalCreditsCompleted >= mockStudentData.totalCreditsRequired &&
      mockStudentData.coreCoursesCompleted >= mockStudentData.coreCoursesRequired &&
      mockStudentData.gpa >= mockStudentData.minGPARequired
    );
  }, []);

  const remainingCredits = mockStudentData.totalCreditsRequired - mockStudentData.totalCreditsCompleted;

  return (
    <div className="graduation-progress-container">
      <div className="gp-header">
        <h2>Graduation Progress</h2>
        <div className="gp-degree-info">{mockStudentData.degreeType}</div>
      </div>

      {/* Degree Progress Overview */}
      <div className="gp-card">
        <div className="gp-card-header">
          <h3>Degree Progress Overview</h3>
        </div>
        <div className="gp-card-body">
          <div className="gp-stat-row">
            <div>
              <div className="gp-stat-label">Credits Completed</div>
              <div className="gp-stat-value">{mockStudentData.totalCreditsCompleted}</div>
            </div>
            <div>
              <div className="gp-stat-label">Credits Required</div>
              <div className="gp-stat-value">{mockStudentData.totalCreditsRequired}</div>
            </div>
            <div>
              <div className="gp-stat-label">Remaining</div>
              <div className="gp-stat-value" style={{ color: '#dc2626' }}>{remainingCredits}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Progress Bar */}
      <div className="gp-card">
        <div className="gp-card-header">
          <h3>Credit Progress</h3>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{creditPercentage}% Complete</div>
        </div>
        <div className="gp-card-body">
          <div className="gp-progress-bar">
            <div className="gp-progress-fill" style={{ width: `${creditPercentage}%` }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
            {mockStudentData.totalCreditsCompleted} of {mockStudentData.totalCreditsRequired} credits completed
          </div>
        </div>
      </div>

      {/* Core Courses Section */}
      <div className="gp-card">
        <div className="gp-card-header">
          <h3>Core Courses</h3>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{corePercentage}% Complete</div>
        </div>
        <div className="gp-card-body">
          <div className="gp-progress-bar">
            <div className="gp-progress-fill" style={{ width: `${corePercentage}%` }} />
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
            {mockStudentData.coreCoursesCompleted} of {mockStudentData.coreCoursesRequired} required
          </div>
        </div>
      </div>

      {/* Electives Section */}
      <div className="gp-card">
        <div className="gp-card-header">
          <h3>Electives</h3>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{electivePercentage}% Complete</div>
        </div>
        <div className="gp-card-body">
          <div className="gp-progress-bar">
            <div className="gp-progress-fill" style={{ width: `${electivePercentage}%` }} />
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
            {mockStudentData.electivesCompleted} of {mockStudentData.electivesRequired} required
          </div>
        </div>
      </div>

      {/* GPA Status */}
      <div className="gp-card">
        <div className="gp-card-header">
          <h3>GPA Status</h3>
          <div style={{ fontSize: 14, color: gpaStatus.color }}>
            <span style={{ marginRight: 6 }}>●</span> {gpaStatus.label}
          </div>
        </div>
        <div className="gp-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div className="gp-stat-label">Current GPA</div>
              <div className="gp-stat-value">{mockStudentData.gpa}</div>
            </div>
            <div>
              <div className="gp-stat-label">Minimum Required</div>
              <div className="gp-stat-value">{mockStudentData.minGPARequired}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Graduation Eligibility Status */}
      <div className={`gp-card gp-eligibility ${graduationEligible ? 'eligible' : 'not-eligible'}`}>
        <div className="gp-card-header">
          <h3>Graduation Eligibility</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: graduationEligible ? '#166534' : '#dc2626' }}>
            {graduationEligible ? '✓ Ready' : '✗ Not Ready'}
          </div>
        </div>
        <div className="gp-card-body">
          <div className="gp-eligibility-checks">
            <div className={`gp-check ${mockStudentData.totalCreditsCompleted >= mockStudentData.totalCreditsRequired ? 'pass' : 'fail'}`}>
              <span>●</span>
              <span>Total Credits: {mockStudentData.totalCreditsCompleted}/{mockStudentData.totalCreditsRequired}</span>
            </div>
            <div className={`gp-check ${mockStudentData.coreCoursesCompleted >= mockStudentData.coreCoursesRequired ? 'pass' : 'fail'}`}>
              <span>●</span>
              <span>Core Courses: {mockStudentData.coreCoursesCompleted}/{mockStudentData.coreCoursesRequired}</span>
            </div>
            <div className={`gp-check ${mockStudentData.gpa >= mockStudentData.minGPARequired ? 'pass' : 'fail'}`}>
              <span>●</span>
              <span>GPA Requirement: {mockStudentData.gpa} ≥ {mockStudentData.minGPARequired}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Remaining Courses */}
      <div className="gp-card">
        <div className="gp-card-header">
          <h3>Remaining Courses</h3>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{mockCourses.remaining.length} courses</div>
        </div>
        <div className="gp-card-body">
          <div className="gp-course-list">
            {mockCourses.remaining.map((course) => {
              const ind = getStatusIndicator(course.status);
              return (
                <div key={course.code} className="gp-course-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: ind.color, fontWeight: 700 }}>{ind.label}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{course.code}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{course.name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{course.credits} credits</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completed Courses */}
      <div className="gp-card">
        <div className="gp-card-header">
          <h3>Completed Courses</h3>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{mockCourses.completed.length} courses</div>
        </div>
        <div className="gp-card-body">
          <div className="gp-course-list">
            {mockCourses.completed.map((course) => {
              const ind = getStatusIndicator(course.status);
              return (
                <div key={course.code} className="gp-course-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: ind.color, fontWeight: 700 }}>{ind.label}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{course.code}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{course.name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{course.credits} credits</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraduationProgress;
