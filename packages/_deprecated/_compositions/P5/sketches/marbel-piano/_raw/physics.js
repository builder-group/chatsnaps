// // const PAST_POSITIONS_LENGTH = 0 // don't check for loops, they don't seem to exist anymore

// class CompressedBall {
// 	constructor(ball) {
// 		this.id = ball.id;
// 		this.posX = ball.pos.x;
// 		this.posY = ball.pos.y;
// 	}
// 	get color() {
// 		return Ball.CompressMap.get(this.id).color;
// 	}
// 	get duration() {
// 		return Ball.CompressMap.get(this.id).duration;
// 	}
// }
// class Ball {
// 	static CompressMap = new Map();
// 	static nextId = 0;
// 	static from(b) {
// 		if (b instanceof Ball) {
// 			return b;
// 		}
// 		if (b instanceof CompressedBall) {
// 			const b2 = Ball.CompressMap.get(b.id).copy();
// 			b2.pos.x = b.posX;
// 			b2.pos.y = b.posY;
// 			return b2;
// 		}
// 	}
// 	constructor(pos, vel, radius, restitution, id = Ball.nextId, normal = { x: 0, y: 0 }) {
// 		Ball.nextId = Math.max(Ball.nextId, id + 1);
// 		this.id = id;
// 		this.active = true;
// 		this.resting = 0;
// 		this.pos = pos;
// 		this.vel = vel;
// 		this.radius = radius;
// 		this.restitution = restitution;

// 		this.normal = normal;
// 		this.collided = 0; // bit flags
// 		this.lookupFrames = [];
// 		this.lookupFramesIndex = -1;

// 		this.nextCollisionIndex = -1;

// 		this.maxInfluencedBallId = id;
// 		this.collidedWithBall = -1;

// 		this.state = 0;

// 		this.color = null;
// 		this.floorCount = 0;
// 		this.duration = 0;
// 	}
// 	collidedWith(s) {
// 		return (this.collided & s) !== 0;
// 	}
// 	copy(id = this.id) {
// 		const b = new Ball(
// 			{ x: this.pos.x, y: this.pos.y },
// 			{ x: this.vel.x, y: this.vel.y },
// 			this.radius,
// 			this.restitution,
// 			id,
// 			this.normal
// 		);
// 		b.active = this.active;
// 		b.radius = this.radius;
// 		b.restitution = this.restitution;
// 		b.collided = this.collided;
// 		b.lookupFrames = this.lookupFrames;
// 		b.nextCollisionIndex = this.nextCollisionIndex;
// 		b.maxInfluencedBallId = id;
// 		b.collidedWithBall = this.collidedWithBall;
// 		b.state = this.state;
// 		b.color = this.color;
// 		b.floorCount = this.floorCount;
// 		b.duration = this.duration;
// 		return b;
// 	}
// 	compressed() {
// 		if (!Ball.CompressMap.has(this.id)) {
// 			Ball.CompressMap.set(this.id, this);
// 		}
// 		return new CompressedBall(this);
// 	}
// 	shouldCollide(x, y, r) {
// 		const dx = this.pos.x - x;
// 		const dy = this.pos.y - y;
// 		r += this.radius;
// 		if (Math.abs(dx) < r && Math.abs(dy) < r) {
// 			const distSq = dx * dx + dy * dy;
// 			if (distSq < r * r) {
// 				const dist = Math.sqrt(distSq);
// 				this.normal.x = dx / dist;
// 				this.normal.y = dy / dist;
// 				return dist;
// 			}
// 		}
// 		return false;
// 	}
// 	bounce(nx, ny, restitution, reverse = false) {
// 		const dot = nx * this.vel.x + ny * this.vel.y;
// 		if (dot < 0) {
// 			let r = restitution * this.restitution;
// 			if (reverse) {
// 				r = 1 / r;
// 			}
// 			const k = -dot * (1 + r);
// 			this.vel.x += nx * k;
// 			this.vel.y += ny * k;
// 		}
// 	}
// 	resolveBallCollision(other, nx, ny, dist) {
// 		const vx = this.vel.x - other.vel.x;
// 		const vy = this.vel.y - other.vel.y;
// 		const dot = nx * vx + ny * vy;
// 		this.vel.x -= nx * dot;
// 		this.vel.y -= ny * dot;
// 		other.vel.x += nx * dot;
// 		other.vel.y += ny * dot;

// 		const delta = (this.radius + other.radius - dist) / 2;
// 		this.pos.x += delta * nx;
// 		this.pos.y += delta * ny;
// 		other.pos.x -= delta * nx;
// 		other.pos.y -= delta * ny;
// 	}
// }

// class Pegs {
// 	/**
// 	 * @param {number} xSpacing
// 	 * @param {number} ySpacing
// 	 * @param {number} radius
// 	 * @param {number} restitution
// 	 */
// 	constructor(xSpacing, ySpacing, radius, restitution) {
// 		this.xSpacing = xSpacing;
// 		this.ySpacing = ySpacing;
// 		this.radius = radius;
// 		this.restitution = restitution;

// 		this.peg = { x: 0, y: 0 };
// 		/** @type {{x1?: number, y1?: number, x2?: number, y2?: number}} */
// 		this.bounds = {};
// 	}
// 	copy() {
// 		const pegs = new Pegs(this.xSpacing, this.ySpacing, this.radius, this.restitution);
// 		pegs.bounds = this.bounds;
// 		return pegs;
// 	}
// 	setBounds(bounds) {
// 		this.bounds = bounds;
// 	}
// 	getClosestPeg(x, y) {
// 		const row = Math.round(y / this.ySpacing);
// 		this.peg.y = row * this.ySpacing;

