import { Link } from "@tanstack/react-router";
import { useSession, useSignOut } from "#/lib/auth-client";
import { Button } from "./ui/button";

export default function HeaderUser() {
	const { data: session, isPending } = useSession();
	const signOut = useSignOut();

	if (isPending) {
		return <div className="h-8 w-8 rounded-full bg-zinc-200 animate-pulse" />;
	}

	if (!session?.user) {
		return (
			<Link to="/auth">
				<Button variant="ghost" size="sm">
					Sign In
				</Button>
			</Link>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Link to="/dashboard">
				<Button variant="ghost" size="sm">
					Dashboard
				</Button>
			</Link>
			<Button variant="ghost" size="sm" onClick={() => signOut()}>
				Sign Out
			</Button>
			{session.user.image ? (
				<img
					src={session.user.image}
					alt={session.user.name}
					className="h-8 w-8 rounded-full"
				/>
			) : (
				<div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center">
					{session.user.name?.[0]?.toUpperCase() || "U"}
				</div>
			)}
		</div>
	);
}
