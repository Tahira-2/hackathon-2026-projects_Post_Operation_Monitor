<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>careIT - Humanized Precision Healthcare</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .hero-gradient {
            background: radial-gradient(circle at top right, #afefdd 0%, #f7f9fb 50%);
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "tertiary-container": "#364646",
                      "on-secondary": "#ffffff",
                      "on-tertiary": "#ffffff",
                      "tertiary-fixed-dim": "#b8cac9",
                      "surface-container": "#eceef0",
                      "error": "#ba1a1a",
                      "background": "#f7f9fb",
                      "tertiary": "#20302f",
                      "on-error": "#ffffff",
                      "inverse-surface": "#2d3133",
                      "surface-tint": "#29695b",
                      "primary-fixed": "#afefdd",
                      "on-tertiary-container": "#a2b3b3",
                      "on-surface-variant": "#3f4945",
                      "inverse-on-surface": "#eff1f3",
                      "primary-container": "#004d40",
                      "surface-dim": "#d8dadc",
                      "on-surface": "#191c1e",
                      "primary": "#00342b",
                      "on-secondary-fixed": "#001f25",
                      "on-primary": "#ffffff",
                      "on-error-container": "#93000a",
                      "surface-container-high": "#e6e8ea",
                      "on-primary-container": "#7ebdac",
                      "secondary-container": "#58e6ff",
                      "on-secondary-container": "#006573",
                      "inverse-primary": "#94d3c1",
                      "on-background": "#191c1e",
                      "on-tertiary-fixed-variant": "#3a4a49",
                      "secondary": "#006876",
                      "surface-container-lowest": "#ffffff",
                      "surface": "#f7f9fb",
                      "on-primary-fixed-variant": "#065043",
                      "on-primary-fixed": "#00201a",
                      "error-container": "#ffdad6",
                      "surface-container-highest": "#e0e3e5",
                      "secondary-fixed-dim": "#44d8f1",
                      "surface-bright": "#f7f9fb",
                      "primary-fixed-dim": "#94d3c1",
                      "outline": "#707975",
                      "on-secondary-fixed-variant": "#004e59",
                      "surface-variant": "#e0e3e5",
                      "secondary-fixed": "#a1efff",
                      "on-tertiary-fixed": "#0e1e1e",
                      "surface-container-low": "#f2f4f6",
                      "outline-variant": "#bfc9c4",
                      "tertiary-fixed": "#d4e6e5"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "md": "24px",
                      "xl": "80px",
                      "lg": "48px",
                      "xs": "4px",
                      "margin": "32px",
                      "gutter": "24px",
                      "sm": "12px",
                      "base": "8px"
              },
              "fontFamily": {
                      "headline-md": ["Manrope"],
                      "label-md": ["Manrope"],
                      "body-md": ["Manrope"],
                      "body-lg": ["Manrope"],
                      "headline-lg": ["Manrope"],
                      "display-xl": ["Manrope"],
                      "caption": ["Manrope"]
              },
              "fontSize": {
                      "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "600"}],
                      "label-md": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "600"}],
                      "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
                      "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                      "headline-lg": ["32px", {"lineHeight": "1.3", "fontWeight": "700"}],
                      "display-xl": ["48px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "800"}],
                      "caption": ["12px", {"lineHeight": "1.2", "fontWeight": "500"}]
              }
            },
          },
        }
    </script>
</head>
<body class="bg-background font-body-md text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed antialiased">
<!-- TopAppBar -->
<header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between max-w-screen-2xl mx-auto rounded-xl m-4 px-6 py-3 bg-white/60 backdrop-blur-md dark:bg-slate-900/60 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,77,64,0.1)]">
<div class="flex items-center gap-base">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">health_and_safety</span>
<h1 class="text-xl font-bold tracking-tight text-teal-900 dark:text-teal-50 font-manrope antialiased">careIT</h1>
</div>
<nav class="hidden md:flex items-center gap-lg">
<a class="text-teal-600 dark:text-teal-400 font-semibold font-manrope text-sm hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-200 px-3 py-1 rounded-lg" href="#">Home</a>
<a class="text-slate-500 dark:text-slate-400 font-manrope text-sm hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-200 px-3 py-1 rounded-lg" href="#">Services</a>
<a class="text-slate-500 dark:text-slate-400 font-manrope text-sm hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-200 px-3 py-1 rounded-lg" href="#">Providers</a>
</nav>
<div class="flex items-center gap-md">
<button class="material-symbols-outlined text-slate-500 hover:bg-white/40 p-2 rounded-full transition-all">notifications</button>
<button class="material-symbols-outlined text-slate-500 hover:bg-white/40 p-2 rounded-full transition-all">chat_bubble</button>
<div class="h-8 w-8 rounded-full overflow-hidden border border-primary/20">
<img class="h-full w-full object-cover" data-alt="Portrait of a friendly male professional in a neutral studio setting, soft lighting, clean corporate style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDns9lGLs3tAgZNE9eAAgM1BuS-HR8mtGi987lHXrDm2Seg4hQaRJBN519edh9pgH0igH5jnhrmqOk7WSTRdoQHGBrOhbWBu9JuOY8GAJPbqR-a6KHUS39SpsWFO9A7WrCbLTvpfSE3lHO95H5U-BnMVgCx4VZ2junf7eA1FSncBlxWtf8gWT-94UXl83DLjZNVkRXDAaja0wwiPGWQPOTJQiKzYV5th4Qu09JILN6yb7Wh7Oam58ZXKnTYvFhtBmyCbp3NfPXnqYI"/>
</div>
</div>
</header>
<main class="pt-32 min-h-screen hero-gradient overflow-x-hidden">
<!-- Hero Section & Bento Grid Intro -->
<section class="max-w-7xl mx-auto px-margin mb-xl">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
<!-- Text Column -->
<div class="lg:col-span-5 space-y-md">
<span class="inline-block px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-container font-label-md text-caption uppercase tracking-wider">Precision Care</span>
<h2 class="font-display-xl text-display-xl text-primary leading-tight">Your Health, Guided by Intelligence.</h2>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                        Seamlessly connect with top medical practitioners through AI-driven matching. Experience healthcare that's as precise as it is human.
                    </p>
<div class="flex flex-wrap gap-md pt-sm">
<button class="px-lg py-md bg-primary text-on-primary rounded-xl font-label-md shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center gap-sm">
                            Find a Specialist
                            <span class="material-symbols-outlined">arrow_forward</span>
</button>
<button class="px-lg py-md border-2 border-primary/10 bg-white/40 backdrop-blur-sm text-primary rounded-xl font-label-md hover:bg-white/60 active:scale-95 transition-all duration-200">
                            How it Works
                        </button>
