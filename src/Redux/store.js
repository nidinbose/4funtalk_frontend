import { configureStore } from '@reduxjs/toolkit'
import authReducer, { saveAuth } from '../Redux/Features/authSlice.js'

const store = configureStore({
  reducer: {
    auth: authReducer
  }
})

// ✅ Persist auth slice to localStorage on every state change
store.subscribe(() => {
  saveAuth(store.getState().auth)
})

export default store