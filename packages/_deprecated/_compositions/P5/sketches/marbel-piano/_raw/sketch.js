// const iterations = 16;
// const speedUp = 16;
// const ballRadius = 4.5;
// const ballRestitution = 1;
// const pegRadius = 3;
// const pegRestitution = 0.5 / ballRestitution;
// const xSpacing = 20;
// const ySpacing = (xSpacing * Math.sqrt(3)) / 2;
// const binRadius = 1.63;
// const gravity = 1000;
// const numCollisions = 200000;
// const yVelocityBins = 4;
// const pegsY2 = 720 * 0.45 + ySpacing;
// const yFloor = 720 - 150;
// // const yFloor = 0.53

// const FORWARDS = false;
// let t1 = 5;
// let motionBlur;
// let shouldRecord;
// t1 = 1000;
// // motionBlur = iterations / 2
// // shouldRecord = true

// // y bins 0 to yVelocityBins, x bins 0 to 29
// const N = 500;
// const M = 20;
// const startMidi = 34 - 7;

// window.seed = Date.now();
// // M = 20
// // seed = 1598410485600
// // window.seed = 1598479900558
// window.seed = 1601680588157;
// console.log(window.seed);
// const random = new window.alea(window.seed);

// if (localStorage.getItem('prevSeed') === window.seed.toString()) {
// } else {
// 	localStorage.removeItem('collisions');
// 	localStorage.removeItem('sequence');
// }
// localStorage.setItem('prevSeed', window.seed);

// const subframes = [];

// const sequence = [];
// // const sequence = Array(N).fill().map((_, i) => {
// //   const x = i / M
// //   const x0 = Math.floor(x)
// //   const x1 = (0.61803399 * i) % 1
// //   const x2 = (random() * 2 - 1) * x * 1 / M
// //   // let t = (x0 + x1 + x2 * 3 / M) * 5
// //   let t = (x0 + x1 + x2) * 50
// //   // t = (1 - Math.pow((1 - t), 1.5)) * 100
// //   const a = 50
// //   t = a * Math.log(t / a + 1)
// //   return {
// //     timeOfImpact: t,
// //     yVelocityBin: 0,
// //     xPositionBin: 5 + i % M,
// //     color: sinebow(i / M)
// //   }
// // })

// function preload() {
// 	Midi.fromUrl('giantsteps-edit.mid').then((e) => {
// 		const asdf = [0, 0, 0, 0, 0, 0, 0, 0];

// 		let low = 128;
// 		let high = 0;
// 		let maxDuration = 0;
// 		for (let note of e.tracks[0].notes) {
// 			let { midi, time, velocity, duration } = note;
// 			const color = sinebow(((midi + 3) * -5) / 12);
// 			low = min(midi, low);
// 			high = max(midi, high);
// 			maxDuration = max(maxDuration, duration);
// 			sequence.push({
// 				timeOfImpact: time,
// 				endTime: duration + time,
// 				// yVelocityBin: 0,
// 				// divide into 8, first and last bins are empty, use 6 bins
// 				yVelocityBin: ((velocity * 8) | 0) - 2,
// 				xPositionBin: midi - startMidi,
// 				color: color
// 			});
// 			asdf[(velocity * 8) | 0]++;
// 		}
// 		console.log(low, high, maxDuration);
// 		console.log(asdf);
// 		// sequence.splice(0, 700)
// 		// sequence.length = 100
// 		// sequence.length = 400
// 	});
// }

// let engine, forwardEngine, sequencer;
// let audioBuffer, audioBufferFloor, canvas;
// function setup() {
// 	// frameRate(10)
// 	pixelDensity(1);
// 	canvas = createCanvas(1280, 720).elt;
// 	// canvas.style.transform = "scale(0.5)"
// 	canvas.style.width = window.innerWidth + 'px';
// 	canvas.style.height = (9 / 16) * window.innerWidth + 'px';
// 	if (!shouldRecord) {
// 		audioBuffer = initLiveAudio();
// 	} else {
// 		audioBuffer = initOfflineAudio('plinko', 2);
// 		// audioBufferFloor = initOfflineAudio('floor', 2)
// 		// initVideoRecorder()
// 	}

