import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/sign-in")({
	component: SignInPage,
});

function SignInPage() {
	return (
		<div className="flex h-screen w-full font-sans bg-background overflow-hidden selection:bg-red-500/30">
			<div className="hidden lg:flex w-[45%] bg-[oklch(0.145 0 0)] text-white flex-col justify-between p-12 relative overflow-hidden shadow-2xl z-10">
				<img
					src="/bg-aurora.png"
					alt=""
					className="absolute inset-0 w-full h-full object-cover opacity-60"
				/>
				<div className="absolute inset-0 bg-linear-to-b from-[oklch(0.145 0 0)]/60 via-[oklch(0.145 0 0)]/30 to-[oklch(0.145 0 0)]/80" />

				<div
					className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-900/20 blur-[100px] animate-pulse"
					style={{ animationDuration: "4s" }}
				/>
				<div
					className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[120px] animate-pulse"
					style={{ animationDuration: "6s", animationDelay: "1s" }}
				/>

				<div className="relative z-20 flex flex-col h-full">
					<Link
						to="/"
						className="flex items-center gap-3 font-bold text-2xl tracking-tight mb-auto text-white hover:opacity-80 transition-opacity"
					>
						<img src="/logo.png" alt="Bodo" className="h-12 w-12" />
						Bodo
					</Link>

					<div className="mb-20">
						<h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
							Create at the <br />
							<span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 via-red-400 to-rose-300">
								speed of thought.
							</span>
						</h1>
						<p className="text-lg text-zinc-400 max-w-md mb-12 leading-relaxed">
							Experience the friction-less infinite canvas built for the modern
							team. Ideate, map, and collaborate in real-time.
						</p>

						<div className="space-y-4">
							{[
								"Anti-Gravity Light-Brush constructs",
								"Zero-latency spatial synchronization",
								"Gravimetric tether navigation",
							].map((feature, i) => (
								<div
									key={i}
									className="flex items-center gap-4 text-zinc-300 bg-white/4 p-4 rounded-2xl border border-white/6 backdrop-blur-sm transition-transform hover:translate-x-1"
								>
									<div className="h-8 w-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
										<CheckCircle2 className="h-4 w-4 text-red-400" />
									</div>
									<span className="font-medium text-sm lg:text-base tracking-wide">
										{feature}
									</span>
								</div>
							))}
						</div>
					</div>

					<div className="relative z-10 flex items-center justify-between text-sm py-4 text-zinc-600 font-medium border-t border-white/6 pt-8 mt-auto">
						<span>© {new Date().getFullYear()} Bodo Inc.</span>
						<div className="flex gap-4">
							<a href="#" className="hover:text-white transition-colors">
								Terms
							</a>
							<a href="#" className="hover:text-white transition-colors">
								Privacy
							</a>
						</div>
					</div>
				</div>
			</div>

			<div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-auto">
				<Link
					to="/"
					className="absolute top-8 left-8 lg:hidden flex items-center gap-2 font-bold text-xl tracking-tight text-foreground z-20 hover:opacity-80 transition-opacity"
				>
					<img src="/logo-light.png" alt="Bodo" className="h-9 w-9" />
					Bodo
				</Link>

				<div className="w-full flex justify-center items-center z-10 transition-all">
					<SignIn signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
				</div>
			</div>
		</div>
	);
}
