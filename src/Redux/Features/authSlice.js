import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../services/api'

// ── Persist helpers ──────────────────────────────────────────────────────────
const loadAuth = () => {
  try {
    const raw = localStorage.getItem('auth');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const saveAuth = (state) => {
  try {
    localStorage.setItem('auth', JSON.stringify({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
    }));
  } catch { /* ignore */ }
};

export const clearAuth = () => localStorage.removeItem('auth');

const persisted = loadAuth();

// ─────────────────────── AUTH THUNKS ─────────────────────────────────────────

// ✅ SEND OTP
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (phone, { rejectWithValue }) => {
    try {
      const res = await API.post('/api/auth/send-otp', { phone })
      return res.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

// ✅ VERIFY OTP
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (verifyData, { rejectWithValue }) => {
    try {
      const res = await API.post('/api/auth/verify-otp', verifyData)
      return res.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

// ✅ CREATE ACCOUNT
export const createAccount = createAsyncThunk(
  'auth/createAccount',
  async (accountData, { rejectWithValue }) => {
    try {
      const res = await API.post('/api/auth/signup', accountData)
      return res.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

// ✅ UPDATE OWN PROFILE (username / gender / dob / motherTongue)
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await API.put('/api/profile/', profileData);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
)

// ✅ UPDATE AVATAR (base64 or URL → Cloudinary via backend)
export const updateAvatar = createAsyncThunk(
  'auth/updateAvatar',
  async (avatarData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      const res = await API.put(
        `/api/profile/user/updateAvatar/${user._id}`,
        { avatar: avatarData }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
)

// ✅ FETCH FULL PROFILE FROM BACKEND (syncs avatarConfig + all fields)
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/api/profile/me');
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
)

// ✅ UPDATE USER STATUS
export const updateUserStatus = createAsyncThunk(
  'auth/updateUserStatus',
  async (statusData, { rejectWithValue }) => {
    try {
      const res = await API.patch('/api/profile/status', statusData);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
)

// ─────────────────────── ADMIN THUNKS ────────────────────────────────────────

// ✅ ADMIN — GET ALL USERS
export const adminGetUsers = createAsyncThunk(
  'auth/adminGetUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await API.get('/api/profile/admin/users', { params });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
)

// ✅ ADMIN — UPDATE USER
export const adminUpdateUser = createAsyncThunk(
  'auth/adminUpdateUser',
  async ({ userId, updates }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/api/profile/admin/updateUser/${userId}`, updates);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
)

// ✅ ADMIN — DELETE USER
export const adminDeleteUser = createAsyncThunk(
  'auth/adminDeleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await API.delete(`/api/profile/admin/deleteUser/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:            persisted?.user            ?? null,
    token:           persisted?.token           ?? null,
    isAuthenticated: persisted?.isAuthenticated ?? false,
    loading:         false,
    profileLoading:  false,
    error:           null,
    // Admin state
    adminUsers:      [],
    adminStats:      null,
    adminPagination: null,
    adminLoading:    false,
    adminError:      null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearAuth();
    },
    // ✔ Called by App.jsx when socket broadcasts user:statusChange for THIS user
    socketStatusUpdate: (state, action) => {
      if (state.user) {
        state.user.userCurrentStatus = action.payload.status;
        saveAuth(state); // keep localStorage in sync
      }
    },
  },
  extraReducers: (builder) => {
    builder

      // ── SEND OTP ──
      .addCase(sendOtp.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(sendOtp.fulfilled, (state) => { state.loading = false; })
      .addCase(sendOtp.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      // ── VERIFY OTP ──
      .addCase(verifyOtp.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.actionRequired === "SIGNUP") {
          state.isAuthenticated = false;
        } else {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          saveAuth(state);
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // ── CREATE ACCOUNT ──
      .addCase(createAccount.pending,   (state) => { state.loading = true; })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        saveAuth(state);
      })
      .addCase(createAccount.rejected, (state, action) => { state.loading = false; state.error = action.payload; })


      // ── UPDATE PROFILE ──
      .addCase(updateProfile.pending,   (state) => { state.profileLoading = true;  state.error = null; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload.user;
        saveAuth(state);
      })
      .addCase(updateProfile.rejected,  (state, action) => { state.profileLoading = false; state.error = action.payload; })

      // ── UPDATE AVATAR ──
      .addCase(updateAvatar.pending,   (state) => { state.profileLoading = true;  state.error = null; })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.profileLoading = false;
        if (state.user) state.user.avatar = action.payload.avatar;
        saveAuth(state);
      })
      .addCase(updateAvatar.rejected,  (state, action) => { state.profileLoading = false; state.error = action.payload; })

      // ── FETCH PROFILE ──
      .addCase(fetchProfile.pending,   (state) => { state.profileLoading = true; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload.user;
        saveAuth(state);
      })
      .addCase(fetchProfile.rejected,  (state) => { state.profileLoading = false; })

      // ── UPDATE USER STATUS ──
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        if (state.user) state.user.userCurrentStatus = action.payload.user.userCurrentStatus;
      })
      .addCase(updateUserStatus.rejected, (state, action) => { state.error = action.payload; })

      // ── ADMIN GET USERS ──
      .addCase(adminGetUsers.pending,   (state) => { state.adminLoading = true; state.adminError = null; })
      .addCase(adminGetUsers.fulfilled, (state, action) => {
        state.adminLoading    = false;
        state.adminUsers      = action.payload.users;
        state.adminStats      = action.payload.stats;
        state.adminPagination = action.payload.pagination;
      })
      .addCase(adminGetUsers.rejected, (state, action) => { state.adminLoading = false; state.adminError = action.payload; })

      // ── ADMIN UPDATE USER ──
      .addCase(adminUpdateUser.pending, (state) => { state.adminError = null; })
      .addCase(adminUpdateUser.fulfilled, (state, action) => {
        const updated = action.payload.user;
        const idx = state.adminUsers.findIndex(u => u._id === updated._id);
        if (idx !== -1) state.adminUsers[idx] = updated;
      })
      .addCase(adminUpdateUser.rejected, (state, action) => { state.adminError = action.payload; })

      // ── ADMIN DELETE USER ──
      .addCase(adminDeleteUser.fulfilled, (state, action) => {
        state.adminUsers = state.adminUsers.filter(u => u._id !== action.payload);
        if (state.adminStats) state.adminStats.totalAll = Math.max(0, state.adminStats.totalAll - 1);
      })
  }
})

export const { logout, socketStatusUpdate } = authSlice.actions
export default authSlice.reducer