</div>
</div>
<!-- Bento Grid Visualization -->
<div class="lg:col-span-7 grid grid-cols-6 grid-rows-6 gap-sm h-[600px]">
<div class="col-span-4 row-span-4 rounded-3xl overflow-hidden glass-panel border border-white/20 shadow-xl relative group">
<img class="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" data-alt="Modern medical consultation room with large windows, bright natural light, minimalist furniture, and high-tech digital displays on walls" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyjWqc6MMAxwY7NYIudRIBQ9-FjyZ9MKwRADXpv7mJd5dL5KbfhbrB5Ymhzg9-3EnJw559lobwCsIUG6D8onGTVCwtUGNoSMlJCet_H1a8pfg4la9dzbgTPTXrEftJczlCXKftaPBhJwOrIOGt5c3a7GYg2hTlhE_qiHJK-DIGtdhCeO2uS7WUbHZf-0nLg-3FG7Cg-I4zV-AOcL907AMzNz3j9jCW9-gAL7CEhTnukZisCZarc5O_KBkHb_UnvGJB9imxG_8aGjk"/>
<div class="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
<div class="absolute bottom-md left-md text-white">
<p class="font-label-md text-sm opacity-80">Connected Network</p>
<h3 class="font-headline-md text-white">5,000+ Specialists</h3>
</div>
</div>
<div class="col-span-2 row-span-3 rounded-3xl bg-secondary-fixed p-md flex flex-col justify-between shadow-lg">
<span class="material-symbols-outlined text-on-secondary-container text-4xl">neurology</span>
<h4 class="font-headline-md text-on-secondary-container leading-tight">AI Diagnostic Matching</h4>
</div>
<div class="col-span-2 row-span-3 rounded-3xl bg-primary-fixed p-md flex flex-col justify-between shadow-lg">
<span class="material-symbols-outlined text-on-primary-fixed text-4xl" style="font-variation-settings: 'FILL' 1;">verified_user</span>
<h4 class="font-headline-md text-on-primary-fixed leading-tight">Certified Safe</h4>
</div>
<div class="col-span-4 row-span-2 rounded-3xl glass-panel border border-white/20 p-md flex items-center gap-md shadow-md">
<div class="flex -space-x-4">
<img class="w-12 h-12 rounded-full border-2 border-white" data-alt="Close-up profile of a woman smiling, natural lighting, soft background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5WxfK0sLLQBf97SlswBzXo6A6SR3fUdIqBZRJmemPD5FrLAgarcvs11s_04DjjPoSMJyfuVrn_TPRrDuyUFKmFDBU0BszI4qwY3DMFKqHHg5GLe3ReF_6W9lpxOpUmgOqnOLVvPd5D10xF8fL9OLz01LslOAHEmlh3AXj3GTNsY1iSuKqTUrtiGcWM2o9vsWSRwB_bAjhQKs3WaIXHDmFhj8vPWq44c3g4mtqq0b5fqrMsCd_u632EN13WsQaeb91VuyZpmUC2ts"/>
<img class="w-12 h-12 rounded-full border-2 border-white" data-alt="Close-up profile of a man smiling, soft lighting, professional headshot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2Ojo9kPi-yBgagmsoPZE_L3-xVh-WUj9phHCD4VimF2G8era1Ly9_ZY5Lkre0hGgaikjcVCJHdMQA1JksyJorxh1rKZJTbzDg9DkmB_-p1o6qvKxOWhTdmtGPG8JIeMzOCluBbB6qyJH5zk55TntnXyRGaUzrI3J3o2nklVrm2Jwp0SOgVsVJ317TDmsNocn-1YpcV8EyM0ifp6Tqt1mh1pg_cTfH0vlvnnYNYcvXRmqDJhfCT3E55m1ZAD6XJYBkKAfQMufH39M"/>
<div class="w-12 h-12 rounded-full border-2 border-white bg-tertiary flex items-center justify-center text-white text-xs">+12k</div>
</div>
<div>
<p class="font-headline-md text-primary">Trust is everything</p>
<p class="font-body-md text-on-surface-variant">Joined this month</p>
</div>
</div>
</div>
</div>
</section>
<!-- Entry Portal Section -->
<section class="max-w-screen-2xl mx-auto px-margin py-xl bg-white/40 backdrop-blur-xl border-y border-white/20">
<div class="grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
<div class="space-y-lg">
<h3 class="font-display-xl text-headline-lg text-primary">Access Your Care Portal</h3>
<p class="font-body-lg text-on-surface-variant">Whether you're a patient or a provider, our portal provides the tools you need for seamless health management.</p>
<div class="space-y-md">
<div class="flex items-start gap-md p-md rounded-2xl bg-white shadow-sm border border-outline-variant/30">
<div class="p-base bg-primary-fixed rounded-lg">
<span class="material-symbols-outlined text-primary">calendar_month</span>
</div>
<div>
<h5 class="font-headline-md text-body-lg">Instant Booking</h5>
<p class="font-body-md text-on-surface-variant">Schedule consultations in under 60 seconds.</p>
</div>
</div>
<div class="flex items-start gap-md p-md rounded-2xl bg-white shadow-sm border border-outline-variant/30">
<div class="p-base bg-secondary-fixed rounded-lg">
<span class="material-symbols-outlined text-on-secondary-container">lab_profile</span>
</div>
<div>
<h5 class="font-headline-md text-body-lg">Unified Records</h5>
<p class="font-body-md text-on-surface-variant">All your medical history in one secure digital vault.</p>
</div>
</div>
</div>
</div>
<!-- Login Card -->
<div class="glass-panel p-xl rounded-[32px] border border-white shadow-2xl relative overflow-hidden">
<div class="absolute -top-24 -right-24 w-48 h-48 bg-primary-fixed blur-[100px] rounded-full opacity-50"></div>
<div class="relative z-10">
<div class="mb-lg">
<h4 class="font-display-xl text-headline-lg text-primary">Portal Login</h4>
<p class="font-body-md text-on-surface-variant">Select your portal to continue.</p>
</div>
<div class="mb-md"><h5 class="font-headline-md text-primary">Patient Login</h5><p class="text-sm text-on-surface-variant font-body-md">Manage your health</p></div><form class="space-y-md">
<div>
<label class="block font-label-md text-on-surface mb-xs">Email Address</label>
<input class="w-full px-md py-md rounded-xl bg-white border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" placeholder="name@example.com" type="email"/>
</div>
<div>
<label class="block font-label-md text-on-surface mb-xs">Password</label>
<input class="w-full px-md py-md rounded-xl bg-white border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" placeholder="••••••••" type="password"/>
</div>
<div class="flex items-center justify-between py-xs">
<label class="flex items-center gap-xs font-label-md text-sm text-on-surface-variant cursor-pointer">
<input class="rounded text-primary focus:ring-primary border-outline-variant" type="checkbox"/>
                                    Remember me
                                </label>
<a class="font-label-md text-sm text-primary hover:underline" href="#">Forgot Password?</a>
</div>
<button class="w-full py-md bg-primary text-on-primary rounded-xl font-headline-md hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md mt-md" type="submit">
                                Sign In
                            </button>
</form><div class="mt-xl pt-lg border-t border-outline-variant/30"><div class="mb-md"><h5 class="font-headline-md text-primary">Provider Login</h5><p class="text-sm text-on-surface-variant font-body-md">Access clinical tools</p></div><button class="w-full py-md border-2 border-secondary text-secondary rounded-xl font-headline-md hover:bg-secondary hover:text-on-secondary transition-all flex items-center justify-center gap-sm"><span class="material-symbols-outlined">medical_services</span>Provider Sign In</button></div><div class="mt-lg text-center"><p class="font-body-md text-on-surface-variant mb-md">New to careIT?</p><button class="w-full py-md border-2 border-primary text-primary rounded-xl font-headline-md hover:bg-primary hover:text-on-primary transition-all">Create Account</button></div>
</div>
</div>
</div>
</section>
<!-- Floating Map Preview Section -->
<section class="max-w-7xl mx-auto px-margin py-xl">
<div class="relative h-[500px] rounded-[40px] overflow-hidden shadow-2xl group border border-white/40">
<div class="absolute inset-0 bg-slate-200" data-location="San Francisco" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBRzJFe2KQmoG5zqYqhXB5pDZ4kodzQKvliMVssL91jySVmvsI-glG7Ow5IBIDgZz1ljqaZvznomQla0aXuKtI9Kp6iLurCt07iGasNoWb5H17f6uzbiPfosblkkvl0smU5vNDMx0ABduhIg7c8aSFd54JA-mVTFlPV5_qroKxP2REXER_hutwUdE4KeU976sn8xrqH0Np3CQLiRdhH0p7jsUADEihjTmKcDmJZPqGAbR9s8MpZ0NSJZ8y6lmdgs7gSwm0HnjCxKxA'); background-size: cover; background-position: center;">
<!-- Visual Mock of a Map POI -->
<div class="absolute top-1/2 left-1/3 group">
<div class="relative">
<div class="absolute -inset-4 bg-primary/20 rounded-full animate-ping"></div>
<div class="relative w-8 h-8 bg-primary border-4 border-white rounded-full shadow-lg flex items-center justify-center">
<span class="material-symbols-outlined text-white text-xs" style="font-variation-settings: 'FILL' 1;">medical_services</span>
</div>
<div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 glass-panel p-sm rounded-xl border border-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
<p class="font-label-md text-primary">Dr. Sarah Miller</p>
<p class="font-caption text-on-surface-variant">Specialist Oncology • 0.8 mi</p>
</div>
</div>
</div>
</div>
<div class="absolute top-md right-md glass-panel p-lg rounded-3xl border border-white max-w-xs shadow-xl">
<h4 class="font-headline-md text-primary mb-sm">Find Near You</h4>
<p class="font-body-md text-on-surface-variant mb-md">Our map-based interface allows you to visualize care delivery in 3D.</p>
<button class="flex items-center gap-sm text-primary font-label-md">
                        Explore Map
                        <span class="material-symbols-outlined">explore</span>
</button>
</div>
</div>
</section>
</main>
<!-- Simple Footer -->
<footer class="bg-white/40 border-t border-white/20 py-lg">
<div class="max-w-7xl mx-auto px-margin flex flex-col md:flex-row justify-between items-center gap-md">
<div class="flex items-center gap-base">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">health_and_safety</span>
<span class="text-lg font-black text-teal-950">careIT</span>
</div>
<div class="flex gap-lg">
<a class="text-slate-500 hover:text-primary transition-colors font-label-md text-sm" href="#">Privacy Policy</a>
<a class="text-slate-500 hover:text-primary transition-colors font-label-md text-sm" href="#">Terms of Service</a>
<a class="text-slate-500 hover:text-primary transition-colors font-label-md text-sm" href="#">Contact Support</a>
</div>
<p class="text-slate-400 font-caption text-xs">© 2023 careIT Healthcare Technologies. All rights reserved.</p>
</div>
</footer>
</body></html>


