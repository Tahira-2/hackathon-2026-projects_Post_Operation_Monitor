import { supabase } from "../lib/supabase";

function buildResetPasswordRedirectUrl() {
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
  return `${frontendUrl.replace(/\/$/, "")}/reset-password`;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);

  const { error: profileError } = await supabase
    .from("doctors")
    .insert({ id: data.user!.id, email, full_name: fullName });

  if (profileError) throw new Error(profileError.message);

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut(token: string) {
  const { error } = await supabase.auth.admin.signOut(token);
  if (error) throw new Error(error.message);
}

export async function forgotPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: buildResetPasswordRedirectUrl(),
  });
  if (error) throw new Error(error.message);
}

export async function resetPassword(userId: string, newPassword: string) {
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  if (error) throw new Error(error.message);
}