// 		const offset = row % 2 === 0 ? 0 : 0.5;
// 		this.peg.x = (Math.round(x / this.xSpacing - offset) + offset) * this.xSpacing;

// 		if (
// 			(this.bounds.x1 && this.peg.x < this.bounds.x1) ||
// 			(this.bounds.y1 && this.peg.y < this.bounds.y1) ||
// 			(this.bounds.x2 && this.peg.x > this.bounds.x2) ||
// 			(this.bounds.y2 && this.peg.y > this.bounds.y2)
// 		) {
// 			return null;
// 		}
// 		return this.peg;
// 	}
// 	getPegY2() {
// 		const y = this.bounds.y2;
// 		const row = Math.floor(y / this.ySpacing);
// 		return row * this.ySpacing;
// 	}
// 	getFloorX(xBin, escape) {
// 		const dx = Math.round((escape.x - escape.startX) / this.xSpacing) * this.xSpacing;

// 		const px = this.getClosestPeg(0, this.getPegY2()).x;
// 		return xBin * this.xSpacing + px - escape.startX - dx;
// 	}
// 	forEachPeg(x1, y1, x2, y2, cb) {
// 		x1 = this.bounds.x1 || x1;
// 		y1 = this.bounds.y1 || y1;
// 		x2 = this.bounds.x2 || x2;
// 		y2 = this.bounds.y2 || y2;
// 		let odd = false;
// 		let y = y1;
// 		while (y < y2) {
// 			let x = x1;
// 			x += odd ? this.xSpacing / 2 : 0;
// 			while (x <= x2) {
// 				cb(x, y);
// 				x += this.xSpacing;
// 			}
// 			y += this.ySpacing;
// 			odd = !odd;
// 		}
// 	}
// }

// class CollisionLookup {
// 	constructor(dt, gravity, ball, pegs) {
// 		// todo: just copy the engine
// 		this.pegs = pegs.copy();
// 		this.pegs.bounds = {};
// 		ball.pos.x = 0;
// 		ball.pos.y = -pegs.radius - ball.radius;
// 		ball.vel.x = 1 / 2;
// 		ball.vel.y = 0;
// 		this.engine = new Engine(dt, gravity, [ball]);
// 		this.engine.addPegs(this.pegs);
// 		this.ball = ball;

// 		this.cache = new Map();
// 	}
// 	/** @param filter {(collisionIndex:number,px:number,py:number)=>number} */
// 	addFilter(filter) {
// 		this.filter = filter;
// 	}
// 	generateCollisions(n, thresholdPegY = 17 * 50) {
// 		const ball = this.ball;

// 		let collisions = [];
// 		let escapes = [];
// 		let prevCollided = false;
// 		let frames = 0;
// 		let maxPegY = 10;
// 		let offsetPegY = 0;
// 		let prevPeg = {};

// 		let cachedCollisions = localStorage.getItem('collisions');
// 		let cachedEscapes = localStorage.getItem('escapes');
// 		let cachedCollisionThresholdIndex = localStorage.getItem('collisionThresholdIndex');
// 		if (cachedCollisions && cachedEscapes) {
// 			collisions = JSON.parse(cachedCollisions);
// 			escapes = JSON.parse(cachedEscapes);
// 			escapes.forEach((e) => {
// 				e.lastCollision = collisions[e.lastCollisionIndex];
// 			});
// 			this.collisionThresholdIndex = JSON.parse(cachedCollisionThresholdIndex);
// 		}

// 		while (collisions.length < n) {
// 			this.engine.step();
// 			frames++;
// 			const collided = ball.collidedWith(Engine.COLLISION_PEG);

// 			const peg = this.pegs.getClosestPeg(ball.pos.x, ball.pos.y);

// 			const currentPegY = peg.y + offsetPegY;
// 			if (currentPegY > thresholdPegY && currentPegY > maxPegY) {
// 				const startPeg = this.pegs.getClosestPeg(ball.pos.x, maxPegY - offsetPegY);

// 				const lastCollision = collisions[collisions.length - 1];
// 				const escape = {
// 					lastCollision,
// 					frames,
// 					// relative to the peg of the most recent collision
// 					x: ball.pos.x,
// 					y: ball.pos.y,
// 					vx: ball.vel.x,
// 					vy: ball.vel.y,
// 					startX: startPeg.x,
// 					startY: prevPeg.y
// 				};
// 				escapes.push(escape);
// 				maxPegY = currentPegY;
// 			}

// 			// exit collisions only
// 			if (prevCollided && !collided) {
// 				ball.pos.x -= peg.x;
// 				ball.pos.y -= peg.y;
// 				const collision = {
// 					index: collisions.length,
// 					frames: frames,
// 					x: ball.pos.x,
// 					y: ball.pos.y,
// 					px: peg.x,
// 					py: peg.y,
// 					vx: ball.vel.x,
// 					vy: ball.vel.y,
// 					nx: ball.normal.x,
// 					ny: ball.normal.y
// 				};
// 				frames = 0;

// 				if (currentPegY > thresholdPegY && this.collisionThresholdIndex == null) {
// 					this.collisionThresholdIndex = collisions.length;
// 					console.log('threshl', this.collisionThresholdIndex);
// 				}

// 				collisions.push(collision);

// 				offsetPegY += peg.y;
// 			}

// 			prevCollided = collided;
// 			prevPeg = peg;
// 		}

