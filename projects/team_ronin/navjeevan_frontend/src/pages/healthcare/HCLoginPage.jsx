import HCLoginForm from '../../components/healthcare/HCLoginForm';

export default function HCLoginPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-[9rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[35%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      <div className="mx-auto flex min-h-[80vh] w-full max-w-4xl items-center justify-center">
        <HCLoginForm />
      </div>
    </div>
  );
}
