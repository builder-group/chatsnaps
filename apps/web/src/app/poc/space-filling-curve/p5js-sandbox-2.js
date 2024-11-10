let generator;
let visualizer;

function setup() {
	const cols = 8;
	const rows = 8;
	const cellSize = 50;

	createCanvas(cols * cellSize, rows * cellSize);

	generator = new SpaceFillingCurveGenerator({ cols, rows, subGridSize: 2 });
	visualizer = new SpaceFillingVisualizer(cellSize);

	const result = generator.generate();
	visualizer.setData(result);
}

function draw() {
	background(255);
	visualizer.draw();
}

// Configuration type for the generator
const DEFAULT_CONFIG = {
	cols: 8,
	rows: 8,
	subGridSize: 2
};

class SpaceFillingCurveGenerator {
	constructor(config = DEFAULT_CONFIG) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.validateConfig();
	}

	validateConfig() {
		const { cols, rows, subGridSize } = this.config;
		if (cols % subGridSize !== 0 || rows % subGridSize !== 0) {
			throw new Error('Grid dimensions must be divisible by subGridSize');
		}
	}

	// Generates nodes for the coarse grid (centers of subgrids)
	generateCoarseGridNodes() {
		const nodes = [];
		const { cols, rows, subGridSize } = this.config;

		for (let i = 0; i < cols; i += subGridSize) {
			for (let j = 0; j < rows; j += subGridSize) {
				nodes.push({ x: i + 1, y: j + 1 });
			}
		}
		return nodes;
	}

	// Creates a random spanning tree for the coarse grid
	generateSpanningTree(nodes) {
		const stack = [];
		const visited = new Set();
		const spanningTree = [];

		const startNode = nodes[Math.floor(Math.random() * nodes.length)];
		stack.push(startNode);
		visited.add(`${startNode.x},${startNode.y}`);

		while (stack.length > 0) {
			const current = stack.pop();
			const neighbors = this.getNeighbors(current);
			const unvisitedNeighbors = neighbors.filter((n) => !visited.has(`${n.x},${n.y}`));

			if (unvisitedNeighbors.length > 0) {
				stack.push(current);
				const next = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
				spanningTree.push([current, next]);
				visited.add(`${next.x},${next.y}`);
				stack.push(next);
			}
		}

		return spanningTree;
	}

	// Gets valid neighbors for a node in the coarse grid
	getNeighbors(node) {
		const { cols, rows } = this.config;
		const directions = [
			[0, -2], // Up
			[2, 0], // Right
			[0, 2], // Down
			[-2, 0] // Left
		];

		return directions
			.map(([dx, dy]) => ({
				x: node.x + dx,
				y: node.y + dy
			}))
			.filter((n) => n.x >= 1 && n.x < cols && n.y >= 1 && n.y < rows);
	}

	// Generates intersection points for the fine grid based on spanning tree edges
	generateIntersectionPoints(spanningTree) {
		const intersectionPoints = new Set();

		for (const [start, end] of spanningTree) {
			if (start.x === end.x) {
				// Vertical connection
				const minY = Math.min(start.y, end.y);
				const maxY = Math.max(start.y, end.y);
				for (let y = minY + 1; y < maxY; y++) {
					intersectionPoints.add(`${start.x},${y}`);
				}
			} else if (start.y === end.y) {
				// Horizontal connection
				const minX = Math.min(start.x, end.x);
				const maxX = Math.max(start.x, end.x);
				for (let x = minX + 1; x < maxX; x++) {
					intersectionPoints.add(`${x},${start.y}`);
				}
			}
		}

		return Array.from(intersectionPoints).map((p) => p.split(',').map(Number));
	}

	// Calculates bitmask values for the fine grid based on points
	calculateBitmaskValues(nodes, intersectionPoints) {
		const { cols, rows } = this.config;
		const bitmaskValues = Array(cols)
			.fill()
			.map(() => Array(rows).fill(0));
		const allPoints = new Set([
			...nodes.map((n) => `${n.x},${n.y}`),
			...intersectionPoints.map(([x, y]) => `${x},${y}`)
		]);

		const hasPoint = (x, y) => allPoints.has(`${x},${y}`);

		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (hasPoint(i, j)) bitmaskValues[i][j] += 1; // Top-left
				if (hasPoint(i + 1, j)) bitmaskValues[i][j] += 2; // Top-right
				if (hasPoint(i + 1, j + 1)) bitmaskValues[i][j] += 4; // Bottom-right
				if (hasPoint(i, j + 1)) bitmaskValues[i][j] += 8; // Bottom-left
			}
		}

		return bitmaskValues;
	}

	// Maps bitmask values to directions for path generation
	getDirectionFromBitmask(value) {
		if ([2, 6, 14].includes(value)) return 'N';
		if ([4, 12, 13].includes(value)) return 'E';
		if ([8, 9, 11].includes(value)) return 'S';
		if ([1, 3, 7].includes(value)) return 'W';
		return '';
	}

	// Generates the space-filling curve path based on bitmask values
	generatePath(bitmaskValues) {
		const { cols, rows } = this.config;
		const path = [[0, 0]];
		let [currentX, currentY] = [0, 0];

		while (path.length < cols * rows) {
			const value = bitmaskValues[currentX][currentY];
			const direction = this.getDirectionFromBitmask(value);

			switch (direction) {
				case 'N':
					currentY--;
					break;
				case 'E':
					currentX++;
					break;
				case 'S':
					currentY++;
					break;
				case 'W':
					currentX--;
					break;
				default:
					console.warn(`Invalid direction for value ${value} at ${currentX},${currentY}`);
					return path;
			}

			if (currentX < 0 || currentX >= cols || currentY < 0 || currentY >= rows) {
				console.warn('Path went out of bounds');
				return path;
			}

			path.push([currentX, currentY]);
		}

		return path;
	}

	// Main generation method that orchestrates the entire process
	generate() {
		const nodes = this.generateCoarseGridNodes();
		const spanningTree = this.generateSpanningTree(nodes);
		const intersectionPoints = this.generateIntersectionPoints(spanningTree);
		const bitmaskValues = this.calculateBitmaskValues(nodes, intersectionPoints);
		const path = this.generatePath(bitmaskValues);

		return {
			nodes,
			spanningTree,
			intersectionPoints,
			bitmaskValues,
			path
		};
	}
}

