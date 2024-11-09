let grid;
let cols = 8;
let rows = 8;
let cellSize = 50; // Size of each cell for the 8x8 grid

function setup() {
	createCanvas(400, 400);
	grid = new SpaceFillingGrid(cols, rows, cellSize);
	grid.generateSpanningTree();
}

function draw() {
	background(255);
	grid.showGrid();
	grid.showSpanningTree();
	grid.showIntersectionPoints();
	grid.showSpaceFillingCurve();
}

class SpaceFillingGrid {
	constructor(cols, rows, cellSize) {
		this.cols = cols;
		this.rows = rows;
		this.cellSize = cellSize;
		this.subGridSize = 2;
		this.spanningTree = []; // Store tree connections
		this.intersectionPoints = new Set(); // Store intersection points
		this.nodes = []; // Center nodes of 2x2 subgrids
		this.bitmaskValues = []; // Bitmask values for each cell
		this.spaceFillPath = []; // Store the path points

		// Initialize grid and bitmask values
		for (let i = 0; i < cols; i++) {
			this.bitmaskValues[i] = [];
			for (let j = 0; j < rows; j++) {
				this.bitmaskValues[i][j] = 0;
			}
		}

		// Calculate center nodes in 2x2 subgrids
		for (let i = 0; i < cols; i += this.subGridSize) {
			for (let j = 0; j < rows; j += this.subGridSize) {
				let x = i + 1;
				let y = j + 1;
				this.nodes.push(createVector(x, y)); // Center of each 2x2 subgrid
			}
		}
	}

	generateSpanningTree() {
		// Randomized depth-first traversal to create a spanning tree
		let stack = [];
		let visited = new Set();

		// Start with a random node
		let startNode = this.nodes[floor(random(this.nodes.length))];
		stack.push(startNode);
		visited.add(`${startNode.x},${startNode.y}`);

		while (stack.length > 0) {
			let current = stack.pop();

			// Find unvisited neighbors
			let neighbors = this.getNeighbors(current);
			let unvisitedNeighbors = neighbors.filter((n) => !visited.has(`${n.x},${n.y}`));

			if (unvisitedNeighbors.length > 0) {
				stack.push(current);

				// Pick a random neighbor to visit next
				let next = random(unvisitedNeighbors);
				this.spanningTree.push([current, next]);

				// Calculate and store intersection points
				this.calculateIntersectionPoints(current, next);

				// Mark as visited and add to stack
				visited.add(`${next.x},${next.y}`);
				stack.push(next);
			}
		}

		// After generating the spanning tree and intersection points,
		// calculate the bitmask values
		this.calculateBitmaskValues();
		this.generateSpaceFillingCurve();
	}

	calculateIntersectionPoints(start, end) {
		// If vertical connection
		if (start.x === end.x) {
			let minY = min(start.y, end.y);
			let maxY = max(start.y, end.y);
			for (let y = minY + 1; y < maxY; y++) {
				this.intersectionPoints.add(`${start.x},${y}`);
			}
		}
		// If horizontal connection
		else if (start.y === end.y) {
			let minX = min(start.x, end.x);
			let maxX = max(start.x, end.x);
			for (let x = minX + 1; x < maxX; x++) {
				this.intersectionPoints.add(`${x},${start.y}`);
			}
		}
	}

	getNeighbors(node) {
		// Get neighboring nodes for a given node in the spanning tree
		let directions = [
			createVector(0, -2), // Up
			createVector(2, 0), // Right
			createVector(0, 2), // Down
			createVector(-2, 0) // Left
		];
		let neighbors = [];

		for (let dir of directions) {
			let neighbor = createVector(node.x + dir.x, node.y + dir.y);
			if (neighbor.x >= 1 && neighbor.x < this.cols && neighbor.y >= 1 && neighbor.y < this.rows) {
				neighbors.push(neighbor);
			}
		}
		return neighbors;
	}

	calculateBitmaskValues() {
		// Reset bitmask values
		for (let i = 0; i < this.cols; i++) {
			for (let j = 0; j < this.rows; j++) {
				this.bitmaskValues[i][j] = 0;
			}
		}

		// Helper function to check if a point exists in spanning tree nodes or intersection points
		const hasPoint = (x, y) => {
			const key = `${x},${y}`;
			const isSpanningTreeNode = this.nodes.some((node) => node.x === x && node.y === y);
			const isIntersectionPoint = this.intersectionPoints.has(key);
			return isSpanningTreeNode || isIntersectionPoint;
		};

		// Calculate bitmask for each cell
		for (let i = 0; i < this.cols; i++) {
			for (let j = 0; j < this.rows; j++) {
				// Check each corner of the cell
				if (hasPoint(i, j)) this.bitmaskValues[i][j] += 1; // Top-left (1)
				if (hasPoint(i + 1, j)) this.bitmaskValues[i][j] += 2; // Top-right (2)
				if (hasPoint(i + 1, j + 1)) this.bitmaskValues[i][j] += 4; // Bottom-right (4)
				if (hasPoint(i, j + 1)) this.bitmaskValues[i][j] += 8; // Bottom-left (8)
			}
		}
	}