// 		// if (!(cachedCollisions && cachedEscapes)) {
// 		//   localStorage.setItem('collisions', JSON.stringify(collisions))
// 		//   localStorage.setItem('escapes', JSON.stringify(escapes.map(e => {
// 		//     const { lastCollision, ...e2 } = e
// 		//     e2.lastCollisionIndex = lastCollision.index
// 		//     return e2
// 		//   })))
// 		//   localStorage.setItem('collisionThresholdIndex', JSON.stringify(this.collisionThresholdIndex))
// 		// }
// 		let avgSpeed = 0;
// 		let maxSpeed = 0;
// 		for (let { vx, vy } of collisions) {
// 			const s = vx * vx + vy * vy;
// 			avgSpeed += s;
// 			maxSpeed = Math.max(maxSpeed, s);
// 		}
// 		avgSpeed = Math.sqrt(avgSpeed / collisions.length);
// 		maxSpeed = Math.sqrt(maxSpeed);

// 		this.collisions = collisions;
// 		this.avgSpeed = avgSpeed;
// 		this.maxSpeed = maxSpeed;
// 		this.escapes = escapes;
// 		console.log(this.escapes.length);

// 		const N = 32;
// 		this.angleBins = [];
// 		for (let i = 0; i < N; i++) {
// 			this.angleBins.push([]);
// 		}
// 		const points = [...this.collisions];
// 		points.splice(0, this.collisionThresholdIndex);
// 		for (let p of points) {
// 			const angle = (Math.atan2(p.ny, p.nx) / Math.PI / 2 + 1) % 1;
// 			this.angleBins[Math.floor(angle * N)].push(p);
// 		}
// 	}
// 	generateEscapes(endY = 17 * 10, numBins = 8, velPow = 4) {
// 		this.endY = endY - this.ball.radius;
// 		// let s = 0
// 		let i = 0;
// 		for (let escape of this.escapes) {
// 			if (i++ === 0) {
// 				// console.log(escape)
// 			}
// 			while (escape.y - escape.startY < endY) {
// 				// while (escape.y - escape.startY < endY) {
// 				escape.x += escape.vx * this.engine.dt;
// 				escape.y += escape.vy * this.engine.dt;
// 				escape.vy += this.engine.g;
// 				escape.frames++;
// 			}
// 			// x distance from startX = (escape.x - escape.startX)
// 			// s = Math.max(s, escape.y - (endY))
// 		}

// 		this.escapes.sort((a, b) => a.vy - b.vy);
// 		this.escapes.shift();

// 		this.escapeBins = Array(numBins)
// 			.fill(0)
// 			.map(() => []);

// 		// equal sized bins
// 		// const M = this.escapes.length / numBins
// 		// for (let i = 0; i < this.escapes.length; i++) {
// 		//   const index = Math.floor(i / M)
// 		//   this.escapeBins[index].push(this.escapes[i])
// 		// }

// 		// bin by velocity
// 		const minVel = this.escapes[0].vy;
// 		const maxVel = this.escapes[this.escapes.length - 1].vy;

// 		this.getEscapeBinIndex = (vy) => {
// 			// debugger

// 			let k = (vy - minVel) / (maxVel - minVel);
// 			k = 1 - Math.pow(1 - k, velPow);
// 			const index = Math.min(numBins - 1, Math.floor(k * numBins));
// 			return index;
// 		};
// 		const xSpacing = this.pegs.xSpacing;
// 		const radius = xSpacing / 2 - this.ball.radius * 2;

// 		for (let escape of this.escapes) {
// 			const dx = escape.x - escape.startX;
// 			const endX = Math.round(dx / xSpacing) * xSpacing;
// 			if (Math.abs(dx - endX) < radius) {
// 				this.escapeBins[this.getEscapeBinIndex(escape.vy)].push(escape);
// 			}
// 			// this.escapeBins[this.getEscapeBinIndex(escape.vy)].push(escape)
// 		}
// 		console.log(this.escapeBins);
// 	}
// 	lookupClosestCollision(nx, ny, vx, vy, px, py) {
// 		const K = 8;
// 		const normK = this.avgSpeed * K;

// 		const angle = (Math.atan2(ny, nx) / Math.PI / 2 + 1) % 1;

// 		let getDist = (c) => {
// 			const dvx = c.vx - vx;
// 			const dvy = c.vy - vy;
// 			const dnx = normK * (c.nx - nx);
// 			const dny = normK * (c.ny - ny);
// 			return dvx * dvx + dvy * dvy + dnx * dnx + dny * dny;
// 		};
// 		if (this.filter) {
// 			const oldGetDist = getDist;
// 			getDist = (c) => {
// 				const d1 = oldGetDist(c);
// 				const d2 = this.filter(c.index, px, py) * this.avgSpeed;
// 				return d1 + d2;
// 			};
// 		}

// 		const key = angle / (vx + vy + 1);
// 		const value = this.cache.get(key);
// 		if (value != null) {
// 			// don't care about hash collisions
// 			return value;
// 		}

// 		const index2 = Math.floor(angle * this.angleBins.length * 2);
// 		let bin1 = Math.floor(index2 / 2);
// 		let bin2 = bin1 + (index2 % 2 === 0 ? -1 : 1);

// 		this.lastBin = bin1;
// 		let closestI = this.collisions.length - 1;
// 		let closestDist = Infinity;
// 		const searchBin = (binIndex) => {
// 			const bin = this.angleBins[(binIndex + this.angleBins.length) % this.angleBins.length];
// 			for (let c of bin) {
// 				const dist = getDist(c);
// 				if (dist < closestDist) {
// 					closestDist = dist;
// 					closestI = c.index;
// 				}
// 			}
// 		};
// 		searchBin(bin1);
// 		searchBin(bin2);
// 		this.cache.set(key, closestI);
// 		return closestI;
// 	}
// }
// class Engine {
// 	static COLLISION_BALL = 0b001;
// 	static COLLISION_PEG = 0b010;
// 	static COLLISION_FLOOR = 0b100;

