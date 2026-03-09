import { useUser, useAuth } from "@clerk/tanstack-react-start";

export interface SessionUser {
	id: string;
	email: string;
	name: string;
	image?: string;
}

export interface Session {
	user: SessionUser;
}

export function useSession() {
	const { user, isLoaded } = useUser();

	if (!isLoaded) {
		return { data: undefined, isPending: true };
	}

	if (!user) {
		return { data: null, isPending: false };
	}

	return {
		data: {
			user: {
				id: user.id,
				email: user.primaryEmailAddress?.emailAddress || "",
				name: user.fullName || user.firstName || "User",
				image: user.imageUrl,
			},
		},
		isPending: false,
	};
}

export function useSignOut() {
	const { signOut } = useAuth();
	return () => signOut();
}

export const authClient = {
	useSession,
	useSignOut,
};
