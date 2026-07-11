import { supabase } from './supabase'

// 回傳 { needsEmailConfirm: boolean }：若專案有開「Confirm email」，註冊後不會
// 立刻拿到 session，需要提示使用者去信箱完成驗證才能登入
export async function signUpWithPassword(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return { needsEmailConfirm: !data.session }
}

export async function signInWithPassword(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}