// 	const ball = new Ball(
// 		{ x: width / 2 + 0.1, y: height / 2 },
// 		{ x: 0, y: 0 },
// 		ballRadius,
// 		ballRestitution
// 	);
// 	const pegs = new Pegs(xSpacing, ySpacing, pegRadius, pegRestitution);
// 	pegs.setBounds({
// 		// x1: 30,
// 		// x2: 1280 - 30,
// 		y2: pegsY2
// 	});
// 	const dt = 1 / 60 / iterations;
// 	engine = new Engine(dt, gravity, []);

// 	engine.addPegs(pegs);

// 	// noLoop()
// 	if (FORWARDS) {
// 		setupForwards();
// 	} else {
// 		setupReverse();
// 	}

// 	function setupReverse() {
// 		engine.generateCollisions(numCollisions, ball);

// 		const escapeHeight = yFloor - engine.pegs.getPegY2();
// 		engine.lookup.generateEscapes(escapeHeight, yVelocityBins);

// 		sequencer = new ReverseSequencer(engine, ball, sequence);
// 		sequencer.addTopBounds({ x1: width * 0.2, x2: width * 0.8 });

// 		forwardEngine = new Engine(dt, gravity, []);
// 		forwardEngine.addFloor({ y: yFloor, restitution: pegRestitution });
// 	}
// }

// let currentTime = 0;
// let noteOffset;
// const activeNotes = [];
// const sequencerSubframes = [{ peg: [], ball: [] }];
// let framesToNextBall = 0;
// let done = false;
// let frame;
// let frameCount = 0;
// let binCount = 0;
// let silentCount = 0;
// function draw() {
// 	clear();
// 	background(0);

// 	if (FORWARDS) {
// 	} else {
// 		if (!done) {
// 			// for (let j = 0; j < speedUp; j++) {
// 			for (let i = 0; i < speedUp * iterations; i++) {
// 				done = !sequencer.step();
// 				sequencerSubframes[sequencer.currentFrameIndex] = {
// 					peg: [...engine.pegCollisions],
// 					ball: [...engine.ballCollisions]
// 				};
// 				if (done) {
// 					engine.balls = [];
// 					frame = sequencer.timeline.length - 1;
// 					for (let i = frame; i > 0; i--) {
// 						const prev = sequencer.timeline[i];
// 						const next = sequencer.timeline[i - 1];
// 						for (let nextBall of next) {
// 							const prevBall = prev.find((b) => b.id === nextBall.id);
// 							if (prevBall) {
// 								nextBall.prev = prevBall;
// 							}
// 						}
// 					}
// 					console.log(frame / 16 / 60);
// 					if (shouldRecord) {
// 						initVideoRecorder(); // not sure if off by one frame
// 					}
// 					break;
// 				}
// 			}
// 			// }
// 			renderBalls();
// 		} else {
// 			const forwardStep = () => {
// 				for (let i = forwardEngine.balls.length - 1; i >= 0; i--) {
// 					let b = forwardEngine.balls[i];
// 					let d = b.duration * 60 * iterations;
// 					while (d > 0) {
// 						d--;
// 						b = b.prev;
// 					}
// 					if (b.pos && b.pos.y > height) {
// 						forwardEngine.balls.splice(i, 1);
// 					}
// 				}
// 				currentTime = frameCount / 60 / iterations;

// 				const prevBalls = engine.balls;
// 				engine.balls = sequencer.timeline[frame];
// 				const sequencerSubframe = sequencerSubframes[frame];
// 				frame = Math.max(0, frame - 1);

// 				const removedBalls = prevBalls.filter((b1) => !engine.balls.some((b2) => b1.id === b2.id));

