import {
	Calculator,
	EyeOff,
	Mic,
	MicOff,
	Minus,
	PhoneMissed,
	Play,
	Plus,
	Square,
	Timer,
	Users,
	Video,
	Vote,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";

export function MeetingToolbar({
	isPrivate,
	setIsPrivate,
}: {
	isPrivate: boolean;
	setIsPrivate: (b: boolean) => void;
}) {
	// Timer state
	const [timerActive, setTimerActive] = useState(false);
	const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 mins

	// Video state
	const [videoActive, setVideoActive] = useState(false);
	const [micMuted, setMicMuted] = useState(false);

	// Voting state
	const [votingActive, setVotingActive] = useState(false);

	// Estimation state
	const [estimationActive, setEstimationActive] = useState(false);
	const [selectedEstimate, setSelectedEstimate] = useState<string | null>(null);
	const estimationCards = ["1", "2", "3", "5", "8", "13", "21", "?"];

	useEffect(() => {
		let interval: any;
		if (timerActive && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((t) => t - 1);
			}, 1000);
		} else if (timeLeft === 0) {
			setTimerActive(false);
		}
		return () => clearInterval(interval);
	}, [timerActive, timeLeft]);

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	return (
		<>
			<div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border border-zinc-200 dark:border-white/10 rounded-full p-2 shadow-sm">
				{/* Timer */}
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant={timerActive ? "default" : "ghost"}
							size="sm"
							className={`rounded-full gap-2 ${timerActive ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
						>
							<Timer size={16} />
							{timerActive ? formatTime(timeLeft) : "Timer"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-64 p-4 flex flex-col gap-4">
						<div className="text-center text-3xl font-mono font-bold">
							{formatTime(timeLeft)}
						</div>
						<div className="flex items-center justify-center gap-4">
							<Button
								variant="outline"
								size="icon"
								onClick={() => setTimeLeft(Math.max(0, timeLeft - 60))}
							>
								<Minus size={16} />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={() => setTimeLeft(timeLeft + 60)}
							>
								<Plus size={16} />
							</Button>
						</div>
						<Button
							className="w-full"
							variant={timerActive ? "destructive" : "default"}
							onClick={() => setTimerActive(!timerActive)}
						>
							{timerActive ? (
								<>
									<Square size={16} className="mr-2" /> Stop
								</>
							) : (
								<>
									<Play size={16} className="mr-2" /> Start
								</>
							)}
						</Button>
					</PopoverContent>
				</Popover>

				<div className="w-px h-6 bg-zinc-200 dark:bg-white/10" />

				{/* Voting */}
				<Button
					variant={votingActive ? "default" : "ghost"}
					size="sm"
					className={`rounded-full gap-2 ${votingActive ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}`}
					onClick={() => setVotingActive(!votingActive)}
				>
					<Vote size={16} /> Voting
				</Button>

				{/* Estimation */}
				<Popover open={estimationActive} onOpenChange={setEstimationActive}>
					<PopoverTrigger asChild>
						<Button
							variant={
								estimationActive || selectedEstimate ? "default" : "ghost"
							}
							size="sm"
							className={`rounded-full gap-2 ${estimationActive || selectedEstimate ? "bg-purple-500 hover:bg-purple-600 text-white" : ""}`}
						>
							<Calculator size={16} />{" "}
							{selectedEstimate ? `Estimate: ${selectedEstimate}` : "Estimate"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-64 p-4">
						<h4 className="font-semibold mb-3 text-sm text-center">
							Select your estimate
						</h4>
						<div className="grid grid-cols-4 gap-2">
							{estimationCards.map((c) => (
								<button
									key={c}
									onClick={() => {
										setSelectedEstimate(c);
										setEstimationActive(false);
									}}
									className={`h-12 rounded flex items-center justify-center text-lg font-bold border transition-all ${selectedEstimate === c ? "bg-purple-500 text-white border-purple-500" : "bg-transparent border-zinc-200 dark:border-white/10 hover:border-purple-500/50"}`}
								>
									{c}
								</button>
							))}
						</div>
						{selectedEstimate && (
							<Button
								variant="ghost"
								size="sm"
								className="w-full mt-3 text-xs"
								onClick={() => setSelectedEstimate(null)}
							>
								Clear Estimate
							</Button>
						)}
					</PopoverContent>
				</Popover>

				<div className="w-px h-6 bg-zinc-200 dark:bg-white/10" />

				{/* Private Mode */}
				<Button
					variant={isPrivate ? "default" : "ghost"}
					size="sm"
					className={`rounded-full gap-2 ${isPrivate ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
					onClick={() => setIsPrivate(!isPrivate)}
				>
					<EyeOff size={16} /> {isPrivate ? "Private Mode ON" : "Private"}
				</Button>

				{/* Video */}
				<Button
					variant={videoActive ? "default" : "ghost"}
					size="sm"
					className={`rounded-full gap-2 ${videoActive ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`}
					onClick={() => setVideoActive(!videoActive)}
				>
					<Video size={16} /> Video
				</Button>
			</div>

			{/* Floating Video UI Elements */}
			{videoActive && (
				<div className="absolute top-20 right-4 z-30 flex flex-col gap-2">
					<div className="w-48 h-36 bg-zinc-800 rounded-xl overflow-hidden relative shadow-lg border border-white/10">
						<div className="absolute inset-0 flex items-center justify-center bg-zinc-700">
							<Users size={32} className="text-zinc-500" />
						</div>
						<div className="absolute bottom-2 left-2 text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded-sm backdrop-blur">
							You
						</div>
						{micMuted && (
							<div className="absolute top-2 right-2 text-red-500 bg-black/50 p-1 rounded-full backdrop-blur">
								<MicOff size={12} />
							</div>
						)}
					</div>
					<div className="w-48 h-36 bg-emerald-900 rounded-xl overflow-hidden relative shadow-lg border border-emerald-500/30">
						<div className="absolute inset-0 flex items-center justify-center bg-emerald-800/50">
							<div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-xl shadow-lg border-2 border-emerald-400">
								A
							</div>
						</div>
						<div className="absolute bottom-2 left-2 text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded-sm backdrop-blur">
							Alex
						</div>
					</div>
					{/* Controls */}
					<div className="flex items-center justify-center gap-2 mt-1 bg-black/50 p-2 rounded-xl backdrop-blur-md">
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full h-8 w-8 text-white hover:bg-white/20"
							onClick={() => setMicMuted(!micMuted)}
						>
							{micMuted ? (
								<MicOff size={14} className="text-red-400" />
							) : (
								<Mic size={14} />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full h-8 w-8 text-white hover:bg-white/20"
						>
							<Video size={14} />
						</Button>
						<Button
							variant="destructive"
							size="icon"
							className="rounded-full h-8 w-8"
							onClick={() => setVideoActive(false)}
						>
							<PhoneMissed size={14} />
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
