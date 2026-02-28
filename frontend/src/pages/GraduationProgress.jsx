import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './GraduationProgress.css';
import { supabase } from '../config/supabaseClient';
import { useEffect } from 'react';

/**
 * GraduationProgress page — displays degree progress, course status, and graduation eligibility.
 */

const GRADE_OPTIONS = [
  { value: 5.0, label: 'A+ - Exceptional (95-100)' },
  { value: 4.75, label: 'A - Excellent (90-94)' },
  { value: 4.5, label: 'B+ - Superior (85-89)' },
  { value: 4.0, label: 'B - Very Good (80-84)' },
  { value: 3.5, label: 'C+ - Above Average (75-79)' },
  { value: 3.0, label: 'C - Good (70-74)' },
  { value: 2.5, label: 'D+ - High Pass (65-69)' },
  { value: 2.0, label: 'D - Pass (60-64)' },
  { value: 0, label: 'F - Fail (0-59)' },
  { value: 0, label: 'DN - Denial (0-59)' },
  { value: 'IC', label: 'IC - Incomplete' },
];

const INITIAL_STUDENT_DATA = {
  name: 'Alex Johnson',
  degreeType: 'BS Computer Science',
  minGPARequired: 2.0,
};

const DEPARTMENT_CREDITS = {
  'CS': 115,
  'IS': 115,
  'IT': 116,
};