// 				if (removedBalls.length > 0) {
// 					binCount += removedBalls.length;
// 					forwardEngine.balls.push(
// 						...removedBalls.map((b) => {
// 							const b2 = Ball.from(b, ballRadius, ballRestitution);
// 							b2.vel.x *= -1;
// 							b2.vel.y *= -1;
// 							b2.prev = b.prev;
// 							return b2;
// 						})
// 					);

// 					if (noteOffset == null) {
// 						noteOffset = sequence[0].timeOfImpact - currentTime;
// 						console.log('noteOffset', noteOffset);
// 					}
// 				}
// 				const prevBalls2 = forwardEngine.balls;
// 				forwardEngine.balls = prevBalls2.map((b) => b.copy());
// 				for (let i = 0; i < prevBalls2.length; i++) {
// 					forwardEngine.balls[i].prev = prevBalls2[i];
// 				}
// 				forwardEngine.step();

// 				subframes.push({
// 					peg: [...sequencerSubframe.peg],
// 					ball: [...sequencerSubframe.ball, ...forwardEngine.ballCollisions]
// 					// floor: [...forwardEngine.floorCollisions],
// 					// bins: [...forwardEngine.binCollisions],
// 				});

// 				while (
// 					noteOffset != null &&
// 					sequence.length > 0 &&
// 					sequence[0].timeOfImpact - noteOffset <= currentTime
// 				) {
// 					const note = sequence.shift();
// 					activeNotes[note.xPositionBin + startMidi] = note;
// 				}

// 				frameCount++;
// 			};

// 			if (motionBlur == null) {
// 				for (let i = 0; i < iterations; i++) {
// 					forwardStep();
// 				}
// 				renderBalls();
// 			} else {
// 				push();
// 				blendMode(ADD);
// 				const k = iterations / motionBlur;
// 				for (let i = 0; i < iterations; i++) {
// 					forwardStep();
// 					if (i % k === k - 1) {
// 						renderBalls(motionBlur);
// 					}
// 				}
// 				pop();
// 			}
// 			if (audioBuffer) {
// 				onAudioFrame();
// 			}
// 		}
// 	}

// 	renderPegs();

// 	// background(32)
// 	// renderPegs()
// 	// renderBalls()

// 	// fill(255)
// 	// text(engine.balls[0].lookupFrames.length, width / 2, height / 2)

// 	push();
// 	blendMode(SCREEN);
// 	background(32);
// 	pop();
// }

// function renderPegs() {
// 	push();
// 	ellipseMode(RADIUS);
// 	noStroke();
// 	fill(80);
// 	engine.pegs.forEachPeg(0, 0, width, height, (x, y) => {
// 		circle(x, y, engine.pegs.radius);
// 	});
// 	stroke(80);
// 	strokeWeight(binRadius * 2);

// 	noFill();
// 	const keyStrokeWeight = 2;
// 	strokeWeight(keyStrokeWeight);
// 	strokeCap(SQUARE);

// 	const keyHeight = height - yFloor - keyStrokeWeight / 2;
// 	for (let i = startMidi - 1; i <= 100; i++) {
// 		const keyShape = getPianoKeyShape(i, 90, keyHeight, xSpacing, keyStrokeWeight / 2);
// 		const x0 = (i - startMidi) * xSpacing;

// 		if (activeNotes[i]) {
// 			const tStart = activeNotes[i].timeOfImpact - noteOffset;
// 			const tEnd = activeNotes[i].endTime - noteOffset;

// 			const t1 = min(currentTime, tEnd) - tStart;
// 			let k = 4 ** -t1;
// 			if (currentTime - tStart < 8 / 60) {
// 				k *= map(currentTime - tStart, 0, 8 / 60, 2, 1);
// 			}
// 			if (currentTime > tEnd) {
// 				k *= 30 ** -(currentTime - tEnd);
// 			}
// 			fill(...activeNotes[i].color, 150 * k);
// 			stroke(lerpColor(color(80), color(...activeNotes[i].color), k));
// 		} else {
// 			noFill();
// 			stroke(80);
// 		}
// 		beginShape();
// 		for (let [x, y] of keyShape) {
// 			vertex(x + x0, yFloor + y);
// 		}
// 		endShape(CLOSE);
// 	}
// 	pop();
// }
// function renderBalls(alphaDivisor = 1) {
// 	const alpha = 255 / alphaDivisor;

