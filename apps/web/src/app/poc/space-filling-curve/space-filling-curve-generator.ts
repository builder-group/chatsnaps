export class SpaceFillingCurveGenerator {
	private readonly config: TSpaceFillingCurveGeneratorConfig;

	private static readonly DIRECTIONS = [
		[0, -2], // Up
		[2, 0], // Right
		[0, 2], // Down
		[-2, 0] // Left
	] as const;

	constructor(options: TSpaceFillingCurveGeneratorOptions = {}) {
		const { cols = 8, rows = 8, subGridSize = 2 } = options;
		this.config = {
			cols,
			rows,
			subGridSize
		};
		this.validateConfig();
	}

	private validateConfig(): void {
		const { cols, rows, subGridSize } = this.config;
		if (cols % subGridSize !== 0 || rows % subGridSize !== 0) {
			throw new Error('Grid dimensions must be divisible by subGridSize');
		}
	}

	/**
	 * Generates a complete space-filling curve with all intermediate results
	 * @returns All components needed to visualize or use the space-filling curve
	 */
	public generate(): TGeneratorResult {
		const nodes = this.generateCoarseGridNodes();
		const spanningTree = this.generateSpanningTree(nodes);
		const intersectionPoints = this.generateIntersectionPoints(spanningTree);
		const bitmaskValues = this.calculateBitmaskValues(nodes, intersectionPoints);
		const path = this.generatePath();

		return {
			nodes,
			spanningTree,
			intersectionPoints,
			bitmaskValues,
			path
		};
	}

	/**
	 * Generates only the final space-filling curve path
	 * @returns Array of [x, y] coordinates representing the path
	 */
	public generatePath(): [number, number][] {
		const nodes = this.generateCoarseGridNodes();
		const spanningTree = this.generateSpanningTree(nodes);
		const intersectionPoints = this.generateIntersectionPoints(spanningTree);
		const bitmaskValues = this.calculateBitmaskValues(nodes, intersectionPoints);
		return this.generatePathFromBitmask(bitmaskValues);
	}

	private generateCoarseGridNodes(): TPoint[] {
		const { cols, rows, subGridSize } = this.config;
		const nodes: TPoint[] = [];

		for (let i = 0; i < cols; i += subGridSize) {
			for (let j = 0; j < rows; j += subGridSize) {
				nodes.push({ x: i + 1, y: j + 1 });
			}
		}
		return nodes;
	}

	private generateSpanningTree(nodes: TPoint[]): TSpanningTreeEdge[] {
		const stack: TPoint[] = [];
		const visited = new Set<string>();
		const spanningTree: TSpanningTreeEdge[] = [];

		const startNode = nodes[Math.floor(Math.random() * nodes.length)] as TPoint;
		stack.push(startNode);
		visited.add(this.pointToString(startNode));

		while (stack.length > 0) {
			const current = stack.pop()!;
			const neighbors = this.getNeighbors(current);
			const unvisitedNeighbors = neighbors.filter((n) => !visited.has(this.pointToString(n)));

			if (unvisitedNeighbors.length > 0) {
				stack.push(current);
				const next = unvisitedNeighbors[
					Math.floor(Math.random() * unvisitedNeighbors.length)
				] as TPoint;
				spanningTree.push([current, next]);
				visited.add(this.pointToString(next));
				stack.push(next);
			}
		}

		return spanningTree;
	}

	private getNeighbors(node: TPoint): TPoint[] {
		const { cols, rows } = this.config;

		return SpaceFillingCurveGenerator.DIRECTIONS.map(([dx, dy]) => ({
			x: node.x + dx,
			y: node.y + dy
		})).filter((n) => n.x >= 1 && n.x < cols && n.y >= 1 && n.y < rows);
	}

	private generateIntersectionPoints(spanningTree: TSpanningTreeEdge[]): [number, number][] {
		const intersectionPoints = new Set<string>();

		for (const [start, end] of spanningTree) {
			if (start.x === end.x) {
				const minY = Math.min(start.y, end.y);
				const maxY = Math.max(start.y, end.y);
				for (let y = minY + 1; y < maxY; y++) {
					intersectionPoints.add(`${start.x},${y}`);
				}
			} else if (start.y === end.y) {
				const minX = Math.min(start.x, end.x);
				const maxX = Math.max(start.x, end.x);
				for (let x = minX + 1; x < maxX; x++) {
					intersectionPoints.add(`${x},${start.y}`);
				}
			}
		}

		return Array.from(intersectionPoints).map((p) => p.split(',').map(Number) as [number, number]);
	}

	private calculateBitmaskValues(
		nodes: TPoint[],
		intersectionPoints: [number, number][]
	): number[][] {
		const { cols, rows } = this.config;
		const bitmaskValues = Array(cols)
			.fill(null)
			.map(() => Array(rows).fill(0));
		const allPoints = new Set([
			...nodes.map(this.pointToString),
			...intersectionPoints.map(([x, y]) => `${x},${y}`)
		]);

		const hasPoint = (x: number, y: number) => allPoints.has(`${x},${y}`);

		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				// @ts-expect-error -- bitmask grid has size of cols x rows
				if (hasPoint(i, j)) bitmaskValues[i][j] += 1; // Top-left
				// @ts-expect-error -- bitmask grid has size of cols x rows
				if (hasPoint(i + 1, j)) bitmaskValues[i][j] += 2; // Top-right
				// @ts-expect-error -- bitmask grid has size of cols x rows
				if (hasPoint(i + 1, j + 1)) bitmaskValues[i][j] += 4; // Bottom-right
				// @ts-expect-error -- bitmask grid has size of cols x rows
				if (hasPoint(i, j + 1)) bitmaskValues[i][j] += 8; // Bottom-left
			}
		}

		return bitmaskValues;
	}

	private generatePathFromBitmask(bitmaskValues: number[][]): [number, number][] {
		const { cols, rows } = this.config;
		const path: [number, number][] = [[0, 0]];
		let [currentX, currentY] = [0, 0];

		while (path.length < cols * rows) {
			const value = bitmaskValues[currentX]?.[currentY];
			if (value == null) {
				console.warn('Path generation failed: Invalid bitmask value');
				return path;
			}
			const direction = this.getDirectionFromBitmask(value);

			const [nextX, nextY] = this.getNextPosition([currentX, currentY], direction);
			if (!this.isValidPosition(nextX, nextY)) {
				console.warn('Path generation failed: Invalid position');
				return path;
			}

			currentX = nextX;
			currentY = nextY;
			path.push([currentX, currentY]);
		}

		return path;
	}

	private getDirectionFromBitmask(value: number): 'N' | 'E' | 'S' | 'W' | '' {
		if ([2, 6, 14].includes(value)) return 'N';
		if ([4, 12, 13].includes(value)) return 'E';
		if ([8, 9, 11].includes(value)) return 'S';
		if ([1, 3, 7].includes(value)) return 'W';
		return '';
	}

	private getNextPosition(
		[x, y]: [number, number],
		direction: 'N' | 'E' | 'S' | 'W' | ''
	): [number, number] {
		switch (direction) {
			case 'N':
				return [x, y - 1];
			case 'E':
				return [x + 1, y];
			case 'S':
				return [x, y + 1];
			case 'W':
				return [x - 1, y];
			default:
				return [x, y];
		}
	}

	private isValidPosition(x: number, y: number): boolean {
		const { cols, rows } = this.config;
		return x >= 0 && x < cols && y >= 0 && y < rows;
	}

	private pointToString(point: TPoint): string {
		return `${point.x},${point.y}`;
	}
}

export type TPoint = {
	x: number;
	y: number;
};

export type TSpanningTreeEdge = [TPoint, TPoint];

export interface TSpaceFillingCurveGeneratorConfig {
	cols: number;
	rows: number;
	subGridSize: number;
}

export type TSpaceFillingCurveGeneratorOptions = Partial<TSpaceFillingCurveGeneratorConfig>;

export interface TGeneratorResult {
	/** Nodes of the coarse grid (centers of subgrids) */
	nodes: TPoint[];
	/** Edges of the spanning tree connecting coarse grid nodes */
	spanningTree: TSpanningTreeEdge[];
	/** Points where the spanning tree intersects with the fine grid */
	intersectionPoints: [number, number][];
	/** Bitmask values for each cell in the fine grid */
	bitmaskValues: number[][];
	/** Final space-filling curve path coordinates */
	path: [number, number][];
}
