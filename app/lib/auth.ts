interface User {
  email: string;
  isVerified: boolean;
}

// Simple in-memory storage for demo (use proper database in production)
const users: Map<string, { email: string; isVerified: boolean; otp?: string }> = new Map();
const sessions: Map<string, string> = new Map(); // sessionId -> email

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function createUser(email: string): { success: boolean; message: string } {
  if (users.has(email)) {
    return { success: false, message: "User already exists" };
  }
  
  const otp = generateOTP();
  users.set(email, { email, isVerified: false, otp });
  
  // In production, send OTP via email
  console.log(`OTP for ${email}: ${otp}`);
  
  return { success: true, message: "User created. OTP sent to email." };
}

export function loginUser(email: string): { success: boolean; message: string; otp?: string } {
  const user = users.get(email);
  if (!user) {
    return { success: false, message: "User not found" };
  }
  
  const otp = generateOTP();
  users.set(email, { ...user, otp });
  
  // In production, send OTP via email
  console.log(`Login OTP for ${email}: ${otp}`);
  
  return { success: true, message: "OTP sent to email", otp };
}

export function verifyOTP(email: string, otp: string): { success: boolean; message: string; sessionId?: string } {
  const user = users.get(email);
  if (!user) {
    return { success: false, message: "User not found" };
  }
  
  if (user.otp !== otp) {
    return { success: false, message: "Invalid OTP" };
  }
  
  // Mark user as verified and create session
  users.set(email, { ...user, isVerified: true, otp: undefined });
  const sessionId = generateSessionId();
  sessions.set(sessionId, email);
  
  return { success: true, message: "OTP verified successfully", sessionId };
}

export function getUser(sessionId: string): User | null {
  const email = sessions.get(sessionId);
  if (!email) return null;
  
  const user = users.get(email);
  return user ? { email: user.email, isVerified: user.isVerified } : null;
}

export function logout(sessionId: string): void {
  sessions.delete(sessionId);
}