// 	/**
// 	 * @param dt {number}
// 	 * @param gravity {number}
// 	 * @param balls {Ball[]}
// 	 * @param transitionFactor {number}
// 	 */
// 	constructor(dt, gravity, balls = [], transitionFactor = 1) {
// 		this.dt = dt;
// 		this.g = gravity * dt;
// 		this.balls = balls;
// 		this.transitionFactor = transitionFactor; // near 0: converge-y, >1: diverge-y
// 		this.ballCollisions = [];
// 		this.pegCollisions = [];
// 		this.floorCollisions = [];
// 		this.binCollisions = [];
// 	}
// 	addBins({ top, spacing, offset, radius, restitution }) {
// 		this.bins = { top, spacing, offset, radius, restitution };
// 	}
// 	addFloor({ y, restitution }) {
// 		this.floor = { y, restitution };
// 	}
// 	/**
// 	 *
// 	 * @param pegs {Pegs}
// 	 */
// 	addPegs(pegs) {
// 		this.pegs = pegs;
// 	}
// 	generateCollisions(n, ball) {
// 		this.lookup = new CollisionLookup(this.dt, this.g / this.dt, ball.copy(), this.pegs);
// 		this.lookup.generateCollisions(n);
// 	}
// 	step() {
// 		this.ballCollisions.length = 0;
// 		this.pegCollisions.length = 0;
// 		this.floorCollisions.length = 0;
// 		this.binCollisions.length = 0;
// 		// y is down
// 		// const g = this.gravity * this.dt

// 		const restThres = 16 * 30;

// 		// momentum + gravity first half
// 		for (let b of this.balls) {
// 			if (!b.active) continue;
// 			b.collided = 0;
// 			b.collidedWithBall = -1;
// 			if (b.resting > restThres) continue;
// 			const dx = b.pos.x - b.pos.prevX;
// 			const dy = b.pos.y - b.pos.prevY;
// 			if (dx * dx + dy * dy < 3e-6) {
// 				b.resting++;
// 				if (b.resting > restThres) {
// 					// console.log('rest')
// 				}
// 			} else {
// 				b.resting = 0;
// 			}
// 			if (dx * dx + dy * dy < 1e-4) {
// 				b.silent = true;
// 			} else {
// 				b.silent = false;
// 			}
// 			b.pos.prevX = b.pos.x;
// 			b.pos.prevY = b.pos.y;

// 			b.pos.x += b.vel.x * this.dt;
// 			b.pos.y += b.vel.y * this.dt;

// 			b.vel.y += this.g / 2;

// 			// if (b.hitFloor > 0) {
// 			//   b.hitFloor++
// 			// }
// 		}

// 		// ball-peg collisions
// 		if (this.pegs) {
// 			for (let b of this.balls) {
// 				if (!b.active || b.resting > restThres) continue;
// 				const peg = this.pegs.getClosestPeg(b.pos.x, b.pos.y);
// 				if (peg && b.shouldCollide(peg.x, peg.y, this.pegs.radius) !== false) {
// 					const vx0 = b.vel.x;
// 					const vy0 = b.vel.y;

// 					b.bounce(b.normal.x, b.normal.y, this.pegs.restitution);
// 					b.collided |= Engine.COLLISION_PEG;

// 					if (b.pos.y > 0) {
// 						const dx = vx0 - b.vel.x;
// 						const dy = vy0 - b.vel.y;
// 						this.pegCollisions.push(Math.sqrt(dx * dx + dy * dy));
// 					}
// 				}
// 			}
// 		}
// 		if (this.bins) {
// 			for (let b of this.balls) {
// 				if (!b.active || b.resting > restThres) continue;
// 				const r = b.radius + this.bins.radius;
// 				if (b.pos.y < this.bins.top - r) continue;
// 				const wallX =
// 					Math.round((b.pos.x - this.bins.offset) / this.bins.spacing) * this.bins.spacing;

// 				if (b.pos.y < this.bins.top) {
// 					if (b.shouldCollide(wallX, this.bins.top, this.bins.radius) !== false) {
// 						const vx0 = b.vel.x;
// 						const vy0 = b.vel.y;

// 						b.bounce(b.normal.x, b.normal.y, this.bins.restitution);
// 						b.collided |= Engine.COLLISION_PEG;

// 						const dx = vx0 - b.vel.x;
// 						const dy = vy0 - b.vel.y;
// 						this.binCollisions.push(Math.sqrt(dx * dx + dy * dy));
// 					}
// 				} else if (Math.abs(b.pos.x - wallX) < r) {
// 					const vx0 = b.vel.x;
// 					const vy0 = b.vel.y;

// 					const nx = Math.sign(b.pos.x - wallX);
// 					let adjustment = 1;
// 					// adjustment = 3 + 0.0015
// 					b.bounce(nx, 0, this.bins.restitution * adjustment);
// 					b.collided |= Engine.COLLISION_PEG;

// 					if (b.pos.x < wallX) {
// 						b.pos.x = wallX - r;
// 					} else {
// 						b.pos.x = wallX + r;
// 					}

// 					if (!b.silent) {
// 						const dx = vx0 - b.vel.x;
// 						const dy = vy0 - b.vel.y;
// 						this.binCollisions.push(Math.sqrt(dx * dx + dy * dy));
// 					}
// 				}
// 			}
// 		}

