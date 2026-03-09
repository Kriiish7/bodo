import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/notes/")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			convexQuery(api.notes.listNotes, {}),
		);
	},
	component: NotesList,
});

function NotesList() {
	const { data: notes } = useSuspenseQuery(
		convexQuery(api.notes.listNotes, {}),
	);
	const createNote = useMutation(api.notes.createNote);
	const navigate = useNavigate();
	const [isCreating, setIsCreating] = useState(false);

	const handleCreate = async () => {
		setIsCreating(true);
		try {
			const id = await createNote({ title: "Untitled Note" });
			navigate({ to: "/notes/$noteId", params: { noteId: id } });
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-8 flex flex-col gap-8">
			<div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
				<div>
					<h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-zinc-800 to-zinc-500">
						Collaborative Notes
					</h1>
					<p className="text-zinc-500 mt-1">Real-time syncing workspace</p>
				</div>
				<button
					onClick={handleCreate}
					disabled={isCreating}
					className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-all font-medium shadow-sm hover:shadow-md ring-1 ring-zinc-900/5 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 active:scale-95 text-sm"
				>
					{isCreating ? "Creating..." : "+ New Note"}
				</button>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{notes?.length === 0 ? (
					<div className="col-span-full flex flex-col items-center justify-center p-16 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
						<h3 className="font-semibold text-zinc-900 text-lg">
							No notes found
						</h3>
						<p className="text-zinc-500 mt-2 text-center max-w-sm">
							Create your first note to start collaborating in real-time.
						</p>
					</div>
				) : (
					notes?.map((note) => (
						<Link
							key={note._id}
							to="/notes/$noteId"
							params={{ noteId: note._id }}
							className="group flex flex-col gap-3 p-6 bg-white border border-zinc-200/60 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-zinc-300 hover:-translate-y-0.5 relative overflow-hidden"
						>
							<div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							<h3 className="font-semibold text-lg text-zinc-800 truncate">
								{note.title || "Untitled"}
							</h3>
							<p className="text-zinc-500 text-sm truncate flex-1">
								{note.content || "Empty note"}
							</p>

							<div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
								<span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
									<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
									Live
								</span>
								<span className="text-xs text-zinc-400">
									{new Date(note.updatedAt).toLocaleDateString(undefined, {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</span>
							</div>
						</Link>
					))
				)}
			</div>
		</div>
	);
}