// 	push();
// 	blendMode(BLEND);
// 	ellipseMode(RADIUS);
// 	const renderBall = (b, alpha) => {
// 		const bx = b.posX || b.pos.x;
// 		const by = b.posY || b.pos.y;
// 		if (
// 			bx > 0 - ballRadius &&
// 			bx < width + ballRadius &&
// 			by > 0 - ballRadius &&
// 			by < height + ballRadius
// 		) {
// 			noStroke();
// 			let k = b.floorCount || 0;
// 			if (k === 0) {
// 				fill(b.color[0], b.color[1], b.color[2], alpha);
// 			} else {
// 				k = k / 60 / iterations;
// 				// k = 4 ** -(k)
// 				k = 1 / (1 + k * 8);
// 				const c1 = color(...b.color, alpha);
// 				const c2 = color(0, alpha);
// 				fill(lerpColor(c2, c1, k));
// 			}
// 			// if (b.resting > 0) {
// 			//   stroke(255)
// 			//   strokeWeight(1)
// 			//   fill(0)
// 			// }
// 			circle(bx, by, ballRadius);
// 			// text(b.id, b.pos.x + 8, b.pos.y + 4)
// 			// text(b.state, b.pos.x - 15, b.pos.y + 4)
// 		}
// 	};

// 	// strokeWeight(ballRadius * 0.8)
// 	// strokeJoin(ROUND)
// 	const renderTrail = (b) => {
// 		const by = b.posY || b.pos.y;
// 		let d = (b.duration * 60 * iterations) | 0;
// 		// if (b.floorCount > 0) {
// 		// } else {
// 		//   d = map(by, 0, pegsY2, sqrt(d), d, true)
// 		// }
// 		const d0 = d;
// 		// beginShape()
// 		noStroke();
// 		noFill();
// 		while (d > 0 && b && b.prev) {
// 			d--;
// 			b = b.prev;

// 			const bx = b.posX || b.pos.x;
// 			const by = b.posY || b.pos.y;

// 			const k = by / pegsY2;
// 			const modulo = 4;
// 			// const modulo = map(k ** 2, 0, 1, 16, 4, true) | 0

// 			const t = d / d0;
// 			if (d % modulo !== 0) continue;
// 			if (by < pegsY2 - ySpacing * 3) continue;
// 			const a = map(by, pegsY2 - 100, pegsY2, 0, 1, true);
// 			// const a = map((1 - t) ** 2, 0, 1, 60, 1)

// 			if (b.floorCount > 0) {
// 			} else {
// 				let radius = map(t, 1, 0, ballRadius, 0.5);
// 				radius *= a;
// 				const k = 0.7;
// 				fill(b.color[0] * k, b.color[1] * k, b.color[2] * k, 60 / k);
// 				circle(bx, by, radius);

// 				// vertex(bx, by)
// 			}
// 		}
// 		// endShape()
// 	};

// 	for (let b of forwardEngine.balls) {
// 		renderBall(b);
// 	}

// 	for (let b of forwardEngine.balls) {
// 		renderTrail(b);
// 	}
// 	for (let b of engine.balls) {
// 		renderTrail(b);
// 	}

// 	for (let b of engine.balls) {
// 		renderBall(b);
// 	}

// 	pop();
// }

