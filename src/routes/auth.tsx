import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Github, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	useGetAuthUrl,
	useSignInEmail,
	useSignUpEmail,
} from "#/lib/auth-client";

export const Route = createFileRoute("/auth")({
	component: Auth,
});

function Auth() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [isLogin, setIsLogin] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [errorText, setErrorText] = useState("");
	const navigate = useNavigate();

	const signInEmail = useSignInEmail();
	const signUpEmail = useSignUpEmail();
	const getAuthUrl = useGetAuthUrl();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorText("");

		try {
			if (isLogin) {
				const res = await signInEmail({ email, password });
				if (res) {
					navigate({ to: "/dashboard" });
				} else {
					setErrorText("Failed to sign in. Please check your credentials.");
				}
			} else {
				if (!name) {
					setErrorText("Name is required for sign up");
					return;
				}
				const nameParts = name.split(" ");
				const firstName = nameParts[0] || "";
				const lastName = nameParts.slice(1).join(" ") || "";
				const res = await signUpEmail({ email, password, firstName, lastName });
				if (res) {
					navigate({ to: "/dashboard" });
				} else {
					setErrorText("Failed to create account. Please try again.");
				}
			}
		} catch (err: unknown) {
			setErrorText(
				err instanceof Error ? err.message : "An unexpected error occurred.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuthLogin = async () => {
		setIsLoading(true);
		setErrorText("");
		try {
			const url = await getAuthUrl({});
			window.location.href = url;
		} catch (err: unknown) {
			setErrorText(
				err instanceof Error ? err.message : "An unexpected error occurred.",
			);
			setIsLoading(false);
		}
	};

	return (
		<div className="flex h-screen w-full font-sans bg-zinc-100 overflow-hidden selection:bg-red-500/30">
			<div className="hidden lg:flex w-[45%] bg-[#0a0a0a] text-white flex-col justify-between p-12 relative overflow-hidden shadow-2xl z-10">
				<img
					src="/bg-aurora.png"
					alt=""
					className="absolute inset-0 w-full h-full object-cover opacity-60"
				/>
				<div className="absolute inset-0 bg-linear-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/30 to-[#0a0a0a]/80" />

				<div
					className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-900/20 blur-[100px] animate-pulse"
					style={{ animationDuration: "4s" }}
				/>
				<div
					className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[120px] animate-pulse"
					style={{ animationDuration: "6s", animationDelay: "1s" }}
				/>

				<div className="relative z-20 flex flex-col h-full">
					<div className="flex items-center gap-3 font-bold text-2xl tracking-tight mb-auto text-white">
						<img src="/logo.png" alt="Bodo" className="h-12 w-12" />
						Bodo
					</div>

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
				<div className="absolute top-8 left-8 lg:hidden flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900 z-20">
					<img src="/logo-light.png" alt="Bodo" className="h-9 w-9" />
					Bodo
				</div>

				<div className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] p-8 sm:p-10 border border-zinc-200/60 relative z-10 transition-all">
					<div className="mb-8 relative">
						<h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
							{isLogin ? "Welcome back" : "Create an account"}
						</h2>
						<p className="text-zinc-500 text-sm">
							{isLogin
								? "Enter your credentials to access your workspace"
								: "Sign up to start collaborating with your team"}
						</p>
					</div>

					{errorText && (
						<div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
							{errorText}
						</div>
					)}

					<form onSubmit={handleSubmit} className="flex flex-col gap-5">
						{!isLogin && (
							<div className="space-y-2">
								<Label htmlFor="name" className="text-zinc-700 font-semibold">
									Full Name
								</Label>
								<Input
									id="name"
									className="bg-white border-zinc-200 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all h-12 rounded-xl text-base px-4"
									placeholder="John Doe"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required={!isLogin}
									autoComplete="name"
								/>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="email" className="text-zinc-700 font-semibold">
								Email address
							</Label>
							<Input
								id="email"
								className="bg-white border-zinc-200 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all h-12 rounded-xl text-base px-4"
								type="email"
								placeholder="you@company.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								autoComplete="email"
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label
									htmlFor="password"
									className="text-zinc-700 font-semibold"
								>
									Password
								</Label>
								{isLogin && (
									<a
										href="#"
										className="text-xs font-semibold text-red-600 hover:text-red-500 transition-colors bg-red-50 px-2 py-1 rounded-md"
									>
										Forgot password?
									</a>
								)}
							</div>
							<Input
								id="password"
								className="bg-white border-zinc-200 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all h-12 rounded-xl text-base px-4"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								autoComplete={isLogin ? "current-password" : "new-password"}
							/>
						</div>

						{isLogin && (
							<div className="flex items-center space-x-2 mt-1">
								<Checkbox
									id="remember"
									className="bg-white border-zinc-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 rounded-sm"
								/>
								<label
									htmlFor="remember"
									className="text-sm font-medium leading-none text-zinc-600 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Remember me for 30 days
								</label>
							</div>
						)}

						<Button
							type="submit"
							className="mt-2 w-full bg-[#0a0a0a] hover:bg-zinc-800 text-white shadow-xl shadow-black/10 h-12 text-base font-semibold rounded-xl transition-all hover:-translate-y-0.5"
							disabled={isLoading}
						>
							{isLoading ? (
								<Loader2 className="mr-2 h-5 w-5 animate-spin opacity-70" />
							) : isLogin ? (
								<>
									Sign In <ArrowRight className="ml-2 h-4 w-4 opacity-70" />
								</>
							) : (
								<>
									Create Account{" "}
									<ArrowRight className="ml-2 h-4 w-4 opacity-70" />
								</>
							)}
						</Button>
					</form>

					<div className="mt-8 flex items-center justify-center gap-4 before:h-px before:flex-1 before:bg-zinc-200 after:h-px after:flex-1 after:bg-zinc-200 text-xs text-zinc-400 font-medium uppercase tracking-wider">
						Or continue with
					</div>

					<div className="mt-6 grid grid-cols-2 gap-3">
						<Button
							variant="outline"
							className="bg-white h-11 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 font-medium transition-colors"
							onClick={() => handleOAuthLogin()}
							disabled={isLoading}
						>
							<Github className="mr-2 h-4 w-4" />
							Github
						</Button>
						<Button
							variant="outline"
							className="bg-white h-11 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 font-medium transition-colors"
							onClick={() => handleOAuthLogin()}
							disabled={isLoading}
						>
							<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
							Google
						</Button>
					</div>

					<div className="mt-8 text-center text-sm text-zinc-600 bg-white py-3 rounded-xl border border-zinc-100">
						{isLogin ? "Don't have an account? " : "Already have an account? "}
						<button
							onClick={() => {
								setIsLogin(!isLogin);
								setErrorText("");
								setPassword("");
							}}
							className="font-bold text-red-600 hover:text-red-700 hover:underline transition-all"
						>
							{isLogin ? "Sign up for free" : "Sign in to workspace"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
