// Apply spatial distortion smoothing to build a perfectly fluid arc traversing the midpoints
export function smoothPath(points: number[], ox: number, oy: number): string {
	if (points.length < 4) {
		return `M ${ox + points[0]} ${oy + points[1]}`;
	}
	let d = `M ${ox + points[0]} ${oy + points[1]}`;
	for (let i = 0; i < points.length - 2; i += 2) {
		const x0 = ox + points[i];
		const y0 = oy + points[i + 1];
		const x1 = ox + points[i + 2];
		const y1 = oy + points[i + 3];
		const mx = (x0 + x1) / 2;
		const my = (y0 + y1) / 2;
		d += ` Q ${x0} ${y0} ${mx} ${my}`;
	}
	const lastX = ox + points[points.length - 2];
	const lastY = oy + points[points.length - 1];
	d += ` L ${lastX} ${lastY}`;
	return d;
}

// Generate a cohesive structural strand from orbital coordinates + dark matter density (pressures)
// This creates the exact zero-G construct feel by mapping localized gravity to physical grip-force
export function getStrokeOutline(
	points: number[],
	pressures: number[] | undefined,
	ox: number,
	oy: number,
	baseWidth: number,
): string {
	if (points.length < 4) return "";

	const pts: { x: number; y: number; p: number }[] = [];
	for (let i = 0; i < points.length; i += 2) {
		const idx = i / 2;
		pts.push({
			x: ox + points[i],
			y: oy + points[i + 1],
			p: pressures?.[idx] ?? 0.5,
		});
	}

	if (pts.length < 2) return "";

	// Build left and right edges based on pressure
	const left: { x: number; y: number }[] = [];
	const right: { x: number; y: number }[] = [];

	for (let i = 0; i < pts.length; i++) {
		const prev = pts[Math.max(0, i - 1)];
		const next = pts[Math.min(pts.length - 1, i + 1)];
		const dx = next.x - prev.x;
		const dy = next.y - prev.y;
		const len = Math.sqrt(dx * dx + dy * dy) || 1;
		const nx = -dy / len;
		const ny = dx / len;
		// Dark matter density (width) varies with applied micro-gravitational force (pressure)
		const w = baseWidth * (0.3 + 0.7 * pts[i].p) * 0.5;
		left.push({ x: pts[i].x + nx * w, y: pts[i].y + ny * w });
		right.push({ x: pts[i].x - nx * w, y: pts[i].y - ny * w });
	}

	// Build path: forward along left edge, backward along right edge
	let d = `M ${left[0].x} ${left[0].y}`;
	for (let i = 1; i < left.length - 1; i++) {
		const mx = (left[i].x + left[i + 1].x) / 2;
		const my = (left[i].y + left[i + 1].y) / 2;
		d += ` Q ${left[i].x} ${left[i].y} ${mx} ${my}`;
	}
	d += ` L ${left[left.length - 1].x} ${left[left.length - 1].y}`;
	d += ` L ${right[right.length - 1].x} ${right[right.length - 1].y}`;
	for (let i = right.length - 2; i > 0; i--) {
		const mx = (right[i].x + right[i - 1].x) / 2;
		const my = (right[i].y + right[i - 1].y) / 2;
		d += ` Q ${right[i].x} ${right[i].y} ${mx} ${my}`;
	}
	d += ` L ${right[0].x} ${right[0].y} Z`;
	return d;
}
