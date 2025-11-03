import axios from "axios";
import { Eye, EyeClosed } from "lucide-react"
import router from "next/router";
import { useState } from "react";


export default function LoginPage() {
  const [isHide, setIsHide] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null);


  // Make sure to clear previous error before login attempt so error message can update
  // Optionally, ensure error message in alert is correct (using {error})
  // (This also ensures `setError` sets the correct value from backend)

  // Note: Error handling is already implemented in handleLogin,
  // but the error message display below in the form is hardcoded to:
  //   <span>Error! Task failed successfully.</span>
  // Update this to display the actual error message:
  //     <span>{error}</span>
  // This way, if the backend returns a 400 with its own .error, the user sees it.

  // This 400 error means the backend (POST /api/users) is returning a 400 response,
  // usually because required fields are not set, email format is invalid, etc.
  // To help the user, show the backend error message instead of a hardcoded alert.
  // (So, in the error alert in the form below, replace the inner span content with {error} instead of the fixed text)

  // Just update the error alert rendering:
  // - Replace <span>Error! Task failed successfully.</span> with <span>{error}</span>

  const handleLogin = async () => {
    try {
      setError(null);

      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        setError("Email dan password wajib diisi");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setError("Format email tidak valid");
        return;
      }

      const response = await axios.post(
        "/api/users",
        { email: trimmedEmail, password: trimmedPassword },
        { validateStatus: () => true }
      );
      console.log(response);

      if (response.status === 200) {
        router.push("/dashboard");
      } else {
        setError(response.data?.error || "Login gagal");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data.error);
      } else {
        setError("An unknown error occurred");
      }
      console.error("Error:", error);
    }
  }

  return (
    <div className="h-screen w-screen relative flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-1/2 bg-[#0f172a]" /> {/* atas */}
        <div className="w-full h-1/2 bg-[#1C2946]" /> {/* bawah */}
      </div>

      {/* Form */}
      <div className="w-[500px] bg-black rounded-xl p-6 shadow-lg">
        {error && (
          <div role="alert" className="alert alert-error mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        <div className="py-3">
          <p className="font-bold mb-2">Email</p>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="input input-primary bg-slate-800 w-full"
          />
        </div>

        <div className="py-3">
          <p className="font-bold mb-2">Password</p>
          <div className="bg-slate-800 w-full flex hover:cursor-pointer input input-primary items-center">
            <input
              type={isHide ? 'password' : 'text'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"

            />
            <div onClick={() => setIsHide(!isHide)}>
              {isHide ? <EyeClosed /> : <Eye />}
            </div>
          </div>
        </div>

        <button onClick={handleLogin} className="btn btn-primary w-full mt-9">Login</button>

      </div>
    </div>
  );
}
