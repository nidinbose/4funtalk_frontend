import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Landing from './Components/Homescreen/Landing'
import CreateAccount from './Components/Auth/CreateAccount'
import Login from './Components/Auth/Login'
import AdminDashboard from './Components/Admin/AdminDashboard'
import ProtectedRoute from './ProtectedRoute'
import { socket } from './socket'
import { socketStatusUpdate } from './Redux/Features/authSlice'

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    // Connect with userId so backend can authenticate the socket
    socket.auth = { userId: user._id };
    socket.connect();

    // ✔ Auto-update Redux state whenever the backend broadcasts a status change
    const onStatusChange = ({ userId, status }) => {
      if (userId === user._id) {
        dispatch(socketStatusUpdate({ status }));
      }
    };
    socket.on('user:statusChange', onStatusChange);

    // Disconnect gracefully on tab close → backend sets offline automatically
    const handleBeforeUnload = () => socket.disconnect();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off('user:statusChange', onStatusChange);
      socket.disconnect();
    };
  }, [isAuthenticated, user?._id, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* User routes */}
        <Route path="/home"   element={<ProtectedRoute><Landing /></ProtectedRoute>} />
        <Route path="/signup" element={<CreateAccount />} />
        <Route path="/login"  element={<Login />} />

        {/* Admin route */}
        <Route path="/admin"  element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App