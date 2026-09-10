import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface StudentAccount {
  email: string;
  passwordHash: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'cu_swo_student_accounts';

/**
 * Native cryptographic SHA-256 hash using Web Crypto API.
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return btoa(password);
  }
};

/**
 * Retrieve all registered student accounts from local storage.
 */
export const getLocalAccounts = (): Record<string, StudentAccount> => {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return {};
    return JSON.parse(item);
  } catch {
    return {};
  }
};

/**
 * Save accounts dictionary to local storage.
 */
export const saveLocalAccounts = (accounts: Record<string, StudentAccount>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save student accounts to local storage:', err);
  }
};

/**
 * Sign up a new student with password and profile details.
 */
export const registerStudentAccount = async (params: {
  email: string;
  password: string;
  name: string;
  regNo: string;
  department: string;
}): Promise<{ success: boolean; user?: User; error?: string }> => {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.name.trim();
  const cleanRegNo = params.regNo.trim();
  const cleanDept = params.department.trim() || 'School of Engineering and Technology';

  if (!cleanEmail) {
    return { success: false, error: 'Institutional email is required.' };
  }

  const hasChristDomain = cleanEmail.includes('@christuniversity.in') || cleanEmail.includes('christuniversity.in');
  if (!hasChristDomain) {
    return {
      success: false,
      error: 'Access Restricted: Your email must contain @christuniversity.in (e.g. name@christuniversity.in).',
    };
  }

  if (!cleanName) {
    return { success: false, error: 'Student full name is required.' };
  }

  if (!cleanRegNo) {
    return { success: false, error: 'Registration number is required.' };
  }

  if (!params.password || params.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const accounts = getLocalAccounts();

  // Check if email already registered locally
  if (accounts[cleanEmail]) {
    return {
      success: false,
      error: 'An account with this email already exists. Please switch to "Sign In" to enter your password.',
    };
  }

  // Check Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('student_accounts')
        .select('email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (data) {
        return {
          success: false,
          error: 'An account with this email already exists. Please switch to "Sign In" to enter your password.',
        };
      }
    } catch {
      // Table may not exist yet or connection issue; continue with local storage
    }
  }

  const passwordHash = await hashPassword(params.password);
  const now = new Date().toISOString();

  const newUser: User = {
    id: 'usr_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'),
    name: cleanName,
    role: 'student',
    regNo: cleanRegNo,
    department: cleanDept,
    year: '',
    campus: 'Yeshwanthpur Campus, Bengaluru',
    email: cleanEmail,
    phone: '',
    avatar: '',
  };

  const newAccount: StudentAccount = {
    email: cleanEmail,
    passwordHash,
    user: newUser,
    createdAt: now,
    updatedAt: now,
  };

  // Save to local storage
  accounts[cleanEmail] = newAccount;
  saveLocalAccounts(accounts);

  // Sync to Supabase if table exists
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('student_accounts').upsert({
        email: cleanEmail,
        password_hash: passwordHash,
        name: cleanName,
        reg_no: cleanRegNo,
        department: cleanDept,
        phone: '',
        year: '',
        avatar: '',
        updated_at: now,
      });
    } catch (err) {
      console.warn('Supabase student_accounts sync skipped/table pending:', err);
    }
  }

  return { success: true, user: newUser };
};

/**
 * Authenticate student with email and password.
 */
export const authenticateStudent = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return { success: false, error: 'Please enter your institutional email.' };
  }

  const hasChristDomain = cleanEmail.includes('@christuniversity.in') || cleanEmail.includes('christuniversity.in');
  if (!hasChristDomain) {
    return {
      success: false,
      error: 'Access Restricted: Your email must contain @christuniversity.in.',
    };
  }

  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const accounts = getLocalAccounts();
  let account = accounts[cleanEmail];

  // If not found in local storage, check remote Supabase
  if (!account && isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('student_accounts')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (data) {
        account = {
          email: data.email,
          passwordHash: data.password_hash,
          user: {
            id: 'usr_' + data.email.replace(/[^a-zA-Z0-9]/g, '_'),
            name: data.name,
            role: 'student',
            regNo: data.reg_no,
            department: data.department,
            year: data.year || '',
            campus: 'Yeshwanthpur Campus, Bengaluru',
            email: data.email,
            phone: data.phone || '',
            avatar: data.avatar || '',
          },
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || new Date().toISOString(),
        };
        // Cache locally for fast future logins
        accounts[cleanEmail] = account;
        saveLocalAccounts(accounts);
      }
    } catch {
      // continue
    }
  }

  if (!account) {
    return {
      success: false,
      error: 'No account found with this email. Please click "Create Account" below to register your profile.',
    };
  }

  const inputHash = await hashPassword(password);
  if (inputHash !== account.passwordHash) {
    return {
      success: false,
      error: 'Incorrect password. Please verify your credentials and try again.',
    };
  }

  return { success: true, user: account.user };
};

/**
 * Persist updated student profile details (e.g. phone, year, avatar, name).
 */
export const persistStudentProfileUpdate = async (updatedUser: User) => {
  const cleanEmail = updatedUser.email.trim().toLowerCase();
  const accounts = getLocalAccounts();

  if (accounts[cleanEmail]) {
    accounts[cleanEmail] = {
      ...accounts[cleanEmail],
      user: { ...accounts[cleanEmail].user, ...updatedUser },
      updatedAt: new Date().toISOString(),
    };
    saveLocalAccounts(accounts);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('student_accounts').update({
        name: updatedUser.name,
        reg_no: updatedUser.regNo,
        department: updatedUser.department,
        phone: updatedUser.phone,
        year: updatedUser.year,
        avatar: updatedUser.avatar,
        updated_at: new Date().toISOString(),
      }).eq('email', cleanEmail);
    } catch (err) {
      console.warn('Supabase student_accounts update skipped:', err);
    }
  }
};
