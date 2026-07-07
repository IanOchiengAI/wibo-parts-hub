const MAP: [string, string][] = [
  ["Invalid login credentials", "Incorrect email or password."],
  ["Email not confirmed", "Please confirm your email before signing in."],
  ["User already registered", "An account with this email already exists."],
  ["Password should be", "Password must be at least 6 characters."],
  ["row-level security", "You don't have permission to do this."],
  ["duplicate key", "This record already exists."],
  ["unique constraint", "This record already exists."],
  ["JWT expired", "Your session has expired. Please sign in again."],
  ["invalid JWT", "Your session is invalid. Please sign in again."],
  ["network", "Network error — check your connection and try again."],
  ["Failed to fetch", "Network error — check your connection and try again."],
];

export function friendlyError(message: string): string {
  for (const [key, friendly] of MAP) {
    if (message.toLowerCase().includes(key.toLowerCase())) return friendly;
  }
  return "Something went wrong. Please try again.";
}