// 		if (this.floor) {
// 			for (let b of this.balls) {
// 				if (b.floorCount > 0) {
// 					b.floorCount++;
// 					continue;
// 				}
// 				if (!b.active || b.resting > restThres) continue;
// 				if (b.pos.y > this.floor.y - b.radius) {
// 					// if (b.hitFloor === 0) {
// 					//   b.hitFloor++
// 					// }
// 					b.floorCount++;
// 					const vx0 = b.vel.x;
// 					const vy0 = b.vel.y;
// 					b.bounce(0, -1, this.floor.restitution);
// 					b.collided |= Engine.COLLISION_FLOOR;

// 					b.pos.y = this.floor.y - b.radius;

// 					// if (b.pos.y > 0 && !b.silent) {
// 					//   const dx = vx0 - b.vel.x
// 					//   const dy = vy0 - b.vel.y
// 					//   this.floorCollisions.push(Math.sqrt(dx * dx + dy * dy))
// 					// }
// 				}
// 			}
// 		}

// 		// ball-ball collisions
// 		// const sortedBalls = [...this.balls]
// 		// sortedBalls.sort((a, b) => a.pos.y - b.pos.y)
// 		// for (let i = sortedBalls.length - 1; i >= 0; i--) {
// 		//   const b = sortedBalls[i]
// 		//   if (b.resting > restThres) {
// 		//     if (i === 0) {
// 		//       sortedBalls.length = 0
// 		//       break
// 		//     }
// 		//     continue
// 		//   }

// 		//   const y = b.pos.y + b.radius * 2

// 		//   while (sortedBalls.length > 0) {
// 		//     const b2 = sortedBalls.pop()
// 		//     if (b2.pos.y <= y) {
// 		//       sortedBalls.push(b2)
// 		//       break
// 		//     }
// 		//   }

// 		//   break
// 		// }
// 		// // if (Math.random() < 0.1) {
// 		// //   console.log(sortedBalls.length)
// 		// // }
// 		// let pastBalls = []
// 		// for (let i = 0; i < sortedBalls.length; i++) {
// 		//   const b1 = sortedBalls[i]
// 		//   if (!b1.active) continue
// 		//   const b1Rest = b1.resting > restThres
// 		//   for (let j = pastBalls.length - 1; j >= 0; j--) {
// 		//     const b2 = pastBalls[j]
// 		//     const b2Rest = b2.resting > restThres
// 		//     if (!b2.active) continue
// 		//     // they all should have the same radius
// 		//     if (b1.pos.y - b2.pos.y > b1.radius * 2) {
// 		//       pastBalls.pop()
// 		//     } else {
// 		//       if (b1Rest && b2Rest) continue

// 		//       const dist = b1.shouldCollide(b2.pos.x, b2.pos.y, b2.radius)
// 		//       if (dist !== false) {
// 		//         const vx0 = b1.vel.x
// 		//         const vy0 = b1.vel.y

// 		//         if (b1Rest) {
// 		//           b2.bounce(-b1.normal.x, -b1.normal.y, b1.restitution)
// 		//           const delta = (b2.radius + b1.radius - dist)
// 		//           b2.pos.x += delta * -b1.normal.x
// 		//           b2.pos.y += delta * -b1.normal.y
// 		//         } else if (b2Rest) {
// 		//           b1.bounce(b1.normal.x, b1.normal.y, b2.restitution)
// 		//           const delta = (b1.radius + b2.radius - dist)
// 		//           b1.pos.x += delta * b1.normal.x
// 		//           b1.pos.y += delta * b1.normal.y
// 		//         } else {
// 		//           b1.resolveBallCollision(b2, b1.normal.x, b1.normal.y, dist)
// 		//         }
// 		//         b1.collided |= Engine.COLLISION_BALL
// 		//         b2.collided |= Engine.COLLISION_BALL

// 		//         let b = b1Rest ? b2 : b1
// 		//         if (b.pos.y > 0 && !b.silent) {
// 		//           const dx = vx0 - b.vel.x
// 		//           const dy = vy0 - b.vel.y
// 		//           this.ballCollisions.push(Math.sqrt(dx * dx + dy * dy))
// 		//         }
// 		//       }
// 		//     }
// 		//   }
// 		//   pastBalls.unshift(b1)
// 		// }

// 		// gravity second half
// 		for (let b of this.balls) {
// 			if (!b.active || b.resting > restThres) continue;
// 			b.vel.y += this.g / 2;
// 		}
// 	}

// 	genLookupFrames(b, x, y, vx, vy, frames, collideWithPegs = true) {
// 		// b.lookupFrames.length = 0
// 		b.lookupFrames = [];
// 		// b.lookupFramesIndex = 0
// 		const b0 = b.copy();
// 		b0.pos.x = x;
// 		b0.pos.y = y;
// 		b0.vel.x = vx;
// 		b0.vel.y = vy;
// 		for (let i = 0; i < frames; i++) {
// 			b.lookupFrames.push({
// 				x: b0.pos.x,
// 				y: b0.pos.y,
// 				vx: -b0.vel.x,
// 				vy: -b0.vel.y
// 			});
// 			b0.pos.x += b0.vel.x * this.dt;
// 			b0.pos.y += b0.vel.y * this.dt;
// 			b0.vel.y += this.g / 2;

