import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import {
	Clock,
	FolderOpen,
	FolderPlus,
	LayoutGrid,
	LayoutTemplate,
	LogOut,
	PenLine,
	Plus,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { useSession, useSignOut } from "#/lib/auth-client";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/dashboard")({
	component: Dashboard,
});

function Dashboard() {
	const navigate = useNavigate();
	const { data: session, isPending } = useSession();
	const signOut = useSignOut();
	const userQuery = useQuery(
		api.users.getUserByEmail,
		session?.user?.email ? { email: session.user.email } : ("skip" as any),
	);

	const userId = userQuery?._id;
	const boards = useQuery(
		api.boards.listForUser,
		userId ? { userId } : ("skip" as any),
	);
	const spaces = useQuery(
		api.spaces.listForUser,
		userId ? { userId } : ("skip" as any),
	);
	const createBoard = useMutation(api.boards.create);
	const removeBoard = useMutation(api.boards.remove);
	const createSpace = useMutation(api.spaces.create);
	const removeSpace = useMutation(api.spaces.remove);
	const createCheckout = useAction(api.polar.createCheckoutSession);
	const syncUser = useMutation(api.auth.syncUser);

	useEffect(() => {
		if (session?.user) {
			syncUser().catch(console.error);
		}
	}, [session?.user?.id]);

	const [newTitle, setNewTitle] = useState("");
	const [isUpgrading, setIsUpgrading] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [activeSpaceId, setActiveSpaceId] = useState<Id<"spaces"> | null>(null);

	const [isSpaceDialogOpen, setIsSpaceDialogOpen] = useState(false);
	const [newSpaceName, setNewSpaceName] = useState("");

	const filteredBoards = boards?.filter((b: any) =>
		activeSpaceId ? b.spaceId === activeSpaceId : true,
	);

	const handleUpgrade = async () => {
		try {
			setIsUpgrading(true);
			const url = await createCheckout();
			if (url) {
				window.location.href = url;
			}
		} catch (err) {
			console.error(err);
			alert("Failed to prepare checkout.");
		} finally {
			setIsUpgrading(false);
		}
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTitle.trim() || !userId) return;
		const id = await createBoard({
			title: newTitle,
			ownerId: userId,
			isPublic: false,
			spaceId: activeSpaceId || undefined,
		});
		setNewTitle("");
		navigate({ to: "/board/$boardId", params: { boardId: id } });
	};

	const handleQuickCreate = async () => {
		if (!userId) return;
		const id = await createBoard({
			title: `Untitled Board`,
			ownerId: userId,
			isPublic: false,
			spaceId: activeSpaceId || undefined,
		});
		navigate({ to: "/board/$boardId", params: { boardId: id } });
	};

	const handleCreateSpace = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newSpaceName.trim() || !userId) return;
		const id = await createSpace({
			name: newSpaceName,
			ownerId: userId,
		});
		setNewSpaceName("");
		setIsSpaceDialogOpen(false);
		setActiveSpaceId(id);
	};

	const handleCreateBlueprint = async (blueprintName: string, items: any[]) => {
		if (!userId) return;
		const id = await createBoard({
			title: `${blueprintName} Board`,
			ownerId: userId,
			isPublic: false,
			spaceId: activeSpaceId || undefined,
		});
		// Write initial items directly to local storage to emulate a template
		localStorage.setItem(`bodo_board_${id}`, JSON.stringify(items));
		navigate({ to: "/board/$boardId", params: { boardId: id } });
	};

	const handleDelete = async (boardId: string) => {
		setDeletingId(boardId);
		await removeBoard({ boardId: boardId as any });
		setDeletingId(null);
	};

	const handleLogout = async () => {
		await signOut();
		navigate({ to: "/sign-in" });
	};

	if (isPending || (session && !boards)) {
		return (
			<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
					<p className="text-zinc-400 text-sm font-medium">
						Loading workspace...
					</p>
				</div>
			</div>
		);
	}

	if (!session?.user) {
		navigate({ to: "/sign-in" });
		return null;
	}

	const userName =
		session.user.name || session.user.email?.split("@")[0] || "User";
	const userInitial = userName.charAt(0).toUpperCase();

	return (
		<div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white font-sans">
			{/* Header */}
			<header className="flex h-16 items-center border-b border-white/6 px-6 lg:px-10 backdrop-blur-lg bg-[#0a0a0a]/80 sticky top-0 z-50">
				<div className="flex items-center flex-1">
					<Link
						to="/"
						className="flex items-center gap-3 hover:opacity-80 transition-opacity"
					>
						<img src="/logo.png" alt="Bodo" className="h-9 w-9" />
						<h1 className="text-lg font-bold tracking-tight text-white">
							Bodo
						</h1>
					</Link>
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
							{isUpgrading ? (
								"Loading..."
							) : (
								<>
									<Sparkles className="mr-1.5 h-3 w-3" /> Upgrade
								</>
							)}
						</Button>
					)}
					<div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
						{userInitial}
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleLogout}
						className="text-zinc-500 hover:text-white hover:bg-white/5 rounded-full h-8 w-8"
					>
						<LogOut className="h-4 w-4" />
					</Button>
				</div>
			</header>

			{/* Main Layout containing Sidebar and Content */}
			<div className="flex flex-1 w-full max-w-[1600px] mx-auto overflow-hidden">
				{/* Spaces Sidebar */}
				<aside className="w-64 border-r border-white/6 p-6 hidden md:flex flex-col gap-8 overflow-y-auto">
					<div>
						<h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">
							Apps
						</h3>
						<div className="flex flex-col gap-1">
							<Link
								to="/notes"
								className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-zinc-400 hover:text-white hover:bg-white/5"
							>
								<PenLine className="w-4 h-4" /> Notes
							</Link>
						</div>
					</div>
					<div>
						<h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">
							Spaces
						</h3>
						<div className="flex flex-col gap-1">
							<button
								onClick={() => setActiveSpaceId(null)}
								className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!activeSpaceId ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
							>
								<LayoutGrid className="w-4 h-4" /> All Boards
							</button>
							{spaces?.map((space: any) => (
								<div
									key={space._id}
									className="group relative flex items-center"
								>
									<button
										onClick={() => setActiveSpaceId(space._id)}
										className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${activeSpaceId === space._id ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
									>
										<FolderOpen className="w-4 h-4" />{" "}
										<span className="truncate">{space.name}</span>
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											removeSpace({ spaceId: space._id });
											if (activeSpaceId === space._id) setActiveSpaceId(null);
										}}
										className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
									>
										<Trash2 className="w-3.5 h-3.5" />
									</button>
								</div>
							))}
							<button
								onClick={() => setIsSpaceDialogOpen(true)}
								className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-white hover:bg-white/5 transition-colors mt-2"
							>
								<FolderPlus className="w-4 h-4" /> New Space
							</button>
						</div>
					</div>
				</aside>

				{/* Main Content Area */}
				<main className="flex-1 p-6 md:p-10 w-full overflow-y-auto">
					{/* Welcome & Create */}
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
						<div>
							<h2 className="text-3xl font-bold text-white tracking-tight mb-1">
								{activeSpaceId
									? spaces?.find((s: any) => s._id === activeSpaceId)?.name
									: `Welcome back, ${userName}`}
							</h2>
							<p className="text-zinc-500 text-sm">
								{filteredBoards?.length || 0} board
								{filteredBoards?.length !== 1 ? "s" : ""} in
								{activeSpaceId ? " this space" : " your workspace"}
							</p>
						</div>

						<form
							onSubmit={handleCreate}
							className="flex gap-2 w-full md:w-auto"
						>
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

					{/* Blueprints Section */}
					<div className="mb-10">
						<h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
							<LayoutTemplate className="w-4 h-4" /> Start from Blueprint
						</h3>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<button
								onClick={() =>
									handleCreateBlueprint("Brainstorming", [
										{
											_id: "bs1",
											type: "sticky",
											x: -100,
											y: -50,
											width: 200,
											height: 150,
											text: "Big Idea 1!",
											fill: "#fef3c7",
										},
									])
								}
								className="h-24 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex flex-col items-center justify-center hover:border-blue-500/40 hover:bg-blue-500/20 transition-all group"
							>
								<Sparkles className="h-5 w-5 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
								<span className="font-medium text-sm text-blue-100">
									Brainstorming
								</span>
							</button>
							<button
								onClick={() =>
									handleCreateBlueprint("Flowchart", [
										{
											_id: "fc1",
											type: "rectangle",
											x: -150,
											y: 0,
											width: 100,
											height: 50,
											stroke: "#ffffff",
										},
										{
											_id: "fc2",
											type: "arrow",
											x: -50,
											y: 25,
											width: 50,
											height: 0,
											stroke: "#ffffff",
										},
										{
											_id: "fc3",
											type: "diamond",
											x: 0,
											y: 0,
											width: 80,
											height: 50,
											stroke: "#ffffff",
										},
									])
								}
								className="h-24 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex flex-col items-center justify-center hover:border-emerald-500/40 hover:bg-emerald-500/20 transition-all group"
							>
								<LayoutGrid className="h-5 w-5 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
								<span className="font-medium text-sm text-emerald-100">
									Flowchart
								</span>
							</button>
							<button
								onClick={() =>
									handleCreateBlueprint("Daily Standup", [
										{
											_id: "ds1",
											type: "text",
											x: -200,
											y: -100,
											width: 150,
											height: 40,
											text: "Yesterday",
											stroke: "#ffffff",
										},
										{
											_id: "ds2",
											type: "text",
											x: 0,
											y: -100,
											width: 150,
											height: 40,
											text: "Today",
											stroke: "#ffffff",
										},
										{
											_id: "ds3",
											type: "text",
											x: 200,
											y: -100,
											width: 150,
											height: 40,
											text: "Blockers",
											stroke: "#ffffff",
										},
									])
								}
								className="h-24 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex flex-col items-center justify-center hover:border-purple-500/40 hover:bg-purple-500/20 transition-all group"
							>
								<Clock className="h-5 w-5 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
								<span className="font-medium text-sm text-purple-100">
									Daily Standup
								</span>
							</button>
							<button
								onClick={() => handleCreateBlueprint("Blank Canvas", [])}
								className="h-24 rounded-2xl border border-zinc-700 bg-zinc-900/50 flex flex-col items-center justify-center hover:border-zinc-500 hover:bg-zinc-800 transition-all group"
							>
								<PenLine className="h-5 w-5 text-zinc-400 mb-1 group-hover:scale-110 transition-transform" />
								<span className="font-medium text-sm text-zinc-300">
									Blank Canvas
								</span>
							</button>
						</div>
					</div>

					{/* Boards Grid */}
					{filteredBoards?.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/2">
							<div className="h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-white/6">
								<LayoutGrid className="h-8 w-8 text-zinc-600" />
							</div>
							<h3 className="text-lg font-semibold text-white mb-2">
								{activeSpaceId ? "Space is empty" : "No boards yet"}
							</h3>
							<p className="text-zinc-500 text-sm mb-6 max-w-sm text-center">
								Create your first whiteboard to start ideating.
							</p>
							<Button
								onClick={handleQuickCreate}
								className="bg-red-600 hover:bg-red-500 text-white rounded-full px-6 font-semibold border border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
							>
								<Plus className="mr-2 h-4 w-4" /> Create new board
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
								<span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
									New Board
								</span>
							</button>

							{/* Board Cards */}
							{filteredBoards?.map((board: any) => (
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
											<h3 className="text-base font-semibold text-white truncate">
												{board.title}
											</h3>
										</div>
										<div className="flex items-center gap-2 text-xs text-zinc-600 mt-auto">
											<Clock className="h-3 w-3" />
											{board.updatedAt
												? new Date(board.updatedAt).toLocaleDateString(
														"en-US",
														{
															month: "short",
															day: "numeric",
															year: "numeric",
														},
													)
												: board.createdAt
													? new Date(board.createdAt).toLocaleDateString(
															"en-US",
															{
																month: "short",
																day: "numeric",
																year: "numeric",
															},
														)
													: "Unknown"}
										</div>
									</div>

									{/* Card footer */}
									<div className="border-t border-white/4 px-4 py-2.5 flex items-center justify-between bg-black/20">
										<span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors">
											{board.isPublic ? "Public" : "Private"}
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleDelete(board._id);
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

			{/* Create Space Dialog */}
			<Dialog open={isSpaceDialogOpen} onOpenChange={setIsSpaceDialogOpen}>
				<DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-white/10 text-white">
					<DialogHeader>
						<DialogTitle>Create New Space</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Spaces help you organize boards into projects. Give your space a
							name.
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={handleCreateSpace}
						className="flex flex-col gap-4 mt-4"
					>
						<Input
							autoFocus
							placeholder="e.g. Marketing Quarter 3"
							value={newSpaceName}
							onChange={(e) => setNewSpaceName(e.target.value)}
							className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-red-500/20"
						/>
						<DialogFooter>
							<div className="flex justify-end gap-2 w-full">
								<Button
									type="button"
									variant="ghost"
									className="hover:bg-white/5 hover:text-white"
									onClick={() => setIsSpaceDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="bg-red-600 hover:bg-red-500 text-white border-red-500/30"
								>
									Create Space
								</Button>
							</div>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
