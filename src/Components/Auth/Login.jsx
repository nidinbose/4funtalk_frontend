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
    if (data.actionRequired === "SIGNUP") {
      navigate(`/signup?phone=${phone}`);
      return;
    }

    const role = data.user?.role;
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  }
};
return (
  <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-white">

    {/* BACKGROUND */}
    <div className="absolute inset-0">
  



</div>

   
    {/* CARD */}
    <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl shadow-sm rounded-3xl p-8 text-center border border-white/40">

      {/* LOGO */}
      {/* <div className="flex justify-center mb-4">
        <img 
          src="/Images/FFL.svg"
          alt="Logo"
          className="w-20 h-20 object-contain"
        />
      </div> */}

      {/* TITLE */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Welcome! get started? 👋
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        Sign up with your mobile number
      </p>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">

          <div className="flex items-center border border-blue-300 focus-within:border-blue-500 rounded-full px-4 py-3 bg-white transition">
            <span className="text-gray-700 font-medium mr-2">+91</span>

            <input
              type="tel"
              placeholder="Enter your number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 outline-none bg-transparent text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 active:scale-[0.98] transition"
          >
            {loading ? "Sending..." : "Continue"}
          </button>

        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full text-center tracking-[0.4em] text-lg border border-blue-300 focus:border-blue-500 rounded-full py-3 bg-white outline-none transition"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-blue-400 text-white font-semibold hover:bg-blue-500 active:scale-[0.98] transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm text-gray-500 hover:underline"
          >
            ← Back
          </button>

        </form>
      )}

      {/* FOOTER */}
      <p className="text-xs text-gray-400 mt-6">
        By signing up, you agree to our Terms & Privacy Policy.
      </p>

    </div>
  </div>
);
};

export default Login;