<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>careIT | Humanized Precision Map</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "primary-fixed-dim": "#94d3c1",
                        "tertiary-fixed": "#d4e6e5",
                        "on-primary-container": "#7ebdac",
                        "on-tertiary-fixed": "#0e1e1e",
                        "tertiary": "#20302f",
                        "surface-bright": "#f7f9fb",
                        "on-tertiary-container": "#a2b3b3",
                        "surface": "#f7f9fb",
                        "surface-container-lowest": "#ffffff",
                        "secondary-container": "#58e6ff",
                        "surface-container-highest": "#e0e3e5",
                        "on-tertiary-fixed-variant": "#3a4a49",
                        "surface-container-low": "#f2f4f6",
                        "error-container": "#ffdad6",
                        "outline-variant": "#bfc9c4",
                        "primary": "#00342b",
                        "on-primary": "#ffffff",
                        "on-secondary": "#ffffff",
                        "surface-variant": "#e0e3e5",
                        "secondary": "#006876",
                        "on-background": "#191c1e",
                        "inverse-primary": "#94d3c1",
                        "on-tertiary": "#ffffff",
                        "surface-tint": "#29695b",
                        "on-secondary-fixed-variant": "#004e59",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#44d8f1",
                        "outline": "#707975",
                        "on-surface-variant": "#3f4945",
                        "on-secondary-container": "#006573",
                        "error": "#ba1a1a",
                        "tertiary-container": "#364646",
                        "surface-dim": "#d8dadc",
                        "on-surface": "#191c1e",
                        "surface-container": "#eceef0",
                        "on-secondary-fixed": "#001f25",
                        "inverse-surface": "#2d3133",
                        "secondary-fixed": "#a1efff",
                        "inverse-on-surface": "#eff1f3",
                        "primary-container": "#004d40",
                        "on-primary-fixed": "#00201a",
                        "background": "#f7f9fb",
                        "on-error": "#ffffff",
                        "surface-container-high": "#e6e8ea",
                        "on-primary-fixed-variant": "#065043",
                        "primary-fixed": "#afefdd",
                        "tertiary-fixed-dim": "#b8cac9"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "lg": "48px",
                        "md": "24px",
                        "xl": "80px",
                        "base": "8px",
                        "gutter": "24px",
                        "xs": "4px",
                        "sm": "12px",
                        "margin": "32px"
                    },
                    "fontFamily": {
                        "label-md": ["Manrope"],
                        "caption": ["Manrope"],
                        "display-xl": ["Manrope"],
                        "body-lg": ["Manrope"],
                        "headline-md": ["Manrope"],
                        "headline-lg": ["Manrope"],
                        "body-md": ["Manrope"]
                    },
                    "fontSize": {
                        "label-md": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "600"}],
                        "caption": ["12px", {"lineHeight": "1.2", "fontWeight": "500"}],
                        "display-xl": ["48px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "800"}],
                        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "600"}],
                        "headline-lg": ["32px", {"lineHeight": "1.3", "fontWeight": "700"}],
                        "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}]
                    }
                },
            },
        }
    </script>
<style>
        .glass-panel {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .map-marker-pulse::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(0, 104, 118, 0.4);
            animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.33); }
            80%, 100% { opacity: 0; }
        }
        .perspective-map {
            perspective: 1000px;
        }
        .map-layer {
            transform: rotateX(15deg) translateY(-20px);
            transition: transform 0.5s ease-out;
        }
    </style>
</head>
<body class="bg-background font-body-md text-on-surface overflow-hidden">
<!-- TopNavBar -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-white/20 dark:border-slate-800/50 shadow-[0_20px_40px_rgba(0,77,64,0.1)]">
<div class="flex items-center gap-base">
<span class="text-2xl font-bold tracking-tight text-teal-900 dark:text-teal-50 font-display-xl">careIT</span>
</div>
<div class="hidden md:flex items-center gap-md">
<nav class="flex gap-gutter">
<a class="font-manrope text-sm font-bold border-b-2 border-teal-600 text-teal-600 dark:text-teal-400" href="#">Map</a>
<a class="font-manrope text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200" href="#">Dashboard</a>
<a class="font-manrope text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200" href="#">Approval Queue</a>
<a class="font-manrope text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200" href="#">System Logs</a>
</nav>
</div>
<div class="flex items-center gap-sm">
<button class="p-2 text-slate-500 hover:bg-teal-50/50 transition-all duration-200 rounded-full">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button class="p-2 text-slate-500 hover:bg-teal-50/50 transition-all duration-200 rounded-full">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
</button>
<div class="h-8 w-8 rounded-full bg-primary-fixed-dim overflow-hidden ml-2 shadow-sm border-2 border-white">
<img alt="Provider profile" data-alt="professional portrait of a confident female doctor in her 40s with a warm smile and white coat in a modern clinic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxpNoh4NEFhUhoC0FPt_NKhAJa_XPVIYjsyNmCqv51kHnFyeNsoARcRc8EjW2ViFK-s71itN5oV-EIxRIWIXEJ0EHubzJ2UIAddKmePuQZDX8U2EcCklqetyVGYKwn4TwDKOfcpSc6S73OKBaSWPJdlASR1SAjp9ygNckE7J7DL1zwyn0qO6E8M3abjBLZhhW1DG44_8yq5PjNXnW61FHxLnWfWvx4yPYS4Ln8g-k4xPl60M25p7r2LXW-JZqYQJAmMvcmYuUBT7k"/>
</div>
</div>
</header>
<!-- SideNavBar (Contextual Mapping: Map Active) -->
<aside class="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex flex-col p-4 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-white/20 dark:border-slate-800/50 shadow-xl hidden lg:flex">
<div class="mb-xl px-4">
<h2 class="text-xl font-black text-teal-900 dark:text-teal-50 font-manrope">careIT</h2>
<p class="text-[10px] font-manrope font-semibold uppercase tracking-wider text-slate-500">Clinical Bridge</p>
</div>
<nav class="flex flex-col gap-sm">
<a class="flex items-center gap-3 bg-teal-50/80 dark:bg-teal-900/40 text-teal-900 dark:text-teal-100 rounded-lg px-4 py-3 shadow-inner font-manrope text-xs font-semibold uppercase tracking-wider" href="#">
<span class="material-symbols-outlined" data-icon="map" data-weight="fill" style="font-variation-settings: 'FILL' 1;">map</span>
                Map
            </a>
<a class="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-3 hover:translate-x-1 hover:text-teal-600 transition-all font-manrope text-xs font-semibold uppercase tracking-wider" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                Dashboard
            </a>
<a class="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-3 hover:translate-x-1 hover:text-teal-600 transition-all font-manrope text-xs font-semibold uppercase tracking-wider" href="#">
<span class="material-symbols-outlined" data-icon="fact_check">fact_check</span>
                Approval Queue
            </a>
<a class="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-3 hover:translate-x-1 hover:text-teal-600 transition-all font-manrope text-xs font-semibold uppercase tracking-wider" href="#">
<span class="material-symbols-outlined" data-icon="terminal">terminal</span>
                System Logs
            </a>