// 			if (collideWithPegs) {
// 				const peg = this.pegs.getClosestPeg(b0.pos.x, b0.pos.y);
// 				if (peg && b0.shouldCollide(peg.x, peg.y, this.pegs.radius) !== false) {
// 					b0.bounce(b0.normal.x, b0.normal.y, this.pegs.restitution);
// 				}
// 			}
// 			b0.vel.y += this.g / 2;
// 		}
// 		b.lookupFramesIndex = b.lookupFrames.length - 1;
// 		return b0;
// 	}
// 	genLookupFramesFromPeg(b, peg, collisionIndex) {
// 		const c1 = this.lookup.collisions[collisionIndex];
// 		const c0 = this.lookup.collisions[collisionIndex - 1];
// 		const x = peg.x + c0.x - c1.px;
// 		const y = peg.y + c0.y - c1.py;

// 		const b0 = this.genLookupFrames(b, x, y, c0.vx, c0.vy, c1.frames);

// 		b.nextCollisionIndex = collisionIndex - 1;

// 		const dx = b0.vel.x - b.vel.x;
// 		const dy = b0.vel.y - b.vel.y;
// 		this.pegCollisions.push(Math.sqrt(dx * dx + dy * dy));
// 	}
// 	reverseStep() {
// 		this.ballCollisions.length = 0;
// 		this.pegCollisions.length = 0;

// 		for (let b of this.balls) {
// 			if (!b.active) continue;
// 			b.vel.y += this.g / 2;
// 			b.collided = 0;
// 			b.collidedWithBall = -1;
// 		}

// 		// ball-ball collisions
// 		const sortedBalls = [...this.balls];
// 		sortedBalls.sort((a, b) => a.pos.x - b.pos.x);
// 		let pastBalls = [];
// 		for (let i = 0; i < sortedBalls.length; i++) {
// 			const b1 = sortedBalls[i];
// 			if (!b1.active) continue;
// 			for (let j = pastBalls.length - 1; j >= 0; j--) {
// 				const b2 = pastBalls[j];
// 				if (!b2.active) continue;
// 				// // if (b1.nextStateCached && b2.nextStateCached) continue

// 				// they all should have the same radius
// 				if (b1.pos.x - b2.pos.x > b1.radius * 2) {
// 					pastBalls.pop();
// 				} else {
// 					const dist = b1.shouldCollide(b2.pos.x, b2.pos.y, b2.radius);
// 					if (dist !== false) {
// 						const vx0 = b1.vel.x;
// 						const vy0 = b1.vel.y;

// 						b1.resolveBallCollision(b2, b1.normal.x, b1.normal.y, dist);

// 						if (b1.pos.y > 0) {
// 							const dx = vx0 - b1.vel.x;
// 							const dy = vy0 - b1.vel.y;
// 							this.ballCollisions.push(Math.sqrt(dx * dx + dy * dy));
// 						}

// 						b1.collided |= Engine.COLLISION_BALL;
// 						b2.collided |= Engine.COLLISION_BALL;
// 						if (b1.maxInfluencedBallId < b2.maxInfluencedBallId) {
// 							b1.maxInfluencedBallId = b2.maxInfluencedBallId;
// 						} else {
// 							b2.maxInfluencedBallId = b1.maxInfluencedBallId;
// 						}

// 						// b1.nextStateCached = false
// 						// b2.nextStateCached = false
// 						b1.collidedWithBall = b2.id;
// 						b2.collidedWithBall = b1.id;
// 					}
// 				}
// 			}
// 			pastBalls.unshift(b1);
// 		}

// 		// ball-peg collisions
// 		for (let b of this.balls) {
// 			if (!b.active) continue;
// 			// if (b.nextStateCached) continue
// 			if (b.collidedWith(Engine.COLLISION_BALL)) {
// 				// any ball-ball collision removes lookup state
// 				// b.lookupFrames.length = 0
// 				b.lookupFramesIndex = -1;
// 			}

// 			// if in lookup state, do not handle ball-peg collisions
// 			if (b.lookupFramesIndex > -1) continue;
// 			// if (b.lookupFrames.length > 0) continue

// 			const peg = this.pegs.getClosestPeg(b.pos.x, b.pos.y);
// 			if (peg && b.shouldCollide(peg.x, peg.y, this.pegs.radius) !== false) {
// 				if (b.collidedWith(Engine.COLLISION_BALL)) {
// 					const vx0 = b.vel.x;
// 					const vy0 = b.vel.y;

// 					// only reverse sim ball-peg directly after ball-ball in same frame
// 					const restitution = 1;
// 					b.bounce(b.normal.x, b.normal.y, restitution, true);

// 					const dx = vx0 - b.vel.x;
// 					const dy = vy0 - b.vel.y;
// 					this.ballCollisions.push(Math.sqrt(dx * dx + dy * dy));
// 				} else {
// 					// enter lookup state
// 					const nx = b.normal.x;
// 					const ny = b.normal.y;
// 					let vx = -b.vel.x;
// 					let vy = -b.vel.y;

// 					// decrease large velocities for fewer high-velocity paths
// 					const x = Math.sqrt(vx * vx + vy * vy);
// 					const x1 = this.lookup.maxSpeed;
// 					let k = Math.min(1, x / x1); // 0,1
// 					k = Math.pow(k, this.transitionFactor);
// 					k = 1 + k * (this.pegs.restitution - 1); // -> 1,r

// 					vx *= k;
// 					vy *= k;

// 					const index = this.lookup.lookupClosestCollision(nx, ny, vx, vy, peg.x, peg.y);
// 					this.genLookupFramesFromPeg(b, peg, index);
// 				}
// 				b.collided |= Engine.COLLISION_PEG;
// 			}
// 		}

