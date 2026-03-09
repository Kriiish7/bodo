import { ChevronDown, ChevronRight, Link2, Plus, Trash2 } from "lucide-react";
import React from "react";

export type TableRowData = {
	id: string;
	name: string;
	value: string;
	type: "text" | "number" | "relation";
	relationTarget?: string;
	children?: TableRowData[];
	expanded?: boolean;
};

interface TableNodeProps {
	el: any;
	isActive: boolean;
	setElements: React.Dispatch<React.SetStateAction<any[]>>;
	allElements: any[];
}

export function TableNode({
	el,
	isActive,
	setElements,
	allElements,
}: TableNodeProps) {
	const defaultData: TableRowData[] = el.tableData || [];

	const updateData = (newData: TableRowData[]) => {
		setElements((prev) =>
			prev.map((e) => (e._id === el._id ? { ...e, tableData: newData } : e)),
		);
	};

	const addRow = () => {
		const newRow: TableRowData = {
			id: Math.random().toString(36).substring(2, 9),
			name: "New Item",
			value: "",
			type: "text",
			children: [],
		};
		updateData([...defaultData, newRow]);
	};

	const renderRow = (row: TableRowData, depth: number, parentIds: string[]) => {
		const handleUpdate = (field: keyof TableRowData, val: any) => {
			const newData = JSON.parse(JSON.stringify(defaultData));
			let target = newData;
			for (const pid of parentIds) {
				const pr = target.find((r: any) => r.id === pid);
				target = pr.children;
			}
			const item = target.find((r: any) => r.id === row.id);
			if (item) {
				item[field] = val;
				updateData(newData);
			}
		};

		const handleAddChild = () => {
			const newData = JSON.parse(JSON.stringify(defaultData));
			let target = newData;
			for (const pid of parentIds) {
				const pr = target.find((r: any) => r.id === pid);
				target = pr.children;
			}
			const item = target.find((r: any) => r.id === row.id);
			if (item) {
				if (!item.children) item.children = [];
				item.children.push({
					id: Math.random().toString(36).substring(2, 9),
					name: "Nested Item",
					value: "",
					type: "text",
					children: [],
				});
				item.expanded = true;
				updateData(newData);
			}
		};

		const handleDelete = () => {
			const newData = JSON.parse(JSON.stringify(defaultData));
			let target = newData;
			for (const pid of parentIds) {
				const pr = target.find((r: any) => r.id === pid);
				target = pr.children;
			}
			const idx = target.findIndex((r: any) => r.id === row.id);
			if (idx !== -1) {
				target.splice(idx, 1);
				updateData(newData);
			}
		};

		return (
			<React.Fragment key={row.id}>
				<div className="flex items-center group border-b border-zinc-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
					<div
						className="flex-1 flex items-center p-1"
						style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
					>
						<button
							onClick={() => handleUpdate("expanded", !row.expanded)}
							className={`p-1 rounded opacity-50 hover:opacity-100 ${!row.children || row.children.length === 0 ? "invisible" : ""}`}
						>
							{row.expanded ? (
								<ChevronDown size={14} />
							) : (
								<ChevronRight size={14} />
							)}
						</button>
						<input
							value={row.name}
							onChange={(e) => handleUpdate("name", e.target.value)}
							className="bg-transparent border-none outline-none font-medium px-2 py-1 flex-1 min-w-0"
							placeholder="Item Name"
						/>
					</div>
					<div className="flex-1 flex items-center p-1 border-l border-zinc-200 dark:border-white/10">
						{row.type === "relation" ? (
							<div className="flex items-center px-2 py-1 gap-2 flex-1 text-blue-500 bg-blue-500/10 rounded mr-2 text-sm">
								<Link2 size={14} />
								<select
									className="bg-transparent outline-none flex-1 font-medium cursor-pointer"
									value={row.relationTarget || ""}
									onChange={(e) =>
										handleUpdate("relationTarget", e.target.value)
									}
								>
									<option value="">Select target table...</option>
									{allElements
										.filter((e) => e.type === "table" && e._id !== el._id)
										.map((t) => (
											<option key={t._id} value={t._id}>
												{t.title || "Untitled Table"}
											</option>
										))}
								</select>
							</div>
						) : (
							<input
								value={row.value || ""}
								onChange={(e) => handleUpdate("value", e.target.value)}
								className="bg-transparent border-none outline-none px-2 py-1 flex-1 min-w-0"
								placeholder="Value..."
								type={row.type === "number" ? "number" : "text"}
							/>
						)}
						<select
							value={row.type}
							onChange={(e) => handleUpdate("type", e.target.value as any)}
							className="bg-transparent opacity-50 outline-none text-xs ml-2 cursor-pointer w-20"
						>
							<option value="text">Text</option>
							<option value="number">Number</option>
							<option value="relation">Relation</option>
						</select>
					</div>
					<div className="flex items-center justify-center p-1 gap-1 border-l border-zinc-200 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity w-16">
						<button
							onClick={handleAddChild}
							className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded text-zinc-500"
						>
							<Plus size={14} />
						</button>
						<button
							onClick={handleDelete}
							className="p-1.5 hover:bg-red-500/20 rounded text-red-500"
						>
							<Trash2 size={14} />
						</button>
					</div>
				</div>
				{row.expanded &&
					row.children &&
					row.children.map((child) =>
						renderRow(child, depth + 1, [...parentIds, row.id]),
					)}
			</React.Fragment>
		);
	};

	return (
		<div
			className={`w-full h-full flex flex-col bg-white dark:bg-zinc-900 rounded-xl overflow-hidden pointer-events-auto transition-shadow ${
				isActive
					? "ring-2 ring-blue-500 shadow-xl"
					: "shadow-md border border-zinc-200 dark:border-white/10"
			}`}
		>
			{/* Header */}
			<div className="bg-zinc-50 dark:bg-zinc-800/80 p-3 flex items-center gap-3 border-b border-zinc-200 dark:border-white/10">
				<input
					value={el.title || "Structured Data"}
					onChange={(e) => {
						setElements((prev) =>
							prev.map((item) =>
								item._id === el._id ? { ...item, title: e.target.value } : item,
							),
						);
					}}
					className="font-bold text-base bg-transparent border-none outline-none flex-1 text-foreground"
					placeholder="Table Title"
				/>
			</div>
			{/* Table Headers */}
			<div className="flex text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-white/10">
				<div className="flex-1 p-2 pl-4">Name</div>
				<div className="flex-1 p-2 pl-3 border-l border-zinc-200 dark:border-white/10">
					Value
				</div>
				<div className="w-16 border-l border-zinc-200 dark:border-white/10"></div>
			</div>
			{/* Rows */}
			<div className="flex-1 overflow-y-auto min-h-[100px]">
				{defaultData.length === 0 ? (
					<div className="h-full flex items-center justify-center text-sm text-zinc-400 italic">
						No data yet.
					</div>
				) : (
					defaultData.map((row) => renderRow(row, 0, []))
				)}
			</div>
			{/* Footer / Add Row */}
			<div className="p-2 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800/50">
				<button
					onClick={addRow}
					className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-foreground px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors w-full"
				>
					<Plus size={16} /> Add Row
				</button>
			</div>
		</div>
	);
}