</nav>
<div class="mt-auto p-4 glass-panel rounded-xl">
<div class="flex items-center gap-sm mb-base">
<span class="material-symbols-outlined text-secondary" data-icon="verified_user">verified_user</span>
<span class="font-label-md text-teal-900">Secure Node</span>
</div>
<p class="text-caption text-slate-500">Last synced: 2m ago</p>
</div>
</aside>
<!-- Main Canvas (Map Layer) -->
<main class="ml-0 lg:ml-64 mt-16 h-[calc(100vh-64px)] relative overflow-hidden perspective-map">
<!-- Immersive 3D Map -->
<div class="absolute inset-0 map-layer w-full h-full scale-110">
<img class="w-full h-full object-cover" data-alt="clean minimal topographic map of San Francisco bay area in soft blue and white tones with architectural highlights" data-location="San Francisco" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIHZdcPb9uxRcCuOVZbrEkS3-m41-ldTcVKDi6CT7o7d2lXCzqvyj2I78ZqqJn9Wc6QKpvm5D8PpQpGqSV0aL864RzZx6tHzyeYB8VYiFKg_yn6KBBLesRxcGGVzqnk5mqyS8X1nIVHx6S0os2WK1VB4EoC42fJNXHo5HC4MzX6yYJN1Lnthv5unkKhqrhIcbtEjrIJWBV3C9W0pGDHm_4lq4QP2utgVb2QfrDevSDc4uOfAKHmSrMB8VZx18T7mrCq-Vk9Xw0zMQ"/>
<!-- Map Markers -->
<div class="absolute top-[35%] left-[45%] group cursor-pointer">
<div class="map-marker-pulse relative flex flex-col items-center">
<div class="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shadow-[0_8px_16px_rgba(0,104,118,0.3)] ring-4 ring-white transition-transform duration-300 group-hover:scale-110">
<span class="material-symbols-outlined" data-icon="medical_services">medical_services</span>
</div>
<div class="mt-2 glass-panel px-3 py-1 rounded-full shadow-sm">
<span class="text-caption text-primary whitespace-nowrap">Dr. Aris Thorne</span>
</div>
</div>
</div>
<div class="absolute top-[50%] left-[55%] group cursor-pointer">
<div class="map-marker-pulse relative flex flex-col items-center">
<div class="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center shadow-[0_8px_16px_rgba(0,77,64,0.3)] ring-4 ring-white transition-transform duration-300 group-hover:scale-110">
<span class="material-symbols-outlined" data-icon="stethoscope">stethoscope</span>
</div>
<div class="mt-2 glass-panel px-3 py-1 rounded-full shadow-sm">
<span class="text-caption text-primary whitespace-nowrap">Dr. Elena Vance</span>
</div>
</div>
</div>
<div class="absolute top-[42%] left-[28%] group cursor-pointer">
<div class="map-marker-pulse relative flex flex-col items-center">
<div class="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shadow-[0_8px_16px_rgba(0,104,118,0.3)] ring-4 ring-white transition-transform duration-300 group-hover:scale-110">
<span class="material-symbols-outlined" data-icon="psychology">psychology</span>
</div>
<div class="mt-2 glass-panel px-3 py-1 rounded-full shadow-sm">
<span class="text-caption text-primary whitespace-nowrap">Dr. Julian Marx</span>
</div>
</div>
</div>
</div>
<!-- AI Symptom Triage Sidebar (Floating Left) -->
<div class="absolute left-6 top-6 bottom-6 w-80 z-20 flex flex-col gap-md">
<div class="glass-panel p-md rounded-xl shadow-2xl flex flex-col h-full border border-white/40">
<div class="flex items-center gap-sm mb-md">
<div class="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
<span class="material-symbols-outlined text-primary-fixed" data-icon="smart_toy">smart_toy</span>
</div>
<div>
<h3 class="font-headline-md text-primary leading-none">Symptom Triage</h3>
<p class="text-caption text-slate-500">AI-Powered Analysis</p>
</div>
</div>
<div class="flex-grow space-y-md overflow-y-auto pr-2 custom-scrollbar">
<div class="bg-surface-container-low p-sm rounded-lg border border-outline-variant/30">
<p class="text-label-md text-on-surface">Hello! How are you feeling today? Describe your symptoms and I'll find the best specialist near you.</p>
</div>
<div class="flex justify-end">
<div class="bg-secondary-fixed text-on-secondary-fixed p-sm rounded-lg shadow-sm max-w-[85%]">
<p class="text-label-md">I've been having persistent knee pain after running and mild swelling.</p>
</div>
</div>
<div class="bg-white/40 p-sm rounded-lg border-l-4 border-secondary">
<p class="text-label-md font-bold text-secondary mb-xs">Analyzing Orthopedic Markers...</p>
<p class="text-caption text-slate-600">Matching with 3 nearby Sports Medicine specialists in San Francisco.</p>
</div>
</div>
<div class="mt-auto pt-md">
<div class="relative">
<textarea class="w-full bg-white/80 border-none rounded-xl p-sm text-body-md focus:ring-2 focus:ring-secondary-fixed shadow-inner resize-none" placeholder="Type your symptoms here..." rows="3"></textarea>
<button class="absolute bottom-3 right-3 bg-primary text-white p-2 rounded-lg hover:scale-105 active:scale-95 transition-all">
<span class="material-symbols-outlined" data-icon="send">send</span>
</button>
</div>
</div>
</div>
</div>
<!-- Floating Practitioner Detail Card (Floating Right) -->
<div class="absolute right-6 top-1/2 -translate-y-1/2 w-[380px] z-20">
<div class="glass-panel p-md rounded-xl shadow-2xl border border-white/50 relative overflow-hidden">
<!-- Highlight Effect -->
<div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
<div class="flex gap-md mb-md">
<div class="w-24 h-24 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/40">
<img class="w-full h-full object-cover" data-alt="professional male doctor with glasses and a friendly demeanor in a clinical setting with soft depth of field" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxyNbZdA7KbVCD-8aQltoMYRORde7KVhlUSJWSYQTuV7eLFSUeU4gHZkKy5AP7AgiCSb8u_GzbQjKWB9IS2gBKhR1HRUUZPX5BJMne8U97gKGIWGS5D3jRx8HMpTG07sKwQY6QfqOWb4IwXNZHhL2rjZdBOmCzNhbORNksY3rxrt2-uIau_8cNVpYLU36aBWQ8tFVfqOdNN2mzBSYpRV_WbEX-kd_MalNcQgN8rTMz2whlVmPNJ9kmwbL5ixcUsKXne1ozfV6lbZ0"/>
</div>
<div class="flex flex-col justify-center">
<div class="flex items-center gap-xs mb-xs">
<span class="bg-secondary-fixed text-on-secondary-fixed text-[10px] px-2 py-0.5 rounded-full font-bold">SPORTS MEDICINE</span>
</div>
<h4 class="font-headline-md text-primary">Dr. Aris Thorne</h4>
<div class="flex items-center gap-1 text-secondary">
<span class="material-symbols-outlined text-[16px]" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-label-md">4.9 (124 reviews)</span>
</div>
</div>
</div>
<div class="space-y-sm mb-lg">
<div class="flex justify-between items-center bg-white/20 p-sm rounded-lg">
<div class="flex items-center gap-sm">
<span class="material-symbols-outlined text-slate-400" data-icon="calendar_today">calendar_today</span>
<span class="font-label-md text-on-surface">Next Available</span>
</div>
<span class="font-label-md text-primary">Today, 2:30 PM</span>
</div>
<div class="flex justify-between items-center bg-white/20 p-sm rounded-lg">
<div class="flex items-center gap-sm">
<span class="material-symbols-outlined text-slate-400" data-icon="location_on">location_on</span>
<span class="font-label-md text-on-surface">Distance</span>
</div>
<span class="font-label-md text-on-surface">1.2 miles away</span>
</div>
</div>
<div class="grid grid-cols-2 gap-sm">
<button class="bg-surface-container-highest text-primary font-label-md py-3 rounded-lg hover:bg-surface-variant transition-colors border border-outline-variant/20 shadow-sm">
                        View Profile
                    </button>
<button class="bg-primary text-white font-label-md py-3 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(0,52,43,0.3)] flex items-center justify-center gap-xs">
                        Book Discovery
                        <span class="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</div>
</div>
<!-- Floating UI Controls (Bottom Center) -->
<div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-sm z-30">
<div class="glass-panel p-xs rounded-full flex gap-xs shadow-lg">
<button class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md">
<span class="material-symbols-outlined" data-icon="near_me">near_me</span>
</button>
<button class="w-12 h-12 rounded-full bg-white text-slate-600 flex items-center justify-center hover:bg-teal-50 transition-colors shadow-md">
<span class="material-symbols-outlined" data-icon="layers">layers</span>
</button>
<button class="w-12 h-12 rounded-full bg-white text-slate-600 flex items-center justify-center hover:bg-teal-50 transition-colors shadow-md">
<span class="material-symbols-outlined" data-icon="zoom_in">zoom_in</span>
</button>
<button class="w-12 h-12 rounded-full bg-white text-slate-600 flex items-center justify-center hover:bg-teal-50 transition-colors shadow-md">
<span class="material-symbols-outlined" data-icon="zoom_out">zoom_out</span>
</button>
</div>
<div class="glass-panel px-md py-xs rounded-full shadow-lg border border-white/40">
<div class="flex items-center gap-md">
<div class="flex -space-x-2">
<div class="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
<img alt="avatar" data-alt="close-up portrait of a medical professional" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATwridpR7-NM9eXhPUQZ1heqglnsBQpULi0ERiJu1Wt1NEQD-4PChWiG0CMWosFdxE5imps4-_013marqlukFUUZFgla-2zZzJ1hP2ifXVpNuFU8G_lknBux2JLFbn-y-3C0bUgZa2lobDnwNAyMMnEvy5zZVlCSvDBCg7NlQQ5dRNQB2HksItrapygJA2HORN0gdb_VJNfR4oncNd4VONaTQWV2l_0_9H39XRpXU2RSChw936dbDKk76Er8yuOfvvpOES0vKU1gM"/>
</div>
<div class="w-8 h-8 rounded-full border-2 border-white bg-slate-300 overflow-hidden">
<img alt="avatar" data-alt="close-up portrait of a smiling surgeon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY6dK6grewsM5IsexKIDRetUrRFw2NZIxVehnQJTHGeROtW73lIN5Sch622bjNXWFSzx0VZz_B7hrCmFlWxLkPgkIluInW0y5rsiMtVuSYt1F3CnOQZdJowuy2J-1M053en5JaWH8bAU2mr18I1tZUoBO4HMgC-OJEGthpGJVQShsIW-SRnIZ3xGLFwsti_BgxYg-PZ_-CuyxhQ9MkGmLr-AirUt2fZ_jwXie5_GdiqB10WFaSkxXuzQDpE77eDmlJSEnoRoLqtW8"/>
</div>
</div>
<span class="font-label-md text-primary">12 Specialists Online</span>
<div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
</div>
</div>
</div>
</main>
<!-- Map Legend / Status (Floating Bottom Right) -->
<div class="fixed bottom-6 right-6 z-30 pointer-events-none">
<div class="glass-panel p-sm rounded-lg border border-white/40 shadow-xl pointer-events-auto">
<h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-xs">Live Traffic</h5>
<div class="flex items-center gap-sm">
<div class="h-1 flex-grow bg-slate-200 rounded-full overflow-hidden w-24">
<div class="h-full bg-primary-container w-[65%]"></div>
</div>
<span class="text-caption text-primary">Normal</span>
</div>
</div>
</div>
</body></html>

