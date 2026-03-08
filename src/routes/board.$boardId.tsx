import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ArrowLeft, Cloud, Share2 } from "lucide-react";
import { LocalWhiteboardCanvas } from "#/components/canvas/LocalWhiteboardCanvas";
import { MeetingToolbar } from "#/components/canvas/MeetingToolbar";
import { Button } from "#/components/ui/button";
import { useSession } from "#/lib/auth-client";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/board/$boardId")({
	component: Board,
});

function Board() {
	const { boardId } = Route.useParams();
	const navigate = useNavigate();

	const validBoardId = boardId as Id<"boards">;
	const board = useQuery(api.boards.get, { boardId: validBoardId });

	const { data: session, isPending } = useSession();
	const [isPrivate, setIsPrivate] = useState(false);

	const handleBack = () => {
		navigate({ to: "/dashboard" });
	};

	if (board === undefined || isPending) {
		return (
			<div className="fixed inset-0 z-50 flex flex-col h-screen items-center justify-center bg-[#0a0a0a]">
				<div className="h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
				<p className="text-zinc-500 text-sm font-medium">Loading board...</p>
			</div>
		);
	}

	if (board === null) {
		return (
			<div className="fixed inset-0 z-50 flex flex-col h-screen items-center justify-center p-4 bg-[#0a0a0a]">
				<h1 className="text-2xl font-bold mb-4 text-white">Board not found</h1>
				<p className="text-zinc-500 mb-6">
					This board may have been deleted or doesn't exist.
				</p>
				<Button
					onClick={handleBack}
					className="bg-red-600 hover:bg-red-500 text-white rounded-full px-6 border border-red-500/30"
				>
					Return to Dashboard
				</Button>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-50 flex w-full flex-col bg-[#fdfdfd] dark:bg-[#0a0a0a] overflow-hidden">
			{/* Top Navigation */}
			<header className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between rounded-xl border border-zinc-200 dark:border-white/6 bg-white/90 dark:bg-zinc-900/90 p-3 shadow-sm backdrop-blur-lg">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleBack}
						className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white rounded-lg h-8 w-8"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="h-5 w-px bg-zinc-200 dark:bg-white/10" />
					<h1 className="text-sm font-semibold text-zinc-800 dark:text-white px-1 truncate max-w-[200px]">
						{board.title}
					</h1>

					{/* Auto-save indicator */}
					<div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
						<Cloud className="h-3 w-3" />
						<span className="font-medium">Saved</span>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div className="flex -space-x-2 mr-1">
						<div className="h-7 w-7 rounded-full border-2 border-white dark:border-zinc-900 bg-red-500 flex items-center justify-center text-[10px] text-white font-bold">
							{session?.user?.name?.charAt(0).toUpperCase() || "U"}
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="hidden sm:flex h-8 rounded-lg text-xs font-medium border-zinc-200 dark:border-white/10 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/5"
						onClick={() => {
							navigator.clipboard.writeText(window.location.href);
							alert("Board link copied to clipboard!");
						}}
					>
						<Share2 className="mr-1.5 h-3 w-3" /> Share
					</Button>
				</div>
			</header>

			{/* Main Canvas Area */}
			<main className="flex-1 relative cursor-crosshair">
				<MeetingToolbar isPrivate={isPrivate} setIsPrivate={setIsPrivate} />
				<LocalWhiteboardCanvas boardId={validBoardId} />
			</main>
		</div>
	);
}
