import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useState } from 'react'
import { Plus, Trash2, LogOut, Sparkles, LayoutGrid, Clock, MoreHorizontal, PenLine } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const navigate = useNavigate()
  const session = authClient.useSession()
  const userQuery = useQuery(api.users.getUserByEmail, 
    session.data?.user?.email ? { email: session.data.user.email } : "skip" as any
  )
  
  const userId = userQuery?._id
  const boards = useQuery(api.boards.listForUser, userId ? { userId } : "skip" as any)
  const createBoard = useMutation(api.boards.create)
  const removeBoard = useMutation(api.boards.remove)
  const createCheckout = useAction(api.polar.createCheckoutSession)
  const [newTitle, setNewTitle] = useState('')
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true)
      const url = await createCheckout()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error(err)
      alert("Failed to prepare checkout.")
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !userId) return
    const id = await createBoard({
      title: newTitle,
      ownerId: userId,
      isPublic: false
    })
    setNewTitle('')
    navigate({ to: '/board/$boardId', params: { boardId: id } })
  }

  const handleQuickCreate = async () => {
    if (!userId) return
    const id = await createBoard({
      title: `Untitled Board`,
      ownerId: userId,
      isPublic: false
    })
    navigate({ to: '/board/$boardId', params: { boardId: id } })
  }

  const handleDelete = async (boardId: string) => {
    setDeletingId(boardId)
    await removeBoard({ boardId: boardId as any })
    setDeletingId(null)
  }

  const handleLogout = async () => {
    await authClient.signOut()
    navigate({ to: '/auth' })
  }

  if (session.isPending || (session.data && !boards)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm font-medium">Loading workspace...</p>
        </div>
      </div>
    )
  }
  
  if (!session.data?.user) {
    navigate({ to: '/auth' })
    return null
  }

  const userName = session.data.user.name || session.data.user.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header */}
      <header className="flex h-16 items-center border-b border-white/6 px-6 lg:px-10 backdrop-blur-lg bg-[#0a0a0a]/80 sticky top-0 z-50">
        <div className="flex items-center gap-3 flex-1">
          <img src="/logo.png" alt="Bodo" className="h-9 w-9" />
          <h1 className="text-lg font-bold tracking-tight text-white">Bodo</h1>
        </div>
        <div className="flex items-center gap-3">
          {userQuery?.isPro ? (
            <span className="text-xs border border-red-500/30 py-1 px-2.5 rounded-full bg-red-500/10 font-semibold text-red-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> PRO
            </span>
          ) : (
            <Button 
              size="sm" 
              onClick={handleUpgrade} 
              disabled={isUpgrading} 
              className="bg-red-600 hover:bg-red-500 text-white border border-red-500/30 rounded-full text-xs font-semibold px-4 shadow-[0_0_16px_rgba(220,38,38,0.3)]"
            >
              {isUpgrading ? "Loading..." : (
                <><Sparkles className="mr-1.5 h-3 w-3" /> Upgrade</>
              )}
            </Button>
          )}
          <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
            {userInitial}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-500 hover:text-white hover:bg-white/5 rounded-full h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Welcome & Create */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-1">
              Welcome back, {userName}
            </h2>
            <p className="text-zinc-500 text-sm">
              {boards?.length || 0} board{boards?.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          
          <form onSubmit={handleCreate} className="flex gap-2 w-full md:w-auto">
            <Input
              placeholder="Board name..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-10 w-full md:w-56"
            />
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl h-10 px-4 font-semibold border border-red-500/30 shadow-[0_0_16px_rgba(220,38,38,0.2)] shrink-0"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Create
            </Button>
          </form>
        </div>

        {/* Boards Grid */}
        {boards?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/2">
            <div className="h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-white/6">
              <LayoutGrid className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No boards yet</h3>
            <p className="text-zinc-500 text-sm mb-6 max-w-sm text-center">
              Create your first whiteboard to start ideating with the Anti-Gravity Light-Brush.
            </p>
            <Button 
              onClick={handleQuickCreate}
              className="bg-red-600 hover:bg-red-500 text-white rounded-full px-6 font-semibold border border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
            >
              <Plus className="mr-2 h-4 w-4" /> Create your first board
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Quick Create Card */}
            <button
              onClick={handleQuickCreate}
              className="group flex flex-col items-center justify-center h-[200px] rounded-2xl border border-dashed border-white/10 hover:border-red-500/30 bg-white/2 hover:bg-white/4 transition-all duration-200 cursor-pointer"
            >
              <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-white/6 group-hover:border-red-500/30 flex items-center justify-center mb-3 transition-colors">
                <Plus className="h-6 w-6 text-zinc-500 group-hover:text-red-400 transition-colors" />
              </div>
              <span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">New Board</span>
            </button>

            {/* Board Cards */}
            {boards?.map((board: any) => (
              <Link
                key={board._id}
                to="/board/$boardId"
                params={{ boardId: board._id }}
                className="group relative flex flex-col h-[200px] rounded-2xl border border-white/6 bg-zinc-900/50 hover:border-red-900/40 hover:bg-zinc-900 transition-all duration-200 overflow-hidden"
              >
                {/* Card preview area */}
                <div className="flex-1 p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <PenLine className="h-4 w-4 text-red-400/70" />
                    <h3 className="text-base font-semibold text-white truncate">{board.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-600 mt-auto">
                    <Clock className="h-3 w-3" />
                    {board.updatedAt 
                      ? new Date(board.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : board.createdAt
                        ? new Date(board.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Unknown'
                    }
                  </div>
                </div>

                {/* Card footer */}
                <div className="border-t border-white/4 px-4 py-2.5 flex items-center justify-between bg-black/20">
                  <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors">
                    {board.isPublic ? 'Public' : 'Private'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDelete(board._id)
                    }}
                    disabled={deletingId === board._id}
                    title="Delete board"
                  >
                    {deletingId === board._id ? (
                      <div className="h-3 w-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
