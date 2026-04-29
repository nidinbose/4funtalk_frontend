import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createAccount } from '../../Redux/Features/authSlice'
import { useNavigate, useLocation } from 'react-router-dom'

const CreateAccount = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const phoneParam = searchParams.get('phone') || ''

  const [formData, setFormData] = useState({
    phone: phoneParam,
    username: '',
    dob: '',
    gender: '',
    motherTongue: '',
    avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  })

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(state => state.auth)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await dispatch(createAccount(formData))
    if (res.meta.requestStatus === 'fulfilled') {
      navigate('/home')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-100 px-4 py-8">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-[0_20px_60px_-10px_rgba(46,167,224,0.3)] relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -m-16 w-32 h-32 bg-blue-400 rounded-full blur-[80px] opacity-30"></div>
        <div className="absolute bottom-0 left-0 -m-16 w-32 h-32 bg-sky-300 rounded-full blur-[80px] opacity-30"></div>

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#2EA7E0] to-[#4FACFE] rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">4F</span>
          </div>
          <h2 className="text-2xl font-bold mt-3 text-gray-800">
            Create Account
          </h2>
          <p className="text-gray-500 text-sm mt-1">Join 4FunTalk today</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              readOnly={!!phoneParam}
              className="w-full px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-[#2EA7E0] transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-[#2EA7E0] transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-[#2EA7E0] transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-[#2EA7E0] transition"
              required
            >
              <option value="" disabled>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mother Tongue</label>
            <input
              type="text"
              name="motherTongue"
              value={formData.motherTongue}
              onChange={handleChange}
              placeholder="e.g. English, Spanish"
              className="w-full px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-[#2EA7E0] transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-2xl text-white font-semibold bg-gradient-to-r from-[#2EA7E0] to-[#4FACFE] hover:from-[#1C7ED6] hover:to-[#3B82F6] shadow-md hover:shadow-lg transition active:scale-[0.98]"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateAccount