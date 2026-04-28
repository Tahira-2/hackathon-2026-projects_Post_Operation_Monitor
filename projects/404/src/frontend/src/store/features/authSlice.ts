import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  token: string | null
}

const parseUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

const initialState: AuthState = {
  user: parseUser(),
  token: localStorage.getItem('token') || null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token } }: PayloadAction<{ user: AuthUser; token: string }>
    ) => {
      state.user = user
      state.token = token
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    logoutUserAction: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, logoutUserAction } = authSlice.actions
export default authSlice.reducer

