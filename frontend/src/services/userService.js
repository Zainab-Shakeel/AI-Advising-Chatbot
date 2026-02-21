import { supabase } from "../config/supabaseClient";

export const ROLES = {
  STUDENT: "student",
  SYSTEM_ADMIN: "system_admin",
};

const ALLOWED_EMAIL_DOMAINS = ["student.kau.edu.sa"];

export function isValidOfficialEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email?.trim())) return false;
  const domain = email.split("@")[1]?.toLowerCase() || "";
  return ALLOWED_EMAIL_DOMAINS.some((suffix) =>
    domain.endsWith(suffix)
  );
}

/* ===========================
   SIGN UP (Supabase Version)
   =========================== */

export async function signUp({
  email,
  username,
  password,
  studentId,
  department,
  semester,
  role,
}) {
  try {
    // 1️⃣ Create Auth User
    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const user = authData.user;

    // 2️⃣ Insert Profile Data
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id, // MUST match auth.uid()
          email,
          username,
          role,
          student_id: studentId || null,
          department: department || null,
          semester: semester || null,
        },
      ]);

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Something went wrong" };
  }
}

/* ===========================
   LOGIN
   =========================== */

   export async function loginByCredentials(email, password) {
    try {
      // 1️⃣ Sign in with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
  
      if (authError) {
        return { success: false, error: authError.message };
      }
  
      const user = authData.user;
  
      // 2️⃣ Fetch user profile from profiles table
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
  
      if (profileError) {
        return { success: false, error: profileError.message };
      }
  
      // 3️⃣ Return profile (contains role, student_id, etc)
      return {
        success: true,
        user: profile,
      };
    } catch (err) {
      return { success: false, error: "Login failed" };
    }
  }

/* ===========================
   LOGOUT
   =========================== */

export async function logout() {
  await supabase.auth.signOut();
}