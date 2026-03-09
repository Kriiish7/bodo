import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'

import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { ArrowLeft } from 'lucide-react'

// 1. Zod Validation Rules
const noteFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
})

type NoteFormValues = z.infer<typeof noteFormSchema>

export const Route = createFileRoute('/notes/$noteId')({
  // 2. TanStack Start Loader (Pre-fetches SSR data)
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.notes.getNote, { id: params.noteId as Id<'notes'> })
    )
  },
  component: NoteEditor,
})

function NoteEditor() {
  const { noteId } = Route.useParams()
  const dbId = noteId as Id<'notes'>
  
  // 3. React Query + Convex live hook
  const { data: note } = useSuspenseQuery(
    convexQuery(api.notes.getNote, { id: dbId })
  )
  
  // 4. Mutation to trigger DB updates
  const updateNote = useMutation(api.notes.updateNote)
  
  // 5. Setup React Hook Form
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: note.title,
      content: note.content,
    },
  })

  // 6. Handle Incoming Live Updates from other users
  useEffect(() => {
    if (!form.formState.isDirty) {
      if (note.title !== form.getValues('title')) {
        form.setValue('title', note.title, { shouldValidate: true })
      }
      if (note.content !== form.getValues('content')) {
        form.setValue('content', note.content, { shouldValidate: true })
      }
    }
  }, [note, form])

  // 7. Auto-save local updates upward to Convex DB
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Small debounce simulation (would use robust debounce in Production)
      const timeoutId = setTimeout(() => {
        if (form.formState.isValid && form.formState.isDirty) {
          updateNote({
            id: dbId,
            title: value.title || '',
            content: value.content || ''
          })
          // Reset the form state so incoming changes can be accepted if I stop typing
          form.reset({}, { keepValues: true })
        }
      }, 300)
      return () => clearTimeout(timeoutId)
    })
    
    return () => subscription.unsubscribe()
  }, [form, updateNote, dbId])

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 h-screen flex flex-col gap-6 bg-zinc-50/30">
      <Link to="/notes" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors w-fit group">
         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         Back to Notes
      </Link>
      
      {/* Realtime Context Headers */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-zinc-800 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            Workspace Mode
          </h2>
          <p className="text-xs text-zinc-400 font-medium">Auto-saving locally & globally.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md">
            Collaborative
          </span>
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 bg-white border border-zinc-200/60 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.02)] p-6 sm:p-10 mb-8 max-h-[calc(100vh-160px)]">
        <form className="flex flex-col h-full gap-4">
          <label className="flex flex-col gap-2 relative">
            <input
              {...form.register('title')}
              className="text-4xl sm:text-5xl font-extrabold bg-transparent border-none outline-none placeholder:text-zinc-200 text-zinc-900 focus:ring-0 px-0 caret-blue-500 transition-colors"
              placeholder="Untitled Note"
            />
            {form.formState.errors.title && (
              <span className="text-red-500 text-sm absolute -bottom-5 left-0">{form.formState.errors.title.message}</span>
            )}
          </label>
          <div className="w-full h-px bg-zinc-100 my-2" />
          <textarea
            {...form.register('content')}
            className="flex-1 w-full resize-none bg-transparent border-none outline-none text-lg text-zinc-600 leading-relaxed placeholder:text-zinc-300 focus:ring-0 px-0 caret-emerald-500 custom-scrollbar"
            placeholder="Start typing your collaborative notes... updates will be synced immediately to all connected clients."
          />
        </form>
      </div>
    </div>
  )
}
