import React, { useEffect, useState } from "react";
import { Eye, EyeClosed, LockKeyhole, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../store/authSlice";
import { useLoginEmployeeMutation } from "../store/api";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [loginEmployee, { isLoading }] = useLoginEmployeeMutation();
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (token) navigate("/admin", { replace: true });
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      const result = await loginEmployee({
        email: formData.email.trim(),
        password: formData.password,
      }).unwrap();
      const payload = result?.data || {};
      if (!payload?.token) throw new Error("Token missing in response");
      dispatch(setCredentials({ token: payload.token, employee: payload.employee }));
      navigate("/admin", { replace: true });
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Login failed. Please try again.";
      setFormError(message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-linear-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 overflow-hidden">
      
      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-8 shadow-2xl"
      >
        <h1 className="text-white text-3xl mt-10 font-semibold">Login</h1>

        <p className="text-gray-400 text-sm mt-2">Please sign in to continue</p>
        {formError ? (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {formError}
          </div>
        ) : null}

        {/* Email Field */}
        <div className="flex items-center w-full mt-6 bg-white/5 ring-1 ring-white/10 focus-within:ring-indigo-500 h-12 rounded-full overflow-hidden pl-6 gap-2 transition">
          <Mail className="text-white/70" size={16} />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full bg-transparent text-white placeholder-white/60 outline-none"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password Field */}
        <div className="flex items-center mt-4 w-full bg-white/5 ring-1 ring-white/10 focus-within:ring-indigo-500 h-12 rounded-full overflow-hidden pl-6 pr-5 gap-2 transition">
          {/* Lock Icon */}

          <LockKeyhole className="text-white/70" size={16} />

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="w-full bg-transparent text-white placeholder-white/60 outline-none"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Eye Toggle Button */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-white/60 hover:text-white transition"
          >
            {showPassword ? (
              /* Eye Off Icon */
              <EyeClosed className="text-white/70" size={16} />
            ) : (
              /* Eye Icon */
              <Eye className="text-white/70" size={16} />
            )}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="mt-4 text-left">
          <button
            type="button"
            className="text-sm text-indigo-400 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full h-11 rounded-full text-white bg-indigo-600 hover:bg-indigo-500 transition font-medium mb-10 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : "Login"}
        </button>
      </form>

      
    </div>
  );
};

export default Login;