// // left to right, units in semitone width, bottom is open
// function getPianoKeyShape(key, blackHeight, whiteHeight, keyWidth, margin) {
// 	key = key % 12;
// 	let whiteKeyIndex = [0, 2, 4, 5, 7, 9, 11].indexOf(key);
// 	if (whiteKeyIndex > -1) {
// 		// white key
// 		let dx;
// 		if (whiteKeyIndex < 3) {
// 			// 5 semitones
// 			dx = 5 / 3;
// 		} else {
// 			// 7 semitones
// 			whiteKeyIndex = whiteKeyIndex - 3;
// 			key -= 5;
// 			dx = 7 / 4;
// 		}
// 		const x0 = dx * whiteKeyIndex - key;
// 		const x1 = dx * (whiteKeyIndex + 1) - key;
// 		return [
// 			[keyWidth * x0 + margin, whiteHeight],
// 			[keyWidth * x0 + margin, blackHeight + margin],
// 			[keyWidth * 0 + margin, blackHeight + margin],
// 			[keyWidth * 0 + margin, 0],
// 			[keyWidth * 1 - margin, 0],
// 			[keyWidth * 1 - margin, blackHeight + margin],
// 			[keyWidth * x1 - margin, blackHeight + margin],
// 			[keyWidth * x1 - margin, whiteHeight]
// 		];
// 	} else {
// 		// black key
// 		return [
// 			[keyWidth * 0 + margin, blackHeight - margin],
// 			[keyWidth * 0 + margin, 0],
// 			[keyWidth * 1 - margin, 0],
// 			[keyWidth * 1 - margin, blackHeight - margin]
// 		];
// 	}
// }

// function sinebow(t) {
// 	t = 0.5 - t;
// 	return [
// 		255 * Math.sin(Math.PI * (t + 0 / 3)) ** 2,
// 		255 * Math.sin(Math.PI * (t + 1 / 3)) ** 2,
// 		255 * Math.sin(Math.PI * (t + 2 / 3)) ** 2
// 	];
// }
// // function mouseClicked() {
// //   if (sequencer) {
// //     frame = sequencer.timeline.length - 1
// //   }
// // }
// function keyPressed() {
// 	if (keyCode === ESCAPE) noLoop();
// }

// function onAudioFrame() {
// 	if (subframes.length === iterations) {
// 		const dx = 44100 / 60 / iterations;
// 		const len = 44100 / 60 - 1;
// 		audioBuffer.input.fill(0);

// 		if (audioBufferFloor) {
// 			audioBufferFloor.input.fill(0);
// 		}

// 		for (let i = 0; i < subframes.length; i++) {
// 			const { ball, peg, floor: floorC, bins } = subframes[i];
// 			for (let c of peg) {
// 				const x = (c * 16) / 100000;
// 				const offset = Math.random() * dx;
// 				const index = min(len, floor(i * dx + offset));
// 				audioBuffer.input[index * 2] += x;
// 			}
// 			for (let c of ball) {
// 				const x = (c * 16) / 100000;
// 				const offset = Math.random() * dx;
// 				const index = min(len, floor(i * dx + offset));
// 				audioBuffer.input[index * 2 + 1] += x;
// 			}

// 			// if (audioBufferFloor) {
// 			//   for (let c of floorC) {
// 			//     const x = c * 16 / 100000
// 			//     const offset = Math.random() * dx
// 			//     const index = min(len, floor(i * dx + offset))
// 			//     audioBufferFloor.input[index * 2] -= x
// 			//   }
// 			//   for (let c of bins) {
// 			//     const x = c * 16 / 100000
// 			//     const offset = Math.random() * dx
// 			//     const index = min(len, floor(i * dx + offset))
// 			//     audioBufferFloor.input[index * 2 + 1] -= x
// 			//   }
// 			// } else {
// 			//   for (let c of floorC) {
// 			//     const x = c * 16 / 100000
// 			//     const offset = Math.random() * dx
// 			//     const index = min(len, floor(i * dx + offset))
// 			//     if (audioBuffer.input[index * 2] > 0) {
// 			//       audioBuffer.input[index * 2] = 0
// 			//     }
// 			//     audioBuffer.input[index * 2] -= x
// 			//   }
// 			//   for (let c of bins) {
// 			//     const x = c * 16 / 100000
// 			//     const offset = Math.random() * dx
// 			//     const index = min(len, floor(i * dx + offset))
// 			//     if (audioBuffer.input[index * 2 + 1] > 0) {
// 			//       audioBuffer.input[index * 2 + 1] = 0
// 			//     }
// 			//     audioBuffer.input[index * 2 + 1] -= x
// 			//   }
// 			// }
// 		}
// 		audioBuffer.updateInput();
// 		if (audioBufferFloor) {
// 			audioBufferFloor.updateInput();
// 		}
// 		subframes.length = 0;
// 	}
// }

