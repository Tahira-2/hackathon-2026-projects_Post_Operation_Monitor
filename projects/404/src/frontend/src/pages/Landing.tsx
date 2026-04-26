import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
	ArrowRight,
	BellRing,
	ClipboardList,
	Menu,
	ShieldCheck,
	Sparkles,
	Stethoscope,
	UserRound,
	X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const HERO_VIDEO_URL = "/hero.mp4"
const DOCTOR_IMAGE_URL = "/doctor.png"

const navItems = [
  { name: "Home", path: "/" },
	{ name: "Solutions", path: "/services" },
  { name: "About", path: "/about" },
]

export function Landing() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [isScrolled, setIsScrolled] = useState(false)
	const location = useLocation()

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 36)
		}

		handleScroll()
		window.addEventListener("scroll", handleScroll)

		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	return (
		<div className="min-h-screen bg-black text-white">
			<header
				className={cn(
					"fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
					isScrolled
						? "border-emerald-900/10 bg-white/72 backdrop-blur-md"
						: "border-transparent bg-transparent"
				)}
			>
				<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8 lg:px-10">
					<Link to="/" className={cn("flex items-center gap-2 transition-opacity hover:opacity-80", isScrolled ? "text-emerald-900" : "text-white")}>
						<div className={cn("flex h-9 w-9 items-center justify-center rounded-full backdrop-blur", isScrolled ? "border border-emerald-900/15 bg-emerald-50" : "border border-white/15 bg-white/10")}>
							<span className="text-sm font-semibold">H</span>
						</div>
						<span className="text-lg font-semibold tracking-tight">HealthCore</span>
					</Link>

					<nav className="hidden md:flex items-center gap-6">
						{navItems.map((item) => {
							const isActive = location.pathname === item.path

							return (
								<Link
									key={item.path}
									to={item.path}
									className={cn(
										"relative px-1 py-2 text-[15px] font-semibold transition-colors duration-200",
										isActive
											? isScrolled ? "text-emerald-900" : "text-white"
											: isScrolled ? "text-slate-700 hover:text-emerald-900" : "text-white/80 hover:text-white"
									)}
								>
									{item.name}
									{isActive && <span className={cn("absolute -bottom-1 left-0 h-0.5 w-full rounded-full", isScrolled ? "bg-emerald-700" : "bg-white")} />}
								</Link>
							)
						})}
					</nav>



					<div className="hidden md:flex items-center gap-3">
						<Link to="/patient/login" className={cn("text-sm font-semibold transition-colors", isScrolled ? "text-slate-700 hover:text-emerald-900" : "text-white/80 hover:text-white")}>
							Log in
						</Link>
						<Button asChild className={cn("h-10 rounded-xl px-5", isScrolled ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-white text-[#1a3321] hover:bg-white/90")}>
							<Link to="/patient/signup">Get Started</Link>
						</Button>
					</div>

					<Button
						variant="ghost"
						size="icon"
						className={cn("md:hidden hover:bg-white/10 hover:text-white", isScrolled ? "text-slate-700" : "text-white")}
						onClick={() => setMobileMenuOpen((value) => !value)}
					>
						{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
					</Button>
				</div>

				{mobileMenuOpen && (
					<div className="border-t border-emerald-900/10 bg-white/95 px-4 py-4 backdrop-blur-md md:hidden">
						<div className="flex flex-col gap-2">
							{navItems.map((item) => (
								<Link
									key={item.path}
									to={item.path}
									className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
									onClick={() => setMobileMenuOpen(false)}
								>
									{item.name}
								</Link>
							))}
							<div className="my-2 h-px bg-emerald-900/10" />
							<Link
								to="/patient/login"
								className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
								onClick={() => setMobileMenuOpen(false)}
							>
								Log in
							</Link>
							<Button asChild className="mt-2 h-11 rounded-full bg-emerald-700 px-5 text-white hover:bg-emerald-800">
								<Link to="/patient/signup" onClick={() => setMobileMenuOpen(false)}>
									Get Started
								</Link>
							</Button>
						</div>
					</div>
				)}
			</header>

			<main className="relative overflow-hidden">
				<section className="relative min-h-screen overflow-hidden">
					<video
						className="absolute inset-0 h-full w-full object-cover"
						src={HERO_VIDEO_URL}
						autoPlay
						muted
						loop
						playsInline
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-[#123420]/70 via-[#173f29]/45 to-[#273f1e]/20" />
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(246,229,133,0.28),transparent_34%)]" />
					<div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16 md:px-10 lg:px-12">
						<div className="max-w-3xl space-y-8">
							<p className="text-xs font-medium uppercase tracking-[0.3em] text-white/70">Beyond visit summaries</p>
							<h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
								Understand Better,
								<br />
								<span className="text-[#7bd08e]">Act Sooner</span>
							</h1>
							<p className="max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
								HealthCore transforms clinical conversations into structured, patient-friendly care workflows that improve understanding, treatment adherence, and long-term care navigation.
							</p>

							<div className="flex flex-wrap gap-4">
								<Button asChild size="lg" className="h-12 rounded-xl bg-white px-7 text-[#1a3321] hover:bg-white/90">
									<Link to="/patient/signup">Start Patient Journey</Link>
								</Button>
								<Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-white/50 bg-white/5 px-7 text-white backdrop-blur hover:bg-white/15 hover:text-white">
									<Link to="/physician/login">
										Clinician Login <ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							</div>

							<div className="flex flex-wrap gap-3 pt-2 text-sm text-white/80">
								<span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">Post-Consultation Care Navigator</span>
								<span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">Patient Action Workflow Engine</span>
								<span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">Consultation-to-Care Execution</span>
							</div>


						</div>
					</div>
				</section>

				<section className="relative z-10 bg-[#f7fbf8] px-6 py-20 md:px-10 lg:px-12">
					<div className="mx-auto max-w-7xl">
						<p className="text-xs font-medium uppercase tracking-[0.28em] text-emerald-700">How It Works</p>
						<h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
							From consultation to action in three clear steps.
						</h2>
						<div className="mt-10 grid gap-4 md:grid-cols-3">
							<div className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
								<ClipboardList className="h-6 w-6 text-emerald-700" />
								<h3 className="mt-4 text-lg font-semibold text-slate-900">Capture Context</h3>
								<p className="mt-2 text-sm leading-relaxed text-slate-600">
									Turn doctor-patient discussions into structured clinical context that patients can understand.
								</p>
							</div>
							<div className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
								<Sparkles className="h-6 w-6 text-emerald-700" />
								<h3 className="mt-4 text-lg font-semibold text-slate-900">Generate Care Tasks</h3>
								<p className="mt-2 text-sm leading-relaxed text-slate-600">
									Automatically map next steps: medication routines, tests, follow-ups, and warning signs.
								</p>
							</div>
							<div className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
								<BellRing className="h-6 w-6 text-emerald-700" />
								<h3 className="mt-4 text-lg font-semibold text-slate-900">Guide Execution</h3>
								<p className="mt-2 text-sm leading-relaxed text-slate-600">
									Deliver reminders, check-ins, and progress visibility for patients and clinical teams.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="relative z-10 bg-[#0a1c13] px-6 py-20 md:px-10 lg:px-12">
					<div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
						<div className="rounded-2xl border border-white/10 bg-[#0f2a1d] p-6">
							<UserRound className="h-6 w-6 text-[#9be2b4]" />
							<h3 className="mt-4 text-xl font-semibold text-white">For Patients</h3>
							<p className="mt-2 text-sm leading-relaxed text-white/75">
								Understand exactly what to do after your appointment and why each step matters.
							</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-[#0f2a1d] p-6">
							<Stethoscope className="h-6 w-6 text-[#9be2b4]" />
							<h3 className="mt-4 text-xl font-semibold text-white">For Clinicians</h3>
							<p className="mt-2 text-sm leading-relaxed text-white/75">
								Improve adherence by converting guidance into trackable workflows patients can follow.
							</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-[#0f2a1d] p-6">
							<ShieldCheck className="h-6 w-6 text-[#9be2b4]" />
							<h3 className="mt-4 text-xl font-semibold text-white">For Admins</h3>
							<p className="mt-2 text-sm leading-relaxed text-white/75">
								Monitor pathway completion and quality outcomes with a system designed for care execution.
							</p>
						</div>
					</div>
				</section>

				<section className="relative z-10 bg-[#08150f] px-6 pb-20 pt-12 md:px-10 lg:px-12">
					<div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-gradient-to-r from-[#103323] to-[#1a5138] p-8 md:p-10">
						<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
							<div className="max-w-2xl">
								<p className="text-xs font-medium uppercase tracking-[0.28em] text-[#c8f3d9]">Ready To Launch</p>
								<h3 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
									Move from "what happened" to "what happens next".
								</h3>
							</div>
							<div className="flex flex-wrap gap-3">
								<Button asChild size="lg" className="h-11 rounded-xl bg-white px-6 text-[#123925] hover:bg-white/90">
									<Link to="/patient/signup">Create Account</Link>
								</Button>
								<Button asChild size="lg" variant="outline" className="h-11 rounded-xl border-white/40 bg-white/10 px-6 text-white hover:bg-white/20 hover:text-white">
									<Link to="/patient/login">Open Portal</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>

				<section className="relative z-10 bg-white px-6 py-20 md:px-10 lg:px-12">
					<div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
						<div className="order-2 space-y-8 md:order-1 animate-in fade-in slide-in-from-left-5 duration-700">
							<span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
								Your Care Companion
							</span>
							<h3 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-tight text-slate-900 md:text-6xl">
								Align Your Care with Clear Next Steps
							</h3>
							<p className="max-w-lg text-lg leading-relaxed text-slate-600">
								From medication reminders to follow-up plans, HealthCore gives patients a clear path after every consultation. No clutter. Just action you can trust.
							</p>
							<div className="flex flex-wrap gap-4 pt-2">
								<Button asChild className="h-14 rounded-2xl bg-slate-900 px-7 text-white shadow-[0_18px_40px_rgba(15,23,42,0.15)] hover:bg-slate-800">
									<Link to="/patient/signup">Start Patient Journey</Link>
								</Button>
								<Button asChild variant="outline" className="h-14 rounded-2xl border-slate-300 bg-white px-7 text-slate-900 hover:bg-slate-50">
									<Link to="/patient/login">Open Portal</Link>
								</Button>
							</div>
						</div>

						<div className="order-1 mx-auto w-full max-w-2xl animate-in fade-in slide-in-from-right-5 duration-700 md:order-2">
							<div className="relative overflow-hidden rounded-[2.25rem] border border-amber-100 bg-[#fffaf3] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] md:p-10">
								<div className="absolute inset-x-8 top-8 h-24 rounded-full bg-white/60 blur-3xl" />
								<img
									src={DOCTOR_IMAGE_URL}
									alt="HealthCore digital care assistant"
									className="relative z-10 mx-auto h-auto w-full max-w-[360px] transition-transform duration-700 ease-out hover:scale-105"
								/>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	)
}
