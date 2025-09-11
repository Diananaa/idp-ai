export default function LoginPage() {
  return (
    <div className="h-screen w-screen relative flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-1/2 bg-[#0f172a]" /> {/* atas */}
        <div className="w-full h-1/2 bg-[#1C2946]" /> {/* bawah */}
      </div>

      {/* Form */}
      <div className="w-[500px] bg-black rounded-xl p-6 shadow-lg">
        <div className="py-3">
          <p className="font-bold mb-2">Username</p>
          <input
            type="text"
            placeholder="Your username"
            className="input input-primary bg-slate-800 w-full"
          />
        </div>
        <div className="py-3">
          <p className="font-bold mb-2">Password</p>
          <input
            type="password"
            placeholder="******"
            className="input input-primary bg-slate-800 w-full"
          />
        </div>

        <button className="btn btn-primary w-full mt-9">Login</button>
      </div>
    </div>
  );
}