<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>careIT | Humanized Precision Map</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "primary-fixed-dim": "#94d3c1",
                        "tertiary-fixed": "#d4e6e5",
                        "on-primary-container": "#7ebdac",
                        "on-tertiary-fixed": "#0e1e1e",
                        "tertiary": "#20302f",
                        "surface-bright": "#f7f9fb",
                        "on-tertiary-container": "#a2b3b3",
                        "surface": "#f7f9fb",
                        "surface-container-lowest": "#ffffff",
                        "secondary-container": "#58e6ff",
                        "surface-container-highest": "#e0e3e5",
                        "on-tertiary-fixed-variant": "#3a4a49",
                        "surface-container-low": "#f2f4f6",
                        "error-container": "#ffdad6",
                        "outline-variant": "#bfc9c4",
                        "primary": "#00342b",
                        "on-primary": "#ffffff",
                        "on-secondary": "#ffffff",
                        "surface-variant": "#e0e3e5",
                        "secondary": "#006876",
                        "on-background": "#191c1e",
                        "inverse-primary": "#94d3c1",
                        "on-tertiary": "#ffffff",
                        "surface-tint": "#29695b",
                        "on-secondary-fixed-variant": "#004e59",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#44d8f1",
                        "outline": "#707975",
                        "on-surface-variant": "#3f4945",
                        "on-secondary-container": "#006573",
                        "error": "#ba1a1a",
                        "tertiary-container": "#364646",
                        "surface-dim": "#d8dadc",
                        "on-surface": "#191c1e",
                        "surface-container": "#eceef0",
                        "on-secondary-fixed": "#001f25",
                        "inverse-surface": "#2d3133",
                        "secondary-fixed": "#a1efff",
                        "inverse-on-surface": "#eff1f3",
                        "primary-container": "#004d40",
                        "on-primary-fixed": "#00201a",
                        "background": "#f7f9fb",
                        "on-error": "#ffffff",
                        "surface-container-high": "#e6e8ea",
                        "on-primary-fixed-variant": "#065043",
                        "primary-fixed": "#afefdd",
                        "tertiary-fixed-dim": "#b8cac9"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "lg": "48px",
                        "md": "24px",
                        "xl": "80px",
                        "base": "8px",
                        "gutter": "24px",
                        "xs": "4px",
                        "sm": "12px",
                        "margin": "32px"
                    },
                    "fontFamily": {
                        "label-md": ["Manrope"],
                        "caption": ["Manrope"],
                        "display-xl": ["Manrope"],
                        "body-lg": ["Manrope"],
                        "headline-md": ["Manrope"],
                        "headline-lg": ["Manrope"],
                        "body-md": ["Manrope"]
                    },
                    "fontSize": {
                        "label-md": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "600"}],
                        "caption": ["12px", {"lineHeight": "1.2", "fontWeight": "500"}],
                        "display-xl": ["48px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "800"}],
                        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "600"}],
                        "headline-lg": ["32px", {"lineHeight": "1.3", "fontWeight": "700"}],
                        "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}]
                    }
                },
            },
        }
    </script>
<style>
        .glass-panel {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .map-marker-pulse::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(0, 104, 118, 0.4);
            animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.33); }
            80%, 100% { opacity: 0; }
        }
        .perspective-map {
            perspective: 1000px;
        }
        .map-layer {
            transform: rotateX(15deg) translateY(-20px);
            transition: transform 0.5s ease-out;
        }
    </style>
</head>
<body class="bg-background font-body-md text-on-surface overflow-hidden">
<!-- TopNavBar -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-white/20 dark:border-slate-800/50 shadow-[0_20px_40px_rgba(0,77,64,0.1)]">
<div class="flex items-center gap-base">
<span class="text-2xl font-bold tracking-tight text-teal-900 dark:text-teal-50 font-display-xl">careIT</span>
</div>
<div class="hidden md:flex items-center gap-md">
<nav class="flex gap-gutter">
<a class="font-manrope text-sm font-bold border-b-2 border-teal-600 text-teal-600 dark:text-teal-400" href="#">Map</a>
<a class="font-manrope text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200" href="#">Dashboard</a>
<a class="font-manrope text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200" href="#">Approval Queue</a>
<a class="font-manrope text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200" href="#">System Logs</a>
</nav>
</div>
<div class="flex items-center gap-sm">
<button class="p-2 text-slate-500 hover:bg-teal-50/50 transition-all duration-200 rounded-full">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button class="p-2 text-slate-500 hover:bg-teal-50/50 transition-all duration-200 rounded-full">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
</button>
<div class="h-8 w-8 rounded-full bg-primary-fixed-dim overflow-hidden ml-2 shadow-sm border-2 border-white">
<img alt="Provider profile" data-alt="professional portrait of a confident female doctor in her 40s with a warm smile and white coat in a modern clinic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxpNoh4NEFhUhoC0FPt_NKhAJa_XPVIYjsyNmCqv51kHnFyeNsoARcRc8EjW2ViFK-s71itN5oV-EIxRIWIXEJ0EHubzJ2UIAddKmePuQZDX8U2EcCklqetyVGYKwn4TwDKOfcpSc6S73OKBaSWPJdlASR1SAjp9ygNckE7J7DL1zwyn0qO6E8M3abjBLZhhW1DG44_8yq5PjNXnW61FHxLnWfWvx4yPYS4Ln8g-k4xPl60M25p7r2LXW-JZqYQJAmMvcmYuUBT7k"/>
</div>
</div>
</header>
<!-- SideNavBar (Contextual Mapping: Map Active) -->
<aside class="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex flex-col p-4 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-white/20 dark:border-slate-800/50 shadow-xl hidden lg:flex">
<div class="mb-xl px-4">
<h2 class="text-xl font-black text-teal-900 dark:text-teal-50 font-manrope">careIT</h2>
<p class="text-[10px] font-manrope font-semibold uppercase tracking-wider text-slate-500">Clinical Bridge</p>
</div>
<nav class="flex flex-col gap-sm">
<a class="flex items-center gap-3 bg-teal-50/80 dark:bg-teal-900/40 text-teal-900 dark:text-teal-100 rounded-lg px-4 py-3 shadow-inner font-manrope text-xs font-semibold uppercase tracking-wider" href="#">
<span class="material-symbols-outlined" data-icon="map" data-weight="fill" style="font-variation-settings: 'FILL' 1;">map</span>
                Map
            </a>
<a class="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-3 hover:translate-x-1 hover:text-teal-600 transition-all font-manrope text-xs font-semibold uppercase tracking-wider" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                Dashboard
            </a>
<a class="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-3 hover:translate-x-1 hover:text-teal-600 transition-all font-manrope text-xs font-semibold uppercase tracking-wider" href="#">
<span class="material-symbols-outlined" data-icon="fact_check">fact_check</span>
                Approval Queue
            </a>
<a class="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-3 hover:translate-x-1 hover:text-teal-600 transition-all font-manrope text-xs font-semibold uppercase tracking-wider" href="#">
<span class="material-symbols-outlined" data-icon="terminal">terminal</span>
                System Logs
            </a>
