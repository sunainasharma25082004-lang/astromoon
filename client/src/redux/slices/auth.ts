import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface State { user: { id: string; email: string; name: string } | null; authenticated: boolean; }
const initial: State = { user: null, authenticated: false };
const slice = createSlice({
  name: 'auth', initialState: initial,
  reducers: {
    setUser: (s, a: PayloadAction<State['user']>) => { s.user = a.payload; s.authenticated = !!a.payload; },
    clearUser: (s) => { s.user = null; s.authenticated = false; },
  },
});
export const { setUser, clearUser } = slice.actions;
export default slice.reducer;