	showGrid() {
		// Draw the 8x8 grid
		stroke(200);
		strokeWeight(1);
		for (let i = 0; i < this.cols; i++) {
			for (let j = 0; j < this.rows; j++) {
				let x = i * this.cellSize;
				let y = j * this.cellSize;
				fill(255);
				rect(x, y, this.cellSize, this.cellSize);
			}
		}

		// Draw the 4x4 subgrid
		stroke(100);
		strokeWeight(2);
		for (let i = 0; i < this.cols; i += 2) {
			for (let j = 0; j < this.rows; j += 2) {
				let x = i * this.cellSize;
				let y = j * this.cellSize;
				noFill();
				rect(x, y, this.cellSize * 2, this.cellSize * 2);
			}
		}

		// Add bitmask values display with better visibility
		textAlign(CENTER, CENTER);
		textSize(16); // Increased text size
		textStyle(BOLD); // Make text bold
		fill(0, 100, 0); // Dark green color for better visibility
		for (let i = 0; i < this.cols; i++) {
			for (let j = 0; j < this.rows; j++) {
				let x = i * this.cellSize + this.cellSize / 2;
				let y = j * this.cellSize + this.cellSize / 2;

				// Draw value with white background for better readability
				noStroke();
				fill(255, 255, 255, 200); // Semi-transparent white background
				rect(x - 12, y - 12, 24, 24);

				// Draw the actual number
				fill(0, 100, 0);
				text(this.bitmaskValues[i][j], x, y);
			}
		}

		// Add direction indicators
		textSize(12);
		for (let i = 0; i < this.cols; i++) {
			for (let j = 0; j < this.rows; j++) {
				let x = i * this.cellSize + this.cellSize / 2;
				let y = j * this.cellSize + this.cellSize / 2;

				const direction = this.getDirectionFromBitmask(this.bitmaskValues[i][j]);
				if (direction) {
					fill(200, 0, 0);
					text(direction, x, y + 15);
				}
			}
		}
	}

	showSpanningTree() {
		// Draw the spanning tree connections
		stroke(0, 0, 255);
		strokeWeight(2);
		for (let [start, end] of this.spanningTree) {
			let x1 = start.x * this.cellSize;
			let y1 = start.y * this.cellSize;
			let x2 = end.x * this.cellSize;
			let y2 = end.y * this.cellSize;
			line(x1, y1, x2, y2);
		}

		// Draw main nodes at the center of each 2x2 subgrid
		noStroke();
		fill(0, 0, 255);
		for (let node of this.nodes) {
			let x = node.x * this.cellSize;
			let y = node.y * this.cellSize;
			ellipse(x, y, 12, 12); // Larger dots for main nodes
		}
	}

	showIntersectionPoints() {
		// Draw intersection points
		noStroke();
		fill(0, 0, 255);
		for (let point of this.intersectionPoints) {
			let [x, y] = point.split(',').map(Number);
			ellipse(x * this.cellSize, y * this.cellSize, 8, 8); // Smaller dots for intersection points
		}
	}

	getDirectionFromBitmask(value) {
		// Define direction based on bitmask value
		if ([2, 6, 14].includes(value)) return 'N';
		if ([4, 12, 13].includes(value)) return 'E';
		if ([8, 9, 11].includes(value)) return 'S';
		if ([1, 3, 7].includes(value)) return 'W';
		return ''; // No valid direction
	}

	generateSpaceFillingCurve() {
		// Start from top-left cell
		let currentX = 0;
		let currentY = 0;
		this.spaceFillPath = [[currentX, currentY]];

		while (this.spaceFillPath.length < this.cols * this.rows) {
			const value = this.bitmaskValues[currentX][currentY];
			const direction = this.getDirectionFromBitmask(value);

			// Move to next cell based on direction
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
					return; // Stop if no valid direction found
			}

			// Check if we're still within bounds
			if (currentX < 0 || currentX >= this.cols || currentY < 0 || currentY >= this.rows) {
				console.warn('Path went out of bounds');
				return;
			}

			this.spaceFillPath.push([currentX, currentY]);
		}
	}

	showSpaceFillingCurve() {
		if (this.spaceFillPath.length < 2) return;

		stroke(255, 0, 0);
		strokeWeight(3);
		noFill();

		beginShape();
		for (let [x, y] of this.spaceFillPath) {
			// Draw at cell centers
			const centerX = x * this.cellSize + this.cellSize / 2;
			const centerY = y * this.cellSize + this.cellSize / 2;
			vertex(centerX, centerY);
		}
		endShape();
	}
}