// function initOfflineAudio(filename, numChannels) {
// 	const N = 44100 / 60;
// 	const channels = Array(numChannels)
// 		.fill()
// 		.map(() => []);
// 	const offlineAudio = {
// 		channels,
// 		input: new Float32Array(N * numChannels),
// 		updateInput: () => {
// 			for (let c = 0; c < numChannels; c++) {
// 				const channel = channels[c];
// 				for (let i = 0; i < N; i++) {
// 					channel.push(offlineAudio.input[numChannels * i + c]);
// 				}
// 			}
// 		}
// 	};
// 	const button = createButton(`save ${filename}.wav`);
// 	button.mousePressed(() => {
// 		const soundFile = new p5.SoundFile();
// 		soundFile.setBuffer([...channels]);
// 		saveSound(soundFile, filename + '.wav');
// 	});
// 	return offlineAudio;
// }

// let shouldStop;
// function initVideoRecorder() {
// 	const button = createButton('stop recording video');
// 	button.mousePressed(() => {
// 		shouldStop = true;
// 		setTimeout(() => {
// 			noLoop();
// 		});
// 	});
// 	const renderNextFrame = () => {
// 		if (shouldStop) return true;
// 		return false;
// 	};
// 	recordCanvas(canvas, renderNextFrame, { fps: 60, bitsPerSecond: 1000 * 1000 * 1000 }).then(
// 		(blob) => {
// 			const url = URL.createObjectURL(blob);
// 			const v = createVideo(url);
// 			v.elt.controls = true;
// 			const button = createButton('save video');
// 			button.mousePressed(() => {
// 				saveAs(url, 'plinko.webm');
// 				// URL.revokeObjectURL(url)
// 			});
// 		}
// 	);
// }

// class AudioBufferSwap {
// 	constructor(outputSize, inputSize) {
// 		this.n = outputSize;
// 		this.output = new Float32Array(4 * outputSize);
// 		this.input = new Float32Array(inputSize);
// 		this.inputCursor = 0;
// 		this.outputCursor = 0;
// 		this.inputCount = 0;
// 	}
// 	getOutput() {
// 		const output = this.output.subarray(this.outputCursor, this.outputCursor + this.n);
// 		if (this.inputCount > this.n) {
// 			this.outputCursor = (this.outputCursor + this.n) % this.output.length;
// 			this.inputCount -= this.n;
// 		}
// 		return output;
// 	}
// 	updateInput() {
// 		const split = this.output.length - this.inputCursor;
// 		if (split > this.input.length) {
// 			this.output.set(this.input, this.inputCursor);
// 		} else {
// 			const a = this.input.subarray(0, split);
// 			const b = this.input.subarray(split);
// 			this.output.set(a, this.inputCursor);
// 			this.output.set(b, 0);
// 		}
// 		this.inputCursor = (this.inputCursor + this.input.length) % this.output.length;
// 		this.inputCount += this.input.length;
// 	}
// }
// function initLiveAudio() {
// 	const N = 1024;
// 	const ctx = new AudioContext();
// 	const scriptNode = ctx.createScriptProcessor(N, 0, 2);
// 	const buffer = new AudioBufferSwap(N * 2, (44100 / 60) * 2);

// 	scriptNode.onaudioprocess = (e) => {
// 		const b = buffer.getOutput();

// 		const left = e.outputBuffer.getChannelData(0);
// 		const right = e.outputBuffer.getChannelData(1);
// 		for (let i = 0; i < N; i++) {
// 			left[i] = b[2 * i];
// 			right[i] = b[2 * i + 1];
// 		}
// 		b.fill(0);
// 	};
// 	scriptNode.connect(ctx.destination);

// 	return buffer;
// }
