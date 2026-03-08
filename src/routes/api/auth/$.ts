import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: async () => {
				return new Response(null, {
					status: 302,
					headers: { Location: "/auth" },
				});
			},
			POST: async () => {
				return new Response(null, {
					status: 302,
					headers: { Location: "/auth" },
				});
			},
		},
	},
});
