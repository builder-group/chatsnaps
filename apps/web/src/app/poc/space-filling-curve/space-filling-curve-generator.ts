/**
 * Generates space-filling curves using a random spanning tree approach.
 * The algorithm works by:
 * 1. Creating a coarse grid of nodes
 * 2. Generating a random spanning tree
 * 3. Creating intersection points
 * 4. Converting to a bitmask representation
 * 5. Generating the final path
 */
export class SpaceFillingCurveGenerator {
	private static readonly SUB_GRID_SIZE = 2;

	// Pre-computed direction vectors for grid traversal
	// Using 2-unit steps to account for the subgrid structure
	private static readonly DIRECTIONS = Object.freeze([
		[0, -SpaceFillingCurveGenerator.SUB_GRID_SIZE], // Up
		[SpaceFillingCurveGenerator.SUB_GRID_SIZE, 0], // Right
		[0, SpaceFillingCurveGenerator.SUB_GRID_SIZE], // Down
		[-SpaceFillingCurveGenerator.SUB_GRID_SIZE, 0] // Left
	] as const);

	// Maps bitmask patterns to directional movement
	// Each number represents a specific configuration of connected points
	private static readonly BITMASK_TO_DIRECTION: Record<number, TDirection> = {
		// Patterns indicating northward movement
		2: 'N',
		6: 'N',
		14: 'N',
		// Patterns indicating eastward movement
		4: 'E',
		12: 'E',
		13: 'E',
		// Patterns indicating southward movement
		8: 'S',
		9: 'S',
		11: 'S',
		// Patterns indicating westward movement
		1: 'W',
		3: 'W',
		7: 'W'
	};

	private readonly config: Required<TSpaceFillingCurveGeneratorConfig>;
	private readonly gridSize: number;

	constructor(options: TSpaceFillingCurveGeneratorOptions = {}) {
		this.config = {
			cols: options.cols ?? 8,
			rows: options.rows ?? 8
		};
		this.gridSize = this.config.cols * this.config.rows;
	}

	/**
	 * Generates all components needed to construct and visualize the space-filling curve.
	 */
	public generate(): TGeneratorResult {
		const nodes = this.generateCoarseGridNodes();
		const spanningTree = this.generateSpanningTree(nodes);
		const intersectionPoints = this.generateIntersectionPoints(spanningTree);
		const bitmaskValues = this.calculateBitmaskValues(nodes, intersectionPoints);
		const path = this.generatePathFromBitmask(bitmaskValues);

		return {
			nodes,
			spanningTree,
			intersectionPoints,
			bitmaskValues,
			path
		};
	}

	/**
	 * Generates only the final path of the space-filling curve.
	 */
	public generatePath(): TPoint[] {
		return this.generatePathFromBitmask(
			this.calculateBitmaskValues(
				this.generateCoarseGridNodes(),
				this.generateIntersectionPoints(this.generateSpanningTree(this.generateCoarseGridNodes()))
			)
		);
	}

	/**
	 * Creates the initial coarse grid nodes that will be connected by the spanning tree.
	 * These nodes are placed at the center of each subgrid.
	 */
	private generateCoarseGridNodes(): TPoint[] {
		const { cols, rows } = this.config;
		const nodes: TPoint[] = [];

		for (let i = 0; i < cols; i += SpaceFillingCurveGenerator.SUB_GRID_SIZE) {
			for (let j = 0; j < rows; j += SpaceFillingCurveGenerator.SUB_GRID_SIZE) {
				nodes.push({ x: i + 1, y: j + 1 });
			}
		}

		return nodes;
	}

