import { Check, Palette } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { useTheme } from "#/hooks/useTheme";
import { cn } from "#/lib/utils";

export function ThemeSelector() {
	const { theme, setTheme } = useTheme();

	const themes = [
		{
			id: "light",
			name: "Light",
			colorClass: "bg-white border-slate-200 text-slate-900 ring-slate-200",
		},
		{
			id: "dark",
			name: "Dark",
			colorClass: "bg-slate-950 border-slate-800 text-white ring-slate-800",
		},
		{
			id: "blue",
			name: "Ocean",
			colorClass: "bg-blue-950 border-blue-900 text-white ring-blue-900",
		},
		{
			id: "rose",
			name: "Rose",
			colorClass: "bg-rose-950 border-rose-900 text-white ring-rose-900",
		},
		{
			id: "amber",
			name: "Amber",
			colorClass: "bg-amber-50 border-amber-200 text-amber-900 ring-amber-200",
		},
		{
			id: "auto",
			name: "System",
			colorClass:
				"bg-gradient-to-tr from-slate-200 to-slate-800 border-slate-300 ring-slate-400",
		},
	] as const;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="rounded-full shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
				>
					<Palette className="h-4 w-4 text-slate-700 dark:text-slate-300" />
					<span className="sr-only">Choose Theme</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				side="top"
				align="end"
				className="w-[280px] p-4 rounded-xl shadow-xl"
			>
				<h3 className="font-semibold text-sm mb-3">Workspace Theme</h3>
				<div className="grid grid-cols-3 gap-3">
					{themes.map((t) => (
						<button
							key={t.id}
							onClick={() => setTheme(t.id as any)}
							className={cn(
								"group flex flex-col items-center justify-center gap-2 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-ring",
								theme === t.id && "bg-slate-50 dark:bg-slate-800/50",
							)}
						>
							<div
								className={cn(
									"h-10 w-10 rounded-full border shadow-sm flex items-center justify-center ring-offset-background transition-all group-hover:scale-105",
									t.colorClass,
									theme === t.id && "ring-2 ring-offset-2",
								)}
							>
								{theme === t.id && <Check className="h-4 w-4" />}
							</div>
							<span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
								{t.name}
							</span>
						</button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