</nav>
<div class="mt-auto p-4 glass-panel rounded-xl">
<div class="flex items-center gap-sm mb-base">
<span class="material-symbols-outlined text-secondary" data-icon="verified_user">verified_user</span>
<span class="font-label-md text-teal-900">Secure Node</span>
</div>
<p class="text-caption text-slate-500">Last synced: 2m ago</p>
</div>
</aside>
<!-- Main Canvas (Map Layer) -->
<main class="ml-0 lg:ml-64 mt-16 h-[calc(100vh-64px)] relative overflow-hidden perspective-map">
<!-- Immersive 3D Map -->
<div class="absolute inset-0 map-layer w-full h-full scale-110">
<img class="w-full h-full object-cover" data-alt="clean minimal topographic map of San Francisco bay area in soft blue and white tones with architectural highlights" data-location="San Francisco" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIHZdcPb9uxRcCuOVZbrEkS3-m41-ldTcVKDi6CT7o7d2lXCzqvyj2I78ZqqJn9Wc6QKpvm5D8PpQpGqSV0aL864RzZx6tHzyeYB8VYiFKg_yn6KBBLesRxcGGVzqnk5mqyS8X1nIVHx6S0os2WK1VB4EoC42fJNXHo5HC4MzX6yYJN1Lnthv5unkKhqrhIcbtEjrIJWBV3C9W0pGDHm_4lq4QP2utgVb2QfrDevSDc4uOfAKHmSrMB8VZx18T7mrCq-Vk9Xw0zMQ"/>
<!-- Map Markers -->
<div class="absolute top-[35%] left-[45%] group cursor-pointer">
<div class="map-marker-pulse relative flex flex-col items-center">
<div class="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shadow-[0_8px_16px_rgba(0,104,118,0.3)] ring-4 ring-white transition-transform duration-300 group-hover:scale-110">
<span class="material-symbols-outlined" data-icon="medical_services">medical_services</span>
</div>
<div class="mt-2 glass-panel px-3 py-1 rounded-full shadow-sm">
<span class="text-caption text-primary whitespace-nowrap">Dr. Aris Thorne</span>
</div>
</div>
</div>
<div class="absolute top-[50%] left-[55%] group cursor-pointer">
<div class="map-marker-pulse relative flex flex-col items-center">
<div class="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center shadow-[0_8px_16px_rgba(0,77,64,0.3)] ring-4 ring-white transition-transform duration-300 group-hover:scale-110">
<span class="material-symbols-outlined" data-icon="stethoscope">stethoscope</span>
</div>
<div class="mt-2 glass-panel px-3 py-1 rounded-full shadow-sm">
<span class="text-caption text-primary whitespace-nowrap">Dr. Elena Vance</span>
</div>
</div>
</div>
<div class="absolute top-[42%] left-[28%] group cursor-pointer">
<div class="map-marker-pulse relative flex flex-col items-center">
<div class="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shadow-[0_8px_16px_rgba(0,104,118,0.3)] ring-4 ring-white transition-transform duration-300 group-hover:scale-110">
<span class="material-symbols-outlined" data-icon="psychology">psychology</span>
</div>
<div class="mt-2 glass-panel px-3 py-1 rounded-full shadow-sm">
<span class="text-caption text-primary whitespace-nowrap">Dr. Julian Marx</span>
</div>
</div>
</div>
</div>
<!-- AI Symptom Triage Sidebar (Floating Left) -->
<div class="absolute left-6 top-6 bottom-6 w-80 z-20 flex flex-col gap-md">
<div class="glass-panel p-md rounded-xl shadow-2xl flex flex-col h-full border border-white/40">
<div class="flex items-center gap-sm mb-md">
<div class="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
<span class="material-symbols-outlined text-primary-fixed" data-icon="smart_toy">smart_toy</span>
</div>
<div>
<h3 class="font-headline-md text-primary leading-none">Symptom Triage</h3>
<p class="text-caption text-slate-500">AI-Powered Analysis</p>
</div>
</div>
<div class="flex-grow space-y-md overflow-y-auto pr-2 custom-scrollbar">
<div class="bg-surface-container-low p-sm rounded-lg border border-outline-variant/30">
<p class="text-label-md text-on-surface">Hello! How are you feeling today? Describe your symptoms and I'll find the best specialist near you.</p>
</div>
<div class="flex justify-end">
<div class="bg-secondary-fixed text-on-secondary-fixed p-sm rounded-lg shadow-sm max-w-[85%]">
<p class="text-label-md">I've been having persistent knee pain after running and mild swelling.</p>
</div>
</div>
<div class="bg-white/40 p-sm rounded-lg border-l-4 border-secondary">
<p class="text-label-md font-bold text-secondary mb-xs">Analyzing Orthopedic Markers...</p>
<p class="text-caption text-slate-600">Matching with 3 nearby Sports Medicine specialists in San Francisco.</p>
</div>
</div>
<div class="mt-auto pt-md">
<div class="relative">
<textarea class="w-full bg-white/80 border-none rounded-xl p-sm text-body-md focus:ring-2 focus:ring-secondary-fixed shadow-inner resize-none" placeholder="Type your symptoms here..." rows="3"></textarea>
<button class="absolute bottom-3 right-3 bg-primary text-white p-2 rounded-lg hover:scale-105 active:scale-95 transition-all">
<span class="material-symbols-outlined" data-icon="send">send</span>
</button>
</div>
</div>
</div>
</div>
<!-- Floating Practitioner Detail Card (Floating Right) -->
<div class="absolute right-6 top-1/2 -translate-y-1/2 w-[380px] z-20">
<div class="glass-panel p-md rounded-xl shadow-2xl border border-white/50 relative overflow-hidden">
<!-- Highlight Effect -->
<div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
<div class="flex gap-md mb-md">
<div class="w-24 h-24 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/40">
<img class="w-full h-full object-cover" data-alt="professional male doctor with glasses and a friendly demeanor in a clinical setting with soft depth of field" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxyNbZdA7KbVCD-8aQltoMYRORde7KVhlUSJWSYQTuV7eLFSUeU4gHZkKy5AP7AgiCSb8u_GzbQjKWB9IS2gBKhR1HRUUZPX5BJMne8U97gKGIWGS5D3jRx8HMpTG07sKwQY6QfqOWb4IwXNZHhL2rjZdBOmCzNhbORNksY3rxrt2-uIau_8cNVpYLU36aBWQ8tFVfqOdNN2mzBSYpRV_WbEX-kd_MalNcQgN8rTMz2whlVmPNJ9kmwbL5ixcUsKXne1ozfV6lbZ0"/>
</div>
<div class="flex flex-col justify-center">
<div class="flex items-center gap-xs mb-xs">
<span class="bg-secondary-fixed text-on-secondary-fixed text-[10px] px-2 py-0.5 rounded-full font-bold">SPORTS MEDICINE</span>
</div>
<h4 class="font-headline-md text-primary">Dr. Aris Thorne</h4>
<div class="flex items-center gap-1 text-secondary">
<span class="material-symbols-outlined text-[16px]" data-icon="star" data-weight="fill" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-label-md">4.9 (124 reviews)</span>
</div>
</div>
</div>
<div class="space-y-sm mb-lg">
<div class="flex justify-between items-center bg-white/20 p-sm rounded-lg">
<div class="flex items-center gap-sm">
<span class="material-symbols-outlined text-slate-400" data-icon="calendar_today">calendar_today</span>
<span class="font-label-md text-on-surface">Next Available</span>
</div>
<span class="font-label-md text-primary">Today, 2:30 PM</span>
</div>
<div class="flex justify-between items-center bg-white/20 p-sm rounded-lg">
<div class="flex items-center gap-sm">
<span class="material-symbols-outlined text-slate-400" data-icon="location_on">location_on</span>
<span class="font-label-md text-on-surface">Distance</span>
</div>
<span class="font-label-md text-on-surface">1.2 miles away</span>
</div>
</div>
<div class="grid grid-cols-2 gap-sm">
<button class="bg-surface-container-highest text-primary font-label-md py-3 rounded-lg hover:bg-surface-variant transition-colors border border-outline-variant/20 shadow-sm">
                        View Profile
                    </button>
<button class="bg-primary text-white font-label-md py-3 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(0,52,43,0.3)] flex items-center justify-center gap-xs">
                        Book Discovery
                        <span class="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</div>
</div>
<!-- Floating UI Controls (Bottom Center) -->
<div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-sm z-30">
<div class="glass-panel p-xs rounded-full flex gap-xs shadow-lg">
<button class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md">
<span class="material-symbols-outlined" data-icon="near_me">near_me</span>
</button>
<button class="w-12 h-12 rounded-full bg-white text-slate-600 flex items-center justify-center hover:bg-teal-50 transition-colors shadow-md">
<span class="material-symbols-outlined" data-icon="layers">layers</span>
</button>
<button class="w-12 h-12 rounded-full bg-white text-slate-600 flex items-center justify-center hover:bg-teal-50 transition-colors shadow-md">
<span class="material-symbols-outlined" data-icon="zoom_in">zoom_in</span>
</button>
<button class="w-12 h-12 rounded-full bg-white text-slate-600 flex items-center justify-center hover:bg-teal-50 transition-colors shadow-md">
<span class="material-symbols-outlined" data-icon="zoom_out">zoom_out</span>
</button>
</div>
<div class="glass-panel px-md py-xs rounded-full shadow-lg border border-white/40">
<div class="flex items-center gap-md">
<div class="flex -space-x-2">
<div class="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
<img alt="avatar" data-alt="close-up portrait of a medical professional" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATwridpR7-NM9eXhPUQZ1heqglnsBQpULi0ERiJu1Wt1NEQD-4PChWiG0CMWosFdxE5imps4-_013marqlukFUUZFgla-2zZzJ1hP2ifXVpNuFU8G_lknBux2JLFbn-y-3C0bUgZa2lobDnwNAyMMnEvy5zZVlCSvDBCg7NlQQ5dRNQB2HksItrapygJA2HORN0gdb_VJNfR4oncNd4VONaTQWV2l_0_9H39XRpXU2RSChw936dbDKk76Er8yuOfvvpOES0vKU1gM"/>
</div>
<div class="w-8 h-8 rounded-full border-2 border-white bg-slate-300 overflow-hidden">
<img alt="avatar" data-alt="close-up portrait of a smiling surgeon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY6dK6grewsM5IsexKIDRetUrRFw2NZIxVehnQJTHGeROtW73lIN5Sch622bjNXWFSzx0VZz_B7hrCmFlWxLkPgkIluInW0y5rsiMtVuSYt1F3CnOQZdJowuy2J-1M053en5JaWH8bAU2mr18I1tZUoBO4HMgC-OJEGthpGJVQShsIW-SRnIZ3xGLFwsti_BgxYg-PZ_-CuyxhQ9MkGmLr-AirUt2fZ_jwXie5_GdiqB10WFaSkxXuzQDpE77eDmlJSEnoRoLqtW8"/>
</div>
</div>
<span class="font-label-md text-primary">12 Specialists Online</span>
<div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
</div>
</div>
</div>
</main>
<!-- Map Legend / Status (Floating Bottom Right) -->
<div class="fixed bottom-6 right-6 z-30 pointer-events-none">
<div class="glass-panel p-sm rounded-lg border border-white/40 shadow-xl pointer-events-auto">
<h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-xs">Live Traffic</h5>
<div class="flex items-center gap-sm">
<div class="h-1 flex-grow bg-slate-200 rounded-full overflow-hidden w-24">
<div class="h-full bg-primary-container w-[65%]"></div>
</div>
<span class="text-caption text-primary">Normal</span>
</div>
</div>
</div>
</body></html>

