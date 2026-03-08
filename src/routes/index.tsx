import { createFileRoute, Link } from '@tanstack/react-router'
import { LocalWhiteboardCanvas } from '../components/canvas/LocalWhiteboardCanvas'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { ArrowRight, Zap, Shield, Sparkles } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { data: session, isPending } = authClient.useSession()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-50 font-sans overflow-x-hidden selection:bg-red-500/30">
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
          className="absolute inset-0 w-full h-full object-cover"
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
        {/* Dark overlay gradient for text readability */}
        <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/40 to-[#0a0a0a]/90" />
        <div className="absolute inset-0 bg-linear-to-r from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]/60" />
      </motion.div>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 py-4 px-6 lg:px-12 backdrop-blur-lg bg-[#0a0a0a]/60 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white">
          <img src="/logo.png" alt="Bodo" className="h-10 w-10" />
          Bodo
        </div>

        <div className="flex items-center gap-4">
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
                  <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full font-medium">
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/40 border border-red-800/30 text-red-300 text-sm font-medium mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(220,38,38,0.1)]">
            <Sparkles className="h-4 w-4" />
            <span>Anti-Gravity Light-Brush 2.0 is live</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8 text-white">
            Construct ideas at <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 via-red-400 to-rose-300 inline-block">
              orbital velocity.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-medium">
            Bodo is an infinite spatial canvas engineered for frictionless team ideation. Manipulate localized gravity fields to draw, plan, and execute — at zero latency.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {session ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-14 bg-white hover:bg-slate-100 text-black font-bold rounded-full px-8 text-lg shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all hover:scale-105 active:scale-95">
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
                  <Button variant="outline" className="w-full sm:w-auto h-14 bg-transparent border-white/15 text-white font-semibold rounded-full px-8 text-lg hover:bg-white/5 transition-all">
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
           className="mt-24 w-full max-w-[1200px] h-[600px] rounded-2xl overflow-hidden border border-red-900/20 shadow-[0_20px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(220,38,38,0.08)] ring-1 ring-white/5 bg-[#0a0a0a] relative"
        >
          {/* Mock OS Window Chrome */}
          <div className="absolute top-0 inset-x-0 h-12 bg-zinc-900/90 backdrop-blur-md border-b border-white/5 flex items-center px-4 z-20 gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
            <div className="mx-auto flex items-center justify-center -ml-8 w-full text-xs font-semibold text-zinc-500 tracking-wider uppercase">Local Scratchpad</div>
          </div>
          
          <div className="w-full h-full pt-12 overflow-hidden relative">
            <div className="absolute inset-0 top-12">
               <LocalWhiteboardCanvas />
            </div>
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] z-10" />
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1200px] w-full text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group p-8 rounded-2xl bg-white/3 border border-white/6 hover:border-red-900/30 hover:bg-white/6 transition-all duration-300"
          >
            <div className="h-12 w-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Tachyon-Speed Sync</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Experience seamless multi-user collaboration with true zero-latency syncing powered by our proprietary tachyon engine.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group p-8 rounded-2xl bg-white/3 border border-white/6 hover:border-red-900/30 hover:bg-white/6 transition-all duration-300"
          >
            <div className="h-12 w-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Quantum Security</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your architectural diagrams and mission-critical thoughts are secured with military-grade end-to-end encryption.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group p-8 rounded-2xl bg-white/3 border border-white/6 hover:border-red-900/30 hover:bg-white/6 transition-all duration-300"
          >
            <div className="h-12 w-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Intelligent Constructs</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Utilize dark matter density bindings and gravity-assisted smoothing algorithms to create perfect diagrams instantly.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5 mt-24 text-center text-zinc-600 text-sm">
        <p>© {new Date().getFullYear()} Bodo Inc. All rights reserved.</p>
      </footer>
    </div>
  )
}