// 		// momentum + gravity first half
// 		for (let b of this.balls) {
// 			if (!b.active) continue;
// 			if (b.lookupFramesIndex === -1) {
// 				// if (b.lookupFrames.length === 0) {
// 				b.vel.y += this.g / 2;

// 				b.pos.x += b.vel.x * this.dt;
// 				b.pos.y += b.vel.y * this.dt;
// 			} else {
// 				// const frame = b.lookupFrames.pop()
// 				const frame = b.lookupFrames[b.lookupFramesIndex--];
// 				b.pos.x = frame.x;
// 				b.pos.y = frame.y;
// 				b.vel.x = frame.vx;
// 				b.vel.y = frame.vy;

// 				if (b.lookupFramesIndex === -1) {
// 					// if (b.lookupFrames.length === 0) {
// 					const peg = this.pegs.getClosestPeg(b.pos.x, b.pos.y);
// 					this.genLookupFramesFromPeg(b, peg, b.nextCollisionIndex);
// 					b.collided |= Engine.COLLISION_PEG;
// 				}
// 			}
// 		}
// 	}
// }

// class ReverseSequencer {
// 	static STATE_FREE_FALL = 1;
// 	static STATE_BOTTOM_PEGS = 2;
// 	static STATE_AMONG_PEGS = 3;
// 	/**
// 	 * @param engine {Engine}
// 	 * @param ball {Ball}
// 	 * @param sequence {{ timeOfImpact: number, yVelocityBin: number, xPositionBin: number }[]}
// 	 * @param maxRetries {number}
// 	 */
// 	constructor(engine, ball, sequence, maxRetries = 4) {
// 		this.random = Math.random;
// 		if (window.seed && window.alea) {
// 			this.random = new window.alea(window.seed);
// 		}
// 		this.ball = ball.copy();
// 		this.ball.state = ReverseSequencer.STATE_FREE_FALL;
// 		this.maxRetries = maxRetries;
// 		this.engine = engine;

// 		const cachedSequence = localStorage.getItem('sequence');
// 		if (cachedSequence) {
// 			this.sequence = JSON.parse(cachedSequence);
// 		} else {
// 			const maxTimeOfImpact = sequence.reduce((x, e) => Math.max(x, e.timeOfImpact), 0);
// 			this.sequence = sequence.map(({ timeOfImpact, endTime, ...s }) => {
// 				const escape = null;
// 				const entryFrameIndex = Math.floor((maxTimeOfImpact - timeOfImpact) / engine.dt) + 1;
// 				return {
// 					...s,
// 					entryFrameIndex,
// 					escape,
// 					retryCount: 0,
// 					backtrackIndex: 0,
// 					duration: endTime - timeOfImpact
// 				};
// 			});
// 			// reverse
// 			this.sequence.sort((a, b) => a.entryFrameIndex - b.entryFrameIndex);
// 		}

// 		this.sequenceIndex = 0;

// 		let backtrackIndex = 0;
// 		let prevEntry = this.sequence[0];
// 		for (let i = 1; i < this.sequence.length; i++) {
// 			const entry = this.sequence[i];
// 			if (entry.entryFrameIndex > prevEntry.entryFrameIndex) {
// 				backtrackIndex = i;
// 			}
// 			entry.backtrackIndex = backtrackIndex;
// 			prevEntry = entry;
// 		}

// 		/** @type {Ball[][]} */
// 		this.timeline = [[]];
// 		this.currentFrameIndex = 0;

// 		this.escapeCallCount = 0;

// 		this.compressedIndex = 0;
// 	}
// 	/** @param bounds {{x1: number, x2: number}} */
// 	addTopBounds(bounds) {
// 		this.topBounds = bounds;
// 		const cx = (bounds.x1 + bounds.x2) / 2;
// 		const radius = cx - bounds.x1;

// 		const getStartX = (i, px, py) => {
// 			while (py >= 0) {
// 				const c = this.engine.lookup.collisions[i];
// 				px -= c.px;
// 				py -= c.py;
// 				i--;
// 			}
// 			return px;
// 		};

// 		this.engine.lookup.addFilter((i, px, py) => {
// 			const startX = getStartX(i, px, py);
// 			const dx = (startX - cx) / radius;
// 			const d = Math.pow(dx, 6);
// 			return d;
// 		});
// 		this.escapeFilter = (i, px, py) => {
// 			const startX = getStartX(i, px, py);
// 			const y = startX > this.topBounds.x1 && startX < this.topBounds.x2;

// 			return y;
// 		};
// 	}
// 	getEscape(entry) {
// 		this.escapeCallCount++;
// 		if (this.escapeCallCount % 10 === 0) {
// 			// console.log('caching sequence')
// 			localStorage.setItem('sequence', JSON.stringify(this.sequence));
// 		}
// 		const bin = engine.lookup.escapeBins[entry.yVelocityBin];
// 		if (this.escapeFilter) {
// 			for (let i = 0; i < 1000000; i++) {
// 				const escape = bin[Math.floor(bin.length * this.random())];
// 				const peg = this.getEntryPeg(entry.xPositionBin, escape);
// 				if (this.escapeFilter(escape.lastCollision.index, peg.x, peg.y)) {
// 					return escape;
// 				}
// 			}
// 		}
// 		return bin[Math.floor(bin.length * this.random())];
// 	}
// 	getEntryPeg(xPositionBin, escape) {
// 		const startX = this.engine.pegs.getFloorX(xPositionBin, escape);
// 		const startY = this.engine.pegs.getPegY2() - escape.startY;

// 		return this.engine.pegs.getClosestPeg(startX, startY);
// 	}
// 	maybeAddEntry() {
// 		const entry = this.sequence[this.sequenceIndex];

