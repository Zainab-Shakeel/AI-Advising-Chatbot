const USERS_KEY = 'portal_users';

const ALLOWED_EMAIL_DOMAINS = [
  'student.kau.edu.sa',
];

function getUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function isValidOfficialEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email?.trim())) return false;
  const domain = email.split('@')[1]?.toLowerCase() || '';
  return ALLOWED_EMAIL_DOMAINS.some((suffix) => domain.endsWith(suffix));
}

export const ROLES = {
  STUDENT: 'student',
  SYSTEM_ADMIN: 'system_admin',
};

export function signUp({ email, username, password, studentId, department, semester, role }) {
  const users = getUsers();
  const emailLower = email.trim().toLowerCase();
  const usernameLower = username.trim().toLowerCase();
  const userRole = role || ROLES.STUDENT;

  if (users.some((u) => u.email.toLowerCase() === emailLower)) {
    return { success: false, error: 'This email is already registered' };
  }
  if (users.some((u) => u.username.toLowerCase() === usernameLower)) {
    return { success: false, error: 'This username is already taken' };
  }
  if (userRole === ROLES.STUDENT && studentId?.trim() && users.some((u) => u.studentId === studentId.trim())) {
    return { success: false, error: 'This student ID is already registered' };
  }

  users.push({
    email: emailLower,
    username: usernameLower,
    password,
    studentId: userRole === ROLES.STUDENT ? (studentId?.trim() || '') : '',
    department: userRole === ROLES.STUDENT ? (department || '') : '',
    semester: userRole === ROLES.STUDENT ? semester : null,
    role: userRole,
  });
  saveUsers(users);
  return { success: true };
}

// Seed test accounts for staff/admin (call once or add manually)
export function seedStaffAccounts() {
  const users = getUsers();
  const staff = [
    { email: 'admin@university.edu', username: 'admin', password: 'admin123', studentId: '', role: 'system_admin' },
  ];
  let added = 0;
  staff.forEach((s) => {
    if (!users.some((u) => u.email === s.email)) {
      users.push(s);
      added++;
    }
  });
  if (added) saveUsers(users);
}

export function loginByCredentials(usernameOrEmail, password) {
  const users = getUsers();
  const input = usernameOrEmail.trim().toLowerCase();

  const user = users.find(
    (u) =>
      u.username === input ||
      u.email === input ||
      u.username.toLowerCase() === input ||
      u.email.toLowerCase() === input
  );

  if (!user) {
    return { success: false, error: 'Invalid username or password' };
  }
  if (user.password !== password) {
    return { success: false, error: 'Invalid username or password' };
  }

  return {
    success: true,
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      semester: user.semester,
    },
  };
}
