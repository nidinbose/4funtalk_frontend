import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyOtp } from "../../Redux/Features/authSlice.js";

import { useNavigate } from "react-router-dom";

const Login = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const res = await dispatch(sendOtp(phone));
    if (res.meta.requestStatus === "fulfilled") {
      setStep(2);
    }
  };

const handleVerifyOtp = async (e) => {
  e.preventDefault();

  const res = await dispatch(verifyOtp({ phone, otp }));

  if (res.meta.requestStatus === "fulfilled") {
    const data = res.payload;

    // 👉 New user → go signup
    if (data.actionRequired === "SIGNUP") {
      navigate(`/signup?phone=${phone}`);
      return;
    }

    // 👉 Existing user role-based redirect
    const role = data.user?.role;
    if (role === "admin") {
      navigate("/admin");
    } else {
      // both "host" and "user" go to /home (no /host route exists)
      navigate("/home");
    }
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-100 px-4">

      {/* CARD */}
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
            4FunTalk
          </h2>
        </div>

        {/* TITLE */}
        <h3 className="text-xl font-semibold text-center text-gray-700 mb-6">
          Login with OTP
        </h3>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">

            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-[#2EA7E0] transition"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl text-white font-semibold bg-gradient-to-r from-[#2EA7E0] to-[#4FACFE] hover:from-[#1C7ED6] hover:to-[#3B82F6] shadow-md hover:shadow-lg transition active:scale-[0.98]"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-3 rounded-2xl text-center tracking-[0.4em] text-lg bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-[#2EA7E0] transition"
              required
            />

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-2xl border border-blue-100 text-gray-600 hover:bg-blue-50 transition"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 rounded-2xl text-white font-semibold bg-gradient-to-r from-[#2EA7E0] to-[#4FACFE] hover:from-[#1C7ED6] hover:to-[#3B82F6] shadow-md hover:shadow-lg transition active:scale-[0.98]"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

            </div>

          </form>
        )}
      </div>
    </div>
  );
};

export default Login;