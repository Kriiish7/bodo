import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { LocalWhiteboardCanvas } from '../components/canvas/LocalWhiteboardCanvas'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { ArrowRight, Zap, Shield, Sparkles, Sun, Moon } from 'lucide-react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { data: session, isPending } = authClient.useSession()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const [isDark, setIsDark] = useState(true)

  // Theme tokens — all driven by isDark
  const t = isDark ? {
    bg: 'bg-[#0a0a0a]',
    text: 'text-slate-50',
    selection: 'selection:bg-red-500/30',
    navBg: 'bg-[#0a0a0a]/60',
    navBorder: 'border-white/5',
    logoText: 'text-white',
    ghostBtn: 'text-slate-400 hover:text-white hover:bg-white/5',
    heading: 'text-white',
    body: 'text-slate-400',
    badgeBg: 'bg-red-950/40 border-red-800/30 text-red-300',
    badgeShadow: 'shadow-[0_0_20px_rgba(220,38,38,0.1)]',
    cardBg: 'bg-white/3 border-white/6 hover:border-red-900/30 hover:bg-white/6',
    cardIcon: 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20',
    cardTitle: 'text-white',
    cardBody: 'text-slate-500',
    canvasBorder: 'border-red-900/20 ring-white/5 bg-[#0a0a0a]',
    canvasChrome: 'bg-zinc-900/90 border-white/5 text-zinc-500',
    footerBorder: 'border-white/5',
    footerText: 'text-zinc-600',
    overlayFrom: 'from-[#0a0a0a]/70',
    overlayVia: 'via-[#0a0a0a]/40',
    overlayTo: 'to-[#0a0a0a]/90',
    overlayLR: 'from-[#0a0a0a]/60',
    auroraOpacity: 'opacity-100',
    vignette: 'shadow-[inset_0_0_120px_rgba(0,0,0,0.9)]',
    outlineBtn: 'border-white/15 text-white hover:bg-white/5',
  } : {
    bg: 'bg-[#fafafa]',
    text: 'text-zinc-900',
    selection: 'selection:bg-red-500/20',
    navBg: 'bg-white/70',
    navBorder: 'border-zinc-200/60',
    logoText: 'text-zinc-900',
    ghostBtn: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
    heading: 'text-zinc-900',
    body: 'text-zinc-500',
    badgeBg: 'bg-red-50 border-red-200/60 text-red-600',
    badgeShadow: 'shadow-[0_0_20px_rgba(220,38,38,0.06)]',
    cardBg: 'bg-white border-zinc-200/60 hover:border-red-200 hover:shadow-md',
    cardIcon: 'bg-red-50 text-red-500 group-hover:bg-red-100',
    cardTitle: 'text-zinc-900',
    cardBody: 'text-zinc-500',
    canvasBorder: 'border-zinc-200 ring-zinc-100 bg-white',
    canvasChrome: 'bg-zinc-100 border-zinc-200 text-zinc-400',
    footerBorder: 'border-zinc-200',
    footerText: 'text-zinc-400',
    overlayFrom: 'from-[#fafafa]/80',
    overlayVia: 'via-[#fafafa]/50',
    overlayTo: 'to-[#fafafa]/95',
    overlayLR: 'from-[#fafafa]/70',
    auroraOpacity: 'opacity-40',
    vignette: 'shadow-[inset_0_0_120px_rgba(250,250,250,0.9)]',
    outlineBtn: 'border-zinc-300 text-zinc-700 hover:bg-zinc-100',
  }

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} font-sans overflow-x-hidden ${t.selection} transition-colors duration-500`}>
      {/* Animated Aurora Background */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src="/bg-aurora.png"
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${t.auroraOpacity}`}
          style={{ transformOrigin: 'center center' }}
          animate={{
            scale: [1, 1.05, 1.02, 1.06, 1],
            x: [0, 15, -10, 5, 0],
            y: [0, -10, 5, -5, 0],
            rotate: [0, 0.5, -0.3, 0.2, 0],
          }}
          transition={{
            duration: 25,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror',
          }}
        />
        {/* Overlay gradients */}
        <div className={`absolute inset-0 bg-linear-to-b ${t.overlayFrom} ${t.overlayVia} ${t.overlayTo} transition-colors duration-500`} />
        <div className={`absolute inset-0 bg-linear-to-r ${t.overlayLR} via-transparent ${t.overlayLR} transition-colors duration-500`} />
      </motion.div>

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 py-4 px-6 lg:px-12 backdrop-blur-lg ${t.navBg} border-b ${t.navBorder} flex items-center justify-between transition-colors duration-500`}>
        <div className={`flex items-center gap-3 font-bold text-xl tracking-tight ${t.logoText}`}>
          <img src={isDark ? '/logo.png' : '/logo-light.png'} alt="Bodo" className="h-10 w-10" />
          Bodo
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`relative h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-white/10 hover:bg-white/15 text-yellow-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'}`}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {!isPending && (
            session ? (
              <Link to="/dashboard">
                <Button className="bg-white hover:bg-slate-200 text-black font-semibold rounded-full px-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105">
                  Enter Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth" search={{ tab: 'login' } as any}>
                  <Button variant="ghost" className={`${t.ghostBtn} rounded-full font-medium`}>
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-red-600 hover:bg-red-500 text-white font-semibold rounded-full px-6 shadow-[0_0_24px_rgba(220,38,38,0.4)] transition-all hover:scale-105 border border-red-500/30">
                    Start for free
                  </Button>
                </Link>
              </>
            )
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 lg:pt-48 pb-24 px-6 lg:px-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${t.badgeBg} text-sm font-medium mb-8 backdrop-blur-sm ${t.badgeShadow} transition-colors duration-500`}>
            <Sparkles className="h-4 w-4" />
            <span>Anti-Gravity Light-Brush 2.0 is live</span>
          </div>
          
          <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8 ${t.heading} transition-colors duration-500`}>
            Construct ideas at <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 via-red-400 to-rose-300 inline-block">
              orbital velocity.
            </span>
          </h1>
          
          <p className={`text-lg sm:text-xl ${t.body} max-w-2xl mb-12 leading-relaxed font-medium transition-colors duration-500`}>
            Bodo is an infinite spatial canvas engineered for frictionless team ideation. Manipulate localized gravity fields to draw, plan, and execute — at zero latency.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {session ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button className={`w-full sm:w-auto h-14 font-bold rounded-full px-8 text-lg transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-white hover:bg-slate-100 text-black shadow-[0_0_30px_rgba(255,255,255,0.15)]' : 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg'}`}>
                  Open Workspace <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-14 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full px-8 text-lg shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all hover:scale-105 active:scale-95 border border-red-500/30">
                    Try Bodo Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button variant="outline" className={`w-full sm:w-auto h-14 bg-transparent ${t.outlineBtn} font-semibold rounded-full px-8 text-lg transition-all duration-500`}>
                    Watch Demo
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Demo Canvas Preview */}
        <motion.div
           initial={{ opacity: 0, y: 60 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
           style={{ y }}
           className={`mt-24 w-full max-w-[1200px] h-[600px] rounded-2xl overflow-hidden border ${t.canvasBorder} shadow-[0_20px_80px_rgba(0,0,0,0.3)] ring-1 relative transition-colors duration-500`}
        >
          {/* Mock OS Window Chrome */}
          <div className={`absolute top-0 inset-x-0 h-12 ${t.canvasChrome} backdrop-blur-md border-b flex items-center px-4 z-20 gap-2 transition-colors duration-500`}>
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
            <div className="mx-auto flex items-center justify-center -ml-8 w-full text-xs font-semibold tracking-wider uppercase">Local Scratchpad</div>
          </div>
          
          <div className="w-full h-full pt-12 overflow-hidden relative">
            <div className="absolute inset-0 top-12">
               <LocalWhiteboardCanvas />
            </div>
            <div className={`absolute inset-0 pointer-events-none ${t.vignette} z-10 transition-shadow duration-500`} />
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1200px] w-full text-left">
          {[
            { icon: Zap, title: 'Tachyon-Speed Sync', desc: 'Experience seamless multi-user collaboration with true zero-latency syncing powered by our proprietary tachyon engine.' },
            { icon: Shield, title: 'Quantum Security', desc: 'Your architectural diagrams and mission-critical thoughts are secured with military-grade end-to-end encryption.' },
            { icon: Sparkles, title: 'Intelligent Constructs', desc: 'Utilize dark matter density bindings and gravity-assisted smoothing algorithms to create perfect diagrams instantly.' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group p-8 rounded-2xl ${t.cardBg} transition-all duration-300`}
            >
              <div className={`h-12 w-12 ${t.cardIcon} rounded-xl flex items-center justify-center mb-6 transition-colors`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className={`text-lg font-bold ${t.cardTitle} mb-2 transition-colors duration-500`}>{feature.title}</h3>
              <p className={`text-sm ${t.cardBody} leading-relaxed transition-colors duration-500`}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className={`relative z-10 py-12 border-t ${t.footerBorder} mt-24 text-center ${t.footerText} text-sm transition-colors duration-500`}>
        <p>© {new Date().getFullYear()} Bodo Inc. All rights reserved.</p>
      </footer>
    </div>
  )
}