class SpaceFillingVisualizer {
	constructor(cellSize) {
		this.cellSize = cellSize;
		this.data = null;
	}

	setData(data) {
		this.data = data;
	}

	draw() {
		if (!this.data) return;

		this.drawGrid();
		this.drawSpanningTree();
		this.drawIntersectionPoints();
		this.drawBitmaskValues();
		this.drawSpaceFillingCurve();
	}

	drawGrid() {
		// Draw 8x8 grid
		stroke(200);
		strokeWeight(1);
		for (let i = 0; i < this.data.bitmaskValues.length; i++) {
			for (let j = 0; j < this.data.bitmaskValues[0].length; j++) {
				let x = i * this.cellSize;
				let y = j * this.cellSize;
				fill(255);
				rect(x, y, this.cellSize, this.cellSize);
			}
		}

		// Draw 4x4 subgrid
		stroke(100);
		strokeWeight(2);
		for (let i = 0; i < this.data.bitmaskValues.length; i += 2) {
			for (let j = 0; j < this.data.bitmaskValues[0].length; j += 2) {
				let x = i * this.cellSize;
				let y = j * this.cellSize;
				noFill();
				rect(x, y, this.cellSize * 2, this.cellSize * 2);
			}
		}
	}

	drawSpanningTree() {
		stroke(0, 0, 255);
		strokeWeight(2);
		for (let [start, end] of this.data.spanningTree) {
			line(
				start.x * this.cellSize,
				start.y * this.cellSize,
				end.x * this.cellSize,
				end.y * this.cellSize
			);
		}

		noStroke();
		fill(0, 0, 255);
		for (let node of this.data.nodes) {
			ellipse(node.x * this.cellSize, node.y * this.cellSize, 12, 12);
		}
	}

	drawIntersectionPoints() {
		noStroke();
		fill(0, 0, 255);
		for (let [x, y] of this.data.intersectionPoints) {
			ellipse(x * this.cellSize, y * this.cellSize, 8, 8);
		}
	}

	drawBitmaskValues() {
		textAlign(CENTER, CENTER);
		textSize(16);
		textStyle(BOLD);

		for (let i = 0; i < this.data.bitmaskValues.length; i++) {
			for (let j = 0; j < this.data.bitmaskValues[0].length; j++) {
				let x = i * this.cellSize + this.cellSize / 2;
				let y = j * this.cellSize + this.cellSize / 2;

				noStroke();
				fill(255, 255, 255, 200);
				rect(x - 12, y - 12, 24, 24);

				fill(0, 100, 0);
				text(this.data.bitmaskValues[i][j], x, y);
			}
		}
	}

	drawSpaceFillingCurve() {
		if (this.data.path.length < 2) return;

		stroke(255, 0, 0);
		strokeWeight(3);
		noFill();

		beginShape();
		for (let [x, y] of this.data.path) {
			vertex(x * this.cellSize + this.cellSize / 2, y * this.cellSize + this.cellSize / 2);
		}
		endShape();
	}
}