const DEPARTMENT_LABELS = {
  'CS': 'BS Computer Science',
  'IS': 'BS Information System',
  'IT': 'BS Information Technology',
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

function getStatusIndicator(status) {
  const map = {
    completed: { color: '#166534', label: '✓', title: 'Completed' },
    'in-progress': { color: '#b45309', label: '→', title: 'In Progress' },
    'not-started': { color: '#7c2d12', label: '○', title: 'Not Started' },
  };
  return map[status] || map['not-started'];
}

function GraduationProgress() {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newCourse, setNewCourse] = useState({ code: '', name: '', credits: 3, grade: '' });
  const [allCourses, setAllCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [remainingCourses, setRemainingCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const normalizedDept = normalizeDepartmentCode(user?.department);

      let data = null;
      let error = null;

      // 1) If we have a normalized department, try fetching by that code.
      if (normalizedDept) {
        const res = await supabase
          .from('courses')
          .select('*')
          .eq('department', normalizedDept);
        data = res.data;
        error = res.error;
      } else if (user?.department) {
        // 2) Fallback: try a loose match on whatever is stored.
        const res = await supabase
          .from('courses')
          .select('*')
          .ilike('department', `%${user.department}%`);
        data = res.data;
        error = res.error;
      }

      // 3) If we still have no courses, fetch all so the select is never empty.
      if (!error && Array.isArray(data) && data.length > 0) {
        setAllCourses(data);
        return;
      }

      const fallback = await supabase.from('courses').select('*');
      if (!fallback.error && Array.isArray(fallback.data)) {
        setAllCourses(fallback.data);
      }
    };

    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCompletedCourses = async () => {
      const { data, error } = await supabase
        .from('student_courses')
        .select(`
        id,
        grade,
        status,
        courses (
          id,
          course_code,
          course_title,
          credit_hours
        )
      `)
        .eq('student_id', user.id);

      if (!error) {
        const formatted = data.map(item => ({
          id: item.id,
          code: item.courses.course_code,
          name: item.courses.course_title,
          credits: item.courses.credit_hours,
          grade: item.grade,
          status: item.status,
          course_id: item.courses.id
        }));

        setCompletedCourses(formatted);
      }
    };

    fetchCompletedCourses();
  }, [user]);

  useEffect(() => {
    if (!allCourses.length) return;

    const completedIds = completedCourses.map(c => c.course_id);

    const remaining = allCourses
      .filter(course => !completedIds.includes(course.id))
      .map(course => ({
        id: course.id,
        code: course.course_code,
        name: course.course_title,
        credits: course.credit_hours,
        status: 'not-started'
      }));

    setRemainingCourses(remaining);
  }, [allCourses, completedCourses]);

  const totalCreditsRequired = useMemo(() => {
    const code = normalizeDepartmentCode(user?.department);
    if (!code) return 0;
    return DEPARTMENT_CREDITS[code] ?? 0;
  }, [user]);

  const totalCreditsCompleted = useMemo(() => {
    return completedCourses.filter(c => c.grade !== 'IC').reduce((sum, c) => sum + c.credits, 0);
  }, [completedCourses]);

  const currentGPA = useMemo(() => {
    const valid = completedCourses.filter(c => c.grade !== 'IC');
    const totalPoints = valid.reduce((sum, c) => sum + (parseFloat(c.grade) * c.credits), 0);
    const credits = valid.reduce((sum, c) => sum + c.credits, 0);
    return credits > 0 ? (totalPoints / credits).toFixed(2) : '0.00';
  }, [completedCourses]);

  const creditPercentage = useMemo(() => {
    if (!totalCreditsRequired) return 0;
    return Math.round((totalCreditsCompleted / totalCreditsRequired) * 100);
  }, [totalCreditsCompleted, totalCreditsRequired]);

  const gpaStatus = useMemo(() => {
    const gpa = parseFloat(currentGPA);
    if (gpa >= 3.5) return { label: 'Excellent', color: '#166534' };
    if (gpa >= 3.0) return { label: 'Good', color: '#166534' };
    if (gpa >= 2.5) return { label: 'Satisfactory', color: '#b45309' };
    return { label: 'Below Target', color: '#dc2626' };
  }, [currentGPA]);

  const graduationEligible = useMemo(() => {
    return (
      totalCreditsCompleted >= totalCreditsRequired &&
      parseFloat(currentGPA) >= INITIAL_STUDENT_DATA.minGPARequired
    );
  }, [totalCreditsCompleted, totalCreditsRequired, currentGPA]);

  const remainingCredits = totalCreditsRequired - totalCreditsCompleted;

  const handleAddOrUpdateCourse = async () => {
    if (!newCourse.code || !newCourse.grade) return;

    let selectedCourse = allCourses.find(c => c.course_code === newCourse.code);

    // If the course doesn't exist yet (manual entry), create it first.
    if (!selectedCourse && newCourse.code !== 'CUSTOM') {
      const { data: created, error: createError } = await supabase
        .from('courses')
        .insert([{
          course_code: newCourse.code,
          course_title: newCourse.name || newCourse.code,
          credit_hours: newCourse.credits || 3,
          department: user?.department || null,
        }])
        .select('*')
        .single();

      if (createError || !created) return;

      selectedCourse = created;
      setAllCourses(prev => [...prev, created]);
    }

    if (!selectedCourse) return;

    const { error } = await supabase
      .from('student_courses')
      .insert([
        {
          student_id: user.id,
          course_id: selectedCourse.id,
          grade: newCourse.grade,
          status: 'completed'
        }
      ]);

    if (!error) {
      setIsAdding(false);
      setNewCourse({ code: '', name: '', credits: 3, grade: '' });

      // Refetch completed
      const { data } = await supabase
        .from('student_courses')
        .select(`
        id,
        grade,
        status,
        courses (
          id,
          course_code,
          course_title,
          credit_hours
        )
      `)
        .eq('student_id', user.id);

      const formatted = data.map(item => ({
        id: item.id,
        code: item.courses.course_code,
        name: item.courses.course_title,
        credits: item.courses.credit_hours,
        grade: item.grade,
        status: item.status,
        course_id: item.courses.id
      }));

      setCompletedCourses(formatted);
    }
  };

  const startEdit = (index) => {
    setNewCourse(completedCourses[index]);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const removeCompleted = (index) => {
    const removed = completedCourses[index];
    setCompletedCourses(completedCourses.filter((_, i) => i !== index));
    // Optionally add back to remaining if it's a known course
    if (!remainingCourses.find(c => c.code === removed.code)) {
      setRemainingCourses([...remainingCourses, { ...removed, status: 'not-started', grade: undefined }]);
    }
  };

  return (

    <div className="graduation-progress-container">
      <div className="gp-header">
        <h2>Graduation Progress</h2>
        <div className="gp-degree-info">{DEPARTMENT_LABELS[user?.department] || INITIAL_STUDENT_DATA.degreeType}</div>
      </div>

      <div className="gp-card">
        <div className="gp-card-header">
          <h3>Degree Progress Overview</h3>
        </div>
        <div className="gp-card-body">
          <div className="gp-stat-row">
            <div>
              <div className="gp-stat-label">Credits Completed</div>
              <div className="gp-stat-value">{totalCreditsCompleted}</div>
            </div>
            <div>
              <div className="gp-stat-label">Credits Required</div>
              <div className="ce-overview-value">{totalCreditsRequired} C.H</div>
            </div>
            <div>
              <div className="gp-stat-label">Remaining</div>
              <div className="gp-stat-value" style={{ color: '#dc2626' }}>{remainingCredits > 0 ? remainingCredits : 0}</div>
            </div>
          </div>
        </div>
      </div>

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
            {totalCreditsCompleted} of {totalCreditsRequired} credits completed
          </div>
        </div>
      </div>

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
              <div className="gp-stat-value">{currentGPA}</div>
            </div>
            <div>
              <div className="gp-stat-label">Minimum Required</div>
              <div className="gp-stat-value">{INITIAL_STUDENT_DATA.minGPARequired}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`gp-card gp-eligibility ${graduationEligible ? 'eligible' : 'not-eligible'}`}>
        <div className="gp-card-header">
          <h3>Graduation Eligibility</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: graduationEligible ? '#166534' : '#dc2626' }}>
            {graduationEligible ? '✓ Ready' : '✗ Not Ready'}
          </div>
        </div>
        <div className="gp-card-body">
          <div className="gp-eligibility-checks">
            <div className={`gp-check ${totalCreditsCompleted >= INITIAL_STUDENT_DATA.totalCreditsRequired ? 'pass' : 'fail'}`}>
              <span>●</span>
              <span>Total Credits: {totalCreditsCompleted}/{totalCreditsRequired}</span>
            </div>
            <div className={`gp-check ${parseFloat(currentGPA) >= INITIAL_STUDENT_DATA.minGPARequired ? 'pass' : 'fail'}`}>
              <span>●</span>
              <span>GPA Requirement: {currentGPA} ≥ {INITIAL_STUDENT_DATA.minGPARequired}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="gp-card">
        <div className="gp-card-header">
          <h3>Remaining Courses</h3>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{remainingCourses.length} courses</div>
        </div>
        <div className="gp-card-body">
          <div className="gp-course-list">
            {remainingCourses.slice(0, 3).map((course) => {
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

          {remainingCourses.length > 3 && (
            <div className="gp-remaining-select">
              <label htmlFor="remaining-select">All remaining courses</label>
              <select id="remaining-select">
                {remainingCourses.map((course) => (
                  <option key={course.code} value={course.code}>
                    {course.code} - {course.name} ({course.credits} C.H)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="gp-card">
        <div className="gp-card-header">
          <h3>Completed Courses</h3>
          <button
            className="gp-add-btn"
            onClick={() => { setIsAdding(true); setEditingIndex(null); setNewCourse({ code: '', name: '', credits: 3, grade: '' }); }}
          >
            + Add Course
          </button>
        </div>
        <div className="gp-card-body">
          {isAdding && (
            <div className="gp-add-form">
              <div className="gp-form-row">
                <select
                  value={newCourse.code}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === 'CUSTOM') {
                      setNewCourse({ ...newCourse, code: 'CUSTOM', name: '', credits: 3 });
                      return;
                    }

                    const selected = remainingCourses.find(c => c.code === value) || { code: '', name: '', credits: 3 };
                    setNewCourse({ ...newCourse, code: selected.code, name: selected.name, credits: selected.credits });
                  }}
                >
                  <option value="">Select Course</option>
                  {remainingCourses.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                  <option value="CUSTOM">Other (Manual Entry)</option>
                </select>
                {newCourse.code === 'CUSTOM' && (
                  <>
                    <input type="text" placeholder="Code" onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })} />
                    <input type="text" placeholder="Name" onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })} />
                    <input type="number" placeholder="Credits" onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })} />
                  </>
                )}
                <select value={newCourse.grade} onChange={(e) => setNewCourse({ ...newCourse, grade: parseFloat(e.target.value) })}>
                  <option value="">Grade</option>
                  {GRADE_OPTIONS.map(opt => <option key={opt.label} value={opt.value}>{opt.label}</option>)}
                </select>
                <button onClick={handleAddOrUpdateCourse}>{editingIndex !== null ? 'Update' : 'Add'}</button>
                <button className="gp-cancel-btn" onClick={() => { setIsAdding(false); setEditingIndex(null); }}>Cancel</button>
              </div>
            </div>
          )}
          <div className="gp-course-list">
            {completedCourses.map((course, index) => {
              const ind = getStatusIndicator(course.status);
              const gradeLabel = GRADE_OPTIONS.find(o => o.value === course.grade)?.label || 'N/A';
              return (
                <div key={course.code} className="gp-course-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: ind.color, fontWeight: 700 }}>{ind.label}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{course.code} ({gradeLabel})</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{course.name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{course.credits} credits</div>
                    <button className="gp-icon-btn" onClick={() => startEdit(index)}>✎</button>
                    <button className="gp-icon-btn" onClick={() => removeCompleted(index)}>🗑</button>
                  </div>
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