// 		if (entry && entry.entryFrameIndex === this.currentFrameIndex) {
// 			const ball = this.ball.copy(this.sequenceIndex);
// 			ball.color = entry.color;
// 			ball.duration = entry.duration;

// 			if (this.engine.balls.some((b) => b.id === ball.id)) debugger;
// 			this.engine.balls.push(ball);

// 			if (!entry.escape) {
// 				entry.escape = this.getEscape(entry);
// 			}

// 			const c = entry.escape.lastCollision;

// 			const peg = this.getEntryPeg(entry.xPositionBin, entry.escape);

// 			this.engine.genLookupFrames(
// 				ball,
// 				peg.x + c.x,
// 				peg.y + c.y,
// 				c.vx,
// 				c.vy,
// 				entry.escape.frames,
// 				false
// 			);
// 			const f = ball.lookupFrames[ball.lookupFrames.length - 1];
// 			ball.pos.x = f.x;
// 			ball.pos.y = f.y;
// 			ball.nextCollisionIndex = c.index;
// 			this.sequenceIndex++;
// 			return true;
// 		}
// 		return false;
// 	}
// 	/** @param {Ball} b */
// 	backtrack(b) {
// 		// didBacktrack = true
// 		let targetId = b.maxInfluencedBallId;
// 		if (targetId == null) {
// 			targetId = b.id;
// 		}
// 		const ball = this.engine.balls.find((b) => b.id === targetId);
// 		if (!ball) debugger;
// 		let entry = this.sequence[ball.id];
// 		if (!entry) debugger;
// 		if (entry.entryFrameIndex > this.currentFrameIndex) debugger;

// 		// console.log('backtrack', targetId)
// 		// debugger
// 		if (entry.retryCount > this.maxRetries && b.collidedWithBall > -1) {
// 			entry.retryCount = 0;
// 			targetId = Math.min(b.id, b.collidedWithBall);
// 			entry = this.sequence[targetId];
// 		}

// 		this.sequenceIndex = entry.backtrackIndex;

// 		// console.log(this.timeline.length, entry.entryFrameIndex, entry)
// 		// this.timeline.length = entry.entryFrameIndex
// 		this.currentFrameIndex = entry.entryFrameIndex - 1;
// 		if (this.timeline.length === 0) {
// 			// this.engine.balls = []
// 		} else {
// 			// this.engine.balls = [...this.timeline[this.timeline.length - 1]]
// 		}

// 		this.engine.balls = this.timeline[this.currentFrameIndex].map((b) => b.copy());

// 		// const bin = this.engine.lookup.escapeBins[entry.yVelocityBin]
// 		// const escape = bin[Math.floor(bin.length * this.random())]
// 		entry.escape = this.getEscape(entry);
// 		entry.retryCount++;
// 	}
// 	step() {
// 		this.currentFrameIndex++;
// 		const frameIndex = this.currentFrameIndex;

// 		while (this.compressedIndex + 10 * 60 * 16 < frameIndex) {
// 			const frame = this.timeline[this.compressedIndex];
// 			frame.forEach((ball, i) => {
// 				frame[i] = ball.compressed();
// 			});
// 			this.compressedIndex++;
// 		}

// 		while (this.maybeAddEntry()) {}
// 		this.engine.reverseStep();

// 		const yBound = this.engine.pegs.getPegY2();

// 		let hasActive = false;
// 		const maybeBacktrack = () => {
// 			for (let b of this.engine.balls) {
// 				if (!b.active) continue;
// 				hasActive = true;
// 				const bounds = this.engine.pegs.bounds;
// 				if ((bounds.x1 && b.pos.x < bounds.x1) || (bounds.x2 && b.pos.x > bounds.x2)) {
// 					// console.log('backtrack0', b.id)
// 					this.backtrack(b);
// 					return true;
// 				}
// 				switch (b.state) {
// 					case ReverseSequencer.STATE_FREE_FALL:
// 						if (b.collidedWith(Engine.COLLISION_BALL)) {
// 							// console.log('backtrack1', b.id, b.maxInfluencedBallId)
// 							this.backtrack(b);
// 							return true;
// 						} else if (b.collidedWith(Engine.COLLISION_PEG)) {
// 							b.state = ReverseSequencer.STATE_BOTTOM_PEGS;
// 						}
// 						break;
// 					case ReverseSequencer.STATE_BOTTOM_PEGS:
// 						if (b.pos.y > yBound + b.radius) {
// 							// console.log('backtrack2', b.id, b.maxInfluencedBallId)
// 							this.backtrack(b);
// 							return true;
// 						} else if (b.pos.y < yBound - this.engine.pegs.ySpacing) {
// 							b.state = ReverseSequencer.STATE_AMONG_PEGS;
// 						}
// 						break;
// 					case ReverseSequencer.STATE_AMONG_PEGS:
// 						if (b.pos.y > yBound + b.radius) {
// 							// console.log('backtrack3', b.id, b.maxInfluencedBallId)
// 							this.backtrack(b);
// 							return true;
// 						} else if (b.pos.y < -b.radius) {
// 							b.active = false;
// 						}
// 						break;
// 				}
// 			}
// 			return false;
// 		};
// 		const didBacktrack = maybeBacktrack();

// 		if (this.currentFrameIndex === frameIndex) {
// 			this.timeline[this.currentFrameIndex] = this.engine.balls
// 				.filter((b) => b.active)
// 				.map((b) => b.copy());
// 		}

// 		return hasActive || this.sequenceIndex < this.sequence.length;
// 	}
// }