<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>careIT - Patient Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "tertiary-container": "#364646",
                    "on-secondary": "#ffffff",
                    "on-tertiary": "#ffffff",
                    "tertiary-fixed-dim": "#b8cac9",
                    "surface-container": "#eceef0",
                    "error": "#ba1a1a",
                    "background": "#f7f9fb",
                    "tertiary": "#20302f",
                    "on-error": "#ffffff",
                    "inverse-surface": "#2d3133",
                    "surface-tint": "#29695b",
                    "primary-fixed": "#afefdd",
                    "on-tertiary-container": "#a2b3b3",
                    "on-surface-variant": "#3f4945",
                    "inverse-on-surface": "#eff1f3",
                    "primary-container": "#004d40",
                    "surface-dim": "#d8dadc",
                    "on-surface": "#191c1e",
                    "primary": "#00342b",
                    "on-secondary-fixed": "#001f25",
                    "on-primary": "#ffffff",
                    "on-error-container": "#93000a",
                    "surface-container-high": "#e6e8ea",
                    "on-primary-container": "#7ebdac",
                    "secondary-container": "#58e6ff",
                    "on-secondary-container": "#006573",
                    "inverse-primary": "#94d3c1",
                    "on-background": "#191c1e",
                    "on-tertiary-fixed-variant": "#3a4a49",
                    "secondary": "#006876",
                    "surface-container-lowest": "#ffffff",
                    "surface": "#f7f9fb",
                    "on-primary-fixed-variant": "#065043",
                    "on-primary-fixed": "#00201a",
                    "error-container": "#ffdad6",
                    "surface-container-highest": "#e0e3e5",
                    "secondary-fixed-dim": "#44d8f1",
                    "surface-bright": "#f7f9fb",
                    "primary-fixed-dim": "#94d3c1",
                    "outline": "#707975",
                    "on-secondary-fixed-variant": "#004e59",
                    "surface-variant": "#e0e3e5",
                    "secondary-fixed": "#a1efff",
                    "on-tertiary-fixed": "#0e1e1e",
                    "surface-container-low": "#f2f4f6",
                    "outline-variant": "#bfc9c4",
                    "tertiary-fixed": "#d4e6e5"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "md": "24px",
                    "xl": "80px",
                    "lg": "48px",
                    "xs": "4px",
                    "margin": "32px",
                    "gutter": "24px",
                    "sm": "12px",
                    "base": "8px"
            },
            "fontFamily": {
                    "headline-md": ["Manrope"],
                    "label-md": ["Manrope"],
                    "body-md": ["Manrope"],
                    "body-lg": ["Manrope"],
                    "headline-lg": ["Manrope"],
                    "display-xl": ["Manrope"],
                    "caption": ["Manrope"]
            },
            "fontSize": {
                    "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "600"}],
                    "label-md": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "600"}],
                    "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
                    "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                    "headline-lg": ["32px", {"lineHeight": "1.3", "fontWeight": "700"}],
                    "display-xl": ["48px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "800"}],
                    "caption": ["12px", {"lineHeight": "1.2", "fontWeight": "500"}]
            }
          },
        },
      }
    </script>
<style>.material-symbols-outlined {
    font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24
    }
.glass-card {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2)
    }
.map-bg {
    background-image: url(https://lh3.googleusercontent.com/aida-public/AB6AXuC2gVV1ILjAiiohm4LnMCVEAMLTMoc6SFSgoypRVnLJQ1ehV3uJvbf2lhalVSylAmtMDkOuJyGiVmnH01pxB1x5n3Nnb3ZMbJiP4ufGXSoEqDgaZwffS5Nn4uIw3TVDgD2TikCVH5zgKHHtYrcAxR9MwtYuVjiLXERAPIIX0h1A-u4YviR7DxN0fZ4W6R8HhjDXV3IAVD_oNkhoefVybe7ynjXXjyBFzW0GujmeEMOdu9p2gCJw59giKKjBG76P6_BlXOOLb_L9qXs);
    background-size: cover;
    background-position: center;
    opacity: 0.15;
    filter: grayscale(100%) contrast(120%)
    }</style>
</head>
<body class="bg-background font-body-md text-on-background min-h-screen overflow-x-hidden">
<!-- Background Map Layer -->
<div class="fixed inset-0 map-bg z-0" data-location="San Francisco" style=""></div>
<!-- TopAppBar -->
<header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between max-w-screen-2xl mx-auto rounded-xl m-4 px-6 py-3 bg-white/60 backdrop-blur-md dark:bg-slate-900/60 text-teal-900 dark:text-teal-50 font-manrope antialiased border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,77,64,0.1)]">
<div class="flex items-center gap-base">
<span class="text-xl font-bold tracking-tight text-teal-900 dark:text-teal-50">careIT</span>
</div>
<div class="hidden md:flex items-center gap-md">
<nav class="flex items-center gap-md">
<a class="text-teal-600 dark:text-teal-400 font-semibold text-label-md" href="#">Dashboard</a>
<a class="text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-200 px-3 py-1 rounded-lg text-label-md" href="#">Map View</a>
<a class="text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-200 px-3 py-1 rounded-lg text-label-md" href="#">Consultations</a>
</nav>
<div class="h-6 w-px bg-outline-variant mx-2"></div>
<div class="flex items-center gap-base">
<button class="p-2 rounded-full hover:bg-white/40 transition-all active:scale-95">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button class="p-2 rounded-full hover:bg-white/40 transition-all active:scale-95">
<span class="material-symbols-outlined" data-icon="chat_bubble">chat_bubble</span>
</button>
<button class="p-2 rounded-full hover:bg-white/40 transition-all active:scale-95">
<span class="material-symbols-outlined" data-icon="account_circle">account_circle</span>
</button>
</div>
</div>
</header>
<!-- SideNavBar (Desktop Only) -->
<aside class="fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col py-8 px-4 bg-white/70 backdrop-blur-xl dark:bg-slate-900/70 text-teal-800 dark:text-teal-300 font-manrope text-sm font-medium rounded-2xl m-4 w-64 h-[calc(100vh-2rem)] border-r border-white/20 dark:border-white/10 shadow-[20px_0_40px_rgba(0,77,64,0.05)] mt-24">
<div class="px-4 mb-xl">
<p class="text-xs uppercase tracking-widest text-slate-400 font-bold mb-xs">Patient Portal</p>
<h2 class="text-lg font-black text-teal-950 dark:text-teal-50">careIT</h2>
</div>
<nav class="flex-1 space-y-base">
<a class="flex items-center gap-base px-4 py-3 bg-teal-50/50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-200 border-r-4 border-teal-600 font-semibold group transition-transform duration-300" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                Dashboard
            </a>
<a class="flex items-center gap-base px-4 py-3 text-slate-500 hover:text-teal-600 dark:text-slate-400 hover:translate-x-1 transition-transform duration-300 group" href="#">
<span class="material-symbols-outlined" data-icon="map">map</span>
                Map View
            </a>
<a class="flex items-center gap-base px-4 py-3 text-slate-500 hover:text-teal-600 dark:text-slate-400 hover:translate-x-1 transition-transform duration-300 group" href="#">
<span class="material-symbols-outlined" data-icon="videocam">videocam</span>
                Consultations
            </a>
<a class="flex items-center gap-base px-4 py-3 text-slate-500 hover:text-teal-600 dark:text-slate-400 hover:translate-x-1 transition-transform duration-300 group" href="#">
<span class="material-symbols-outlined" data-icon="description">description</span>
                Records
            </a>
</nav>
<div class="mt-auto space-y-base">
<button class="w-full py-4 px-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary-container/20 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-xs">
<span class="material-symbols-outlined text-sm" data-icon="add">add</span>
                Book Appointment
            </button>
<div class="h-px bg-outline-variant/20 my-md"></div>
<a class="flex items-center gap-base px-4 py-2 text-slate-500 hover:text-teal-600 text-sm transition-all" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
                Settings
            </a>
