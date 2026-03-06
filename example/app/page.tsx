import { ClipboardList, FileText, KeyRound, Lock, type LucideIcon } from 'lucide-react'

export default function Home() {
  const cards: Array<{ href: string; icon: LucideIcon; title: string; desc: string; color: string }> = [
    { href: '/changelog', icon: ClipboardList, title: 'Public Feed', desc: '/changelog', color: 'from-blue-600/20 to-blue-400/20 hover:from-blue-600/30 hover:to-blue-400/30 border-blue-500/30 hover:border-blue-400/60' },
    { href: '/changelog/admin', icon: Lock, title: 'Admin Portal', desc: '/changelog/admin', color: 'from-purple-600/20 to-purple-400/20 hover:from-purple-600/30 hover:to-purple-400/30 border-purple-500/30 hover:border-purple-400/60' },
    { href: '/changelog/login', icon: KeyRound, title: 'Admin Login', desc: '/changelog/login', color: 'from-emerald-600/20 to-emerald-400/20 hover:from-emerald-600/30 hover:to-emerald-400/30 border-emerald-500/30 hover:border-emerald-400/60' },
    { href: '/changelog/entry/your-slug-here', icon: FileText, title: 'Single Entry', desc: '/changelog/entry/:slug', color: 'from-amber-600/20 to-amber-400/20 hover:from-amber-600/30 hover:to-amber-400/30 border-amber-500/30 hover:border-amber-400/60' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center justify-center p-8 gap-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl">
        <div className="inline-block mb-4 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
          <span className="text-xs font-medium text-blue-300">Changelog Management</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 bg-clip-text text-transparent" style={{ fontFamily: 'Outfit, sans-serif' }}>
          changelog-sdk
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          A modern changelog management solution for Next.js. Create, manage, and showcase your product updates with style.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {cards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className={`group relative flex flex-col gap-3 p-6 bg-gradient-to-br ${card.color} border rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 backdrop-blur-sm`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <card.icon className="h-10 w-10 text-slate-100 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
            <span className="font-semibold text-slate-100 text-lg">{card.title}</span>
            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{card.desc}</span>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-slate-500 mt-8">
        <p>
          Running on <span className="text-slate-300 font-medium">port 3000</span> • Check the <code className="bg-slate-800/50 border border-slate-700 px-2 py-1 rounded text-slate-300 text-xs">README.md</code> for setup instructions
        </p>
      </div>
    </main>
  )
}
