import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

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
	const session = useQuery(api.auth.getSession);
	return {
		data: session,
		isPending: session === undefined,
	};
}

export function useSignInEmail() {
	return useMutation(api.auth.signInWithPassword);
}

export function useSignUpEmail() {
	return useMutation(api.auth.signUp);
}

export function useSignOut() {
	return useMutation(api.auth.signOut);
}

export function useGetAuthUrl() {
	return useMutation(api.auth.getAuthUrl);
}

export const authClient = {
	useSession,
	useSignInEmail,
	useSignUpEmail,
	useSignOut,
};