<a class="flex items-center gap-base px-4 py-2 text-slate-500 hover:text-teal-600 text-sm transition-all" href="#">
<span class="material-symbols-outlined" data-icon="help">help</span>
                Support
            </a>
</div>
</aside>
<!-- Main Content Canvas -->
<main class="relative z-10 lg:ml-80 pt-32 px-margin pb-xl max-w-7xl">
<!-- Welcome Header -->
<header class="mb-lg">
<h1 class="font-display-xl text-display-xl text-primary mb-xs">Welcome back, Sarah</h1>
<p class="font-body-lg text-body-lg text-outline">Your health journey is looking clear today. You have one upcoming call.</p>
</header>
<!-- Bento Grid Layout -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
<!-- Hero Appointment Card -->
<section class="lg:col-span-8 glass-card rounded-2xl p-md shadow-xl border-l-4 border-l-secondary-container">
<div class="flex justify-between items-start mb-md">
<div>
<span class="bg-secondary-fixed text-on-secondary-container px-3 py-1 rounded-full text-caption font-bold mb-base inline-block">UPCOMING CONSULTATION</span>
<h2 class="font-headline-lg text-headline-lg text-primary">Dr. Elena Rodriguez</h2>
<p class="text-outline font-label-md">Specialist: Cardiovascular Health</p>
</div>
<div class="text-right">
<div class="text-headline-md font-bold text-secondary">Today, 2:30 PM</div>
<div class="text-caption text-outline">Starts in 45 minutes</div>
</div>
</div>
<div class="flex flex-wrap gap-md items-center mt-lg pt-md border-t border-outline-variant/30">
<button class="bg-primary text-on-primary px-lg py-3 rounded-xl font-bold flex items-center gap-xs hover:shadow-lg transition-all active:scale-95">
<span class="material-symbols-outlined" data-icon="videocam" style="font-variation-settings: 'FILL' 1;">videocam</span>
                        Join Meeting
                    </button>
<button class="px-md py-3 border border-outline rounded-xl font-bold text-primary hover:bg-white/50 transition-all">
                        Reschedule
                    </button>
</div>
</section>
<!-- Quick AI Assistant Card -->
<section class="lg:col-span-4 glass-card rounded-2xl p-md flex flex-col justify-between bg-primary-container text-on-primary-container relative overflow-hidden group">
<div class="absolute -right-8 -top-8 w-32 h-32 bg-secondary-container/20 rounded-full blur-3xl group-hover:bg-secondary-container/40 transition-all duration-700"></div>
<div>
<div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-md">
<span class="material-symbols-outlined text-white" data-icon="smart_toy">smart_toy</span>
</div>
<h3 class="font-headline-md text-headline-md text-white">careIT AI</h3>
<p class="text-on-primary-container/80 text-body-md mt-base">Ask anything about your clinical records or symptom history.</p>
</div>
<div class="mt-lg">
<div class="relative">
<input class="w-full bg-white/10 border-none rounded-xl py-3 px-4 text-white placeholder-white/40 focus:ring-2 focus:ring-secondary-container" placeholder="Type a question..." type="text"/>
<button class="absolute right-2 top-1.5 p-1.5 bg-secondary-container text-on-secondary-container rounded-lg">
<span class="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</div>
</section>
<!-- Medical SOAP Summaries - Bento Section -->
<section class="lg:col-span-12 mt-md">
<div class="flex items-center justify-between mb-md">
<h2 class="font-headline-md text-headline-md text-primary flex items-center gap-xs">
<span class="material-symbols-outlined" data-icon="history_edu">history_edu</span>
                        Recent Clinical Summaries
                    </h2>
<a class="text-secondary font-bold text-label-md hover:underline" href="#">View All Records</a>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
<!-- SOAP Record 1 -->
<article class="glass-card rounded-2xl p-md border-t-4 border-t-primary-container group hover:translate-y-[-4px] transition-all duration-300">
<div class="flex justify-between items-center mb-base">
<span class="text-caption font-bold text-outline uppercase tracking-wider">Oct 12, 2023</span>
<span class="material-symbols-outlined text-primary-container/40" data-icon="auto_awesome">auto_awesome</span>
</div>
<h4 class="font-headline-md text-headline-md text-primary mb-base">General Checkup</h4>
<div class="space-y-sm">
<div class="p-base bg-white/40 rounded-lg">
<span class="text-[10px] font-black text-teal-800 block mb-xs">SUBJECTIVE</span>
<p class="text-caption text-on-surface line-clamp-2">Patient reported mild fatigue and recurring headaches during morning hours...</p>
</div>
<div class="p-base bg-white/40 rounded-lg">
<span class="text-[10px] font-black text-teal-800 block mb-xs">PLAN</span>
<p class="text-caption text-on-surface line-clamp-2">Increase water intake to 3L/day. Follow up with blood panel results next week...</p>
</div>
</div>
<button class="mt-md w-full py-2 bg-white/60 border border-outline-variant/30 rounded-lg text-label-md text-primary font-bold group-hover:bg-primary group-hover:text-on-primary transition-all">Full Record Details</button>
</article>
<!-- SOAP Record 2 -->
<article class="glass-card rounded-2xl p-md border-t-4 border-t-secondary-container group hover:translate-y-[-4px] transition-all duration-300">
<div class="flex justify-between items-center mb-base">
<span class="text-caption font-bold text-outline uppercase tracking-wider">Sep 28, 2023</span>
<span class="material-symbols-outlined text-secondary-container/40" data-icon="auto_awesome">auto_awesome</span>
</div>
<h4 class="font-headline-md text-headline-md text-primary mb-base">Physiotherapy session</h4>
<div class="space-y-sm">
<div class="p-base bg-white/40 rounded-lg">
<span class="text-[10px] font-black text-secondary-container block mb-xs">OBJECTIVE</span>
<p class="text-caption text-on-surface line-clamp-2">Range of motion in left shoulder improved by 15%. Inflammation significantly reduced...</p>
</div>
<div class="p-base bg-white/40 rounded-lg">
<span class="text-[10px] font-black text-secondary-container block mb-xs">ASSESSMENT</span>
<p class="text-caption text-on-surface line-clamp-2">Consistent recovery trajectory. Tendonitis resolving as expected with exercise...</p>
</div>
</div>
<button class="mt-md w-full py-2 bg-white/60 border border-outline-variant/30 rounded-lg text-label-md text-primary font-bold group-hover:bg-primary group-hover:text-on-primary transition-all">Full Record Details</button>
</article>
<!-- Empty State / Add Record -->
<div class="rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-md text-center bg-surface-container/20 group hover:bg-white/40 transition-all cursor-pointer">
<div class="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mb-md group-hover:scale-110 transition-transform shadow-sm">
<span class="material-symbols-outlined text-outline" data-icon="upload_file">upload_file</span>
</div>
<h4 class="font-label-md text-label-md text-primary">Import New Recording</h4>
<p class="text-caption text-outline mt-xs px-md">Upload a consultation video to generate AI SOAP notes.</p>
</div>
</div>
</section>
<!-- Clinical Vitals Tracking -->
<section class="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-gutter mt-md">
<div class="glass-card rounded-2xl p-md flex items-center gap-md">
<div class="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center">
<span class="material-symbols-outlined text-error" data-icon="favorite" style="font-variation-settings: 'FILL' 1;">favorite</span>
</div>
<div>
<div class="text-caption text-outline font-bold">Heart Rate</div>
<div class="text-headline-md text-primary">72 <span class="text-caption">BPM</span></div>
</div>
</div>
<div class="glass-card rounded-2xl p-md flex items-center gap-md">
<div class="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center">
<span class="material-symbols-outlined text-secondary" data-icon="air" style="font-variation-settings: 'FILL' 1;">air</span>
</div>
<div>
<div class="text-caption text-outline font-bold">SpO2</div>
<div class="text-headline-md text-primary">98 <span class="text-caption">%</span></div>
</div>
</div>
<div class="glass-card rounded-2xl p-md flex items-center gap-md">
<div class="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center">
<span class="material-symbols-outlined text-primary" data-icon="blood_pressure" style="font-variation-settings: 'FILL' 1;">blood_pressure</span>
</div>
<div>
<div class="text-caption text-outline font-bold">Blood Pressure</div>
<div class="text-headline-md text-primary">120/80</div>
</div>
</div>
<div class="glass-card rounded-2xl p-md flex items-center gap-md">
<div class="w-12 h-12 rounded-full bg-tertiary-fixed/40 flex items-center justify-center">
<span class="material-symbols-outlined text-tertiary" data-icon="scale" style="font-variation-settings: 'FILL' 1;">scale</span>
</div>
<div>
<div class="text-caption text-outline font-bold">Weight</div>
<div class="text-headline-md text-primary">164 <span class="text-caption">lbs</span></div>
</div>
</div>
</section>
</div>
</main>
<!-- FAB for quick action -->
<button class="fixed bottom-margin right-margin z-50 w-16 h-16 bg-primary text-on-primary rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all lg:hidden">
<span class="material-symbols-outlined" data-icon="add">add</span>
</button>
</body></html>