	/**
	 * Generates a random spanning tree connecting the coarse grid nodes.
	 * Uses a depth-first search approach with randomized neighbor selection.
	 */
	private generateSpanningTree(nodes: TPoint[]): TSpanningTreeEdge[] {
		const visited = new Set<string>();
		const spanningTree: TSpanningTreeEdge[] = [];
		const stack: TPoint[] = [];

		const startNode = nodes[Math.floor(Math.random() * nodes.length)] as TPoint;
		stack.push(startNode);
		visited.add(this.pointToString(startNode));

		while (stack.length > 0) {
			const current = stack.pop() as TPoint;
			const unvisitedNeighbors = this.getUnvisitedNeighbors(current, visited);

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

	/**
	 * Finds all unvisited neighboring nodes within the grid bounds.
	 * Used during spanning tree generation to ensure proper connectivity.
	 */
	private getUnvisitedNeighbors(node: TPoint, visited: Set<string>): TPoint[] {
		const { cols, rows } = this.config;
		const neighbors: TPoint[] = [];

		for (const [dx, dy] of SpaceFillingCurveGenerator.DIRECTIONS) {
			const newX = node.x + dx;
			const newY = node.y + dy;

			if (newX >= 1 && newX < cols && newY >= 1 && newY < rows) {
				const neighbor = { x: newX, y: newY };
				if (!visited.has(this.pointToString(neighbor))) {
					neighbors.push(neighbor);
				}
			}
		}

		return neighbors;
	}

	/**
	 * Generates points where the spanning tree edges intersect with the fine grid.
	 */
	private generateIntersectionPoints(spanningTree: TSpanningTreeEdge[]): TPoint[] {
		const intersectionPoints = new Set<string>();

		for (const [start, end] of spanningTree) {
			// Vertical edge - generate points along y-axis
			if (start.x === end.x) {
				const minY = Math.min(start.y, end.y);
				const maxY = Math.max(start.y, end.y);
				for (let y = minY + 1; y < maxY; y++) {
					intersectionPoints.add(this.pointToString({ x: start.x, y }));
				}
			}
			// Horizontal edge - generate points along x-axis
			else if (start.y === end.y) {
				const minX = Math.min(start.x, end.x);
				const maxX = Math.max(start.x, end.x);
				for (let x = minX + 1; x < maxX; x++) {
					intersectionPoints.add(this.pointToString({ x, y: start.y }));
				}
			}
		}

		return Array.from(intersectionPoints, (point) => {
			const [x, y] = point.split(',');
			return { x: Number(x), y: Number(y) };
		});
	}

	/**
	 * Converts the geometric representation (nodes and intersections) into a bitmask grid.
	 * Each cell's bitmask indicates which of its corners contain path points.
	 */
	private calculateBitmaskValues(nodes: TPoint[], intersectionPoints: TPoint[]): number[][] {
		const { cols, rows } = this.config;
		const bitmaskValues = Array.from({ length: cols }, () => new Array(rows).fill(0));
		const allPoints = new Set([
			...nodes.map(this.pointToString),
			...intersectionPoints.map((point) => this.pointToString(point))
		]);

		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				let bitmask = 0;
				if (allPoints.has(this.pointToString({ x: i, y: j }))) bitmask |= 1; // Top-left
				if (allPoints.has(this.pointToString({ x: i + 1, y: j }))) bitmask |= 2; // Top-right
				if (allPoints.has(this.pointToString({ x: i + 1, y: j + 1 }))) bitmask |= 4; // Bottom-right
				if (allPoints.has(this.pointToString({ x: i, y: j + 1 }))) bitmask |= 8; // Bottom-left
				// @ts-expect-error -- bitmask grid has size of cols x rows
				bitmaskValues[i][j] = bitmask;
			}
		}

		return bitmaskValues;
	}

	/**
	 * Generates the final space-filling curve path using the bitmask grid.
	 * Follows the path indicated by the bitmasks, moving from cell to cell
	 * based on the pattern of points in each cell.
	 */
	private generatePathFromBitmask(bitmaskValues: number[][]): TPoint[] {
		const path: TPoint[] = [{ x: 0, y: 0 }];
		let currentPoint: TPoint = { x: 0, y: 0 };

		while (path.length < this.gridSize) {
			const value = bitmaskValues[currentPoint.x]?.[currentPoint.y];
			if (value == null) {
				break;
			}

			const direction = SpaceFillingCurveGenerator.BITMASK_TO_DIRECTION[value] ?? '';
			currentPoint = this.getNextPosition(currentPoint, direction);

			if (!this.isValidPosition(currentPoint)) {
				console.warn('Path generation failed: Invalid position');
				break;
			}
			path.push(currentPoint);
		}

		return path;
	}

	/**
	 * Calculates the next position based on the current position and direction.
	 */
	private getNextPosition(current: TPoint, direction: TDirection): TPoint {
		switch (direction) {
			case 'N':
				return { x: current.x, y: current.y - 1 };
			case 'E':
				return { x: current.x + 1, y: current.y };
			case 'S':
				return { x: current.x, y: current.y + 1 };
			case 'W':
				return { x: current.x - 1, y: current.y };
			default:
				console.warn(`Invalid direction at ${current.x},${current.y}`);
				return current;
		}
	}

	/**
	 * Checks if a position is within the grid boundaries.
	 */
	private isValidPosition(point: TPoint): boolean {
		const { cols, rows } = this.config;
		return point.x >= 0 && point.x < cols && point.y >= 0 && point.y < rows;
	}

	/**
	 * Converts a point object to a string representation for use as Set keys.
	 */
	private pointToString(point: TPoint): string {
		return `${point.x},${point.y}`;
	}
}

type TDirection = 'N' | 'E' | 'S' | 'W' | '';

export interface TPoint {
	x: number;
	y: number;
}

export type TSpanningTreeEdge = [TPoint, TPoint];

export interface TSpaceFillingCurveGeneratorConfig {
	cols: number;
	rows: number;
}

export type TSpaceFillingCurveGeneratorOptions = Partial<TSpaceFillingCurveGeneratorConfig>;

export interface TGeneratorResult {
	/** Nodes of the coarse grid (centers of subgrids) */
	nodes: TPoint[];
	/** Edges of the spanning tree connecting coarse grid nodes */
	spanningTree: TSpanningTreeEdge[];
	/** Points where the spanning tree intersects with the fine grid */
	intersectionPoints: TPoint[];
	/** Bitmask values for each cell in the fine grid */
	bitmaskValues: number[][];
	/** Final space-filling curve path coordinates */
	path: TPoint[];
}
