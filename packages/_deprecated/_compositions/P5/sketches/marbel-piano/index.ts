import { Midi } from '@tonejs/midi';
import { staticFile } from 'remotion';

import { P5RemotionController, TRemotionSketch } from '../_compositions/P5/P5RemotionController';
import { Ball } from './Ball';
import { Engine } from './Engine';
import { getNoteSequence, TNote } from './get-note-sequence';
import { getPianoKeyShape } from './get-piano-key-shape';
import { Pegs } from './Pegs';
import { ReverseSequencer } from './ReverseSequencer';

export const marblePianoSketch: TRemotionSketch = (p5) => {
	const controller = new P5RemotionController(p5);

	const iterations = 16;
	const speedUp = 16;
	const ballRadius = 4.5;
	const ballRestitution = 1;
	const pegRadius = 3;
	const pegRestitution = 0.5 / ballRestitution;
	const pegXSpacing = 20;
	const pegYSpacing = (pegXSpacing * Math.sqrt(3)) / 2;
	const pegsY2 = 720 * 0.45 + pegYSpacing;

	const binRadius = 1.63;

	const gravity = 1000;
	const numCollisions = 200000;
	const yVelocityBins = 4;
	const yFloor = 720 - 150;

	let sequence: TNote[] = [];

	let engine: Engine;
	let sequencer: ReverseSequencer;
	let forwardEngine: Engine;

	// Starting MIDI note (usually A0 on a piano)
	const startMidi = 34 - 7;

	const activeNotes: TNote[] = [];
	let currentTime = 0;
	let noteOffset = 0;

	const sequencerSubframes: { peg: number[]; ball: number[] }[] = [{ peg: [], ball: [] }];
	const subframes: { peg: number[]; ball: number[] }[] = [];

	let done = false;
	let frame: number;
	let frameCount = 0;
	let binCount = 0;

	let motionBlur: number;

	const FORWARDS = false;

	p5.preload = async () => {
		const midi = await Midi.fromUrl(staticFile('static/midi/concertoi.mid'));

		sequence = getNoteSequence(midi, startMidi);
		console.log({ sequence, midi });
	};

	p5.setup = () => {
		controller.setup(p5.WEBGL);

		const ball = new Ball(
			{ x: p5.width / 2 + 0.1, y: p5.height / 2 },
			{ x: 0, y: 0 },
			ballRadius,
			ballRestitution
		);
		const pegs = new Pegs(pegXSpacing, pegYSpacing, pegRadius, pegRestitution);
		pegs.setBounds({ y2: pegsY2 });

		const deltaTime = 1 / 60 / iterations;
		engine = new Engine(deltaTime, gravity, []);

		engine.addPegs(pegs);

		if (FORWARDS) {
			// TODO
		} else {
			setupReverse();
		}

		function setupReverse() {
			engine.generateCollisions(numCollisions, ball);

			const escapeHeight = yFloor - engine.pegs.getPegY2();
			engine.lookup.generateEscapes(escapeHeight, yVelocityBins);

			sequencer = new ReverseSequencer(engine, ball, sequence);
			sequencer.addTopBounds({ x1: p5.width * 0.2, x2: p5.width * 0.8 });

			forwardEngine = new Engine(deltaTime, gravity, []);
			forwardEngine.addFloor({ y: yFloor, restitution: pegRestitution });
		}
	};

	p5.updateWithProps = (props) => {
		controller.updateProps(props);
	};

	p5.draw = () => {
		p5.clear();
		p5.background(0);

		if (FORWARDS) {
			// Empty block in the original code
		} else {
			if (!done) {
				for (let i = 0; i < speedUp * iterations; i++) {
					done = !sequencer.step();
					sequencerSubframes[sequencer.currentFrameIndex] = {
						peg: [...engine.pegCollisions],
						ball: [...engine.ballCollisions]
					};
					if (done) {
						engine.balls = [];
						frame = sequencer.timeline.length - 1;
						for (let i = frame; i > 0; i--) {
							const prev = sequencer.timeline[i] ?? [];
							const next = sequencer.timeline[i - 1] ?? [];
							for (let nextBall of next) {
								const prevBall = prev.find((b: any) => b.id === nextBall.id);
								if (prevBall != null) {
									nextBall.prev = prevBall;
								}
							}
						}
						console.log(frame / 16 / 60);
						break;
					}
				}
				renderBalls();
			} else {
				const forwardStep = () => {
					for (let i = forwardEngine.balls.length - 1; i >= 0; i--) {
						let b = forwardEngine.balls[i] ?? null;
						if (b == null) {
							console.warn('Ball not found');
							continue;
						}
						let d = b.duration * 60 * iterations;
						while (d > 0) {
							d--;
							b = b?.prev ?? null;
						}
						if (b != null && b.pos && b.pos.y > p5.height) {
							forwardEngine.balls.splice(i, 1);
						}
					}
					currentTime = frameCount / 60 / iterations;

					const prevBalls = engine.balls;
					engine.balls = sequencer.timeline[frame] ?? [];
					const sequencerSubframe = sequencerSubframes[frame];
					if (sequencerSubframe == null) {
						throw new Error('Sequencer Subframe is null');
					}
					frame = Math.max(0, frame - 1);

					const removedBalls = prevBalls.filter(
						(b1) => !engine.balls.some((b2) => b1.id === b2.id)
					);

					if (removedBalls.length > 0) {
						binCount += removedBalls.length;
						forwardEngine.balls.push(
							...removedBalls.map((b) => {
								const b2 = Ball.from(b);
								b2.vel.x *= -1;
								b2.vel.y *= -1;
								b2.prev = b.prev;
								return b2;
							})
						);

						if (noteOffset == null) {
							noteOffset = (sequence[0]?.timeOfImpact ?? 0) - currentTime;
							console.log('noteOffset', noteOffset);
						}
					}
					const prevBalls2 = forwardEngine.balls;
					forwardEngine.balls = prevBalls2.map((b) => b.copy());
					for (let i = 0; i < prevBalls2.length; i++) {
						const ball = forwardEngine.balls[i];
						if (ball != null) {
							ball.prev = prevBalls2[i] ?? null;
						}
					}
					forwardEngine.step();

					subframes.push({
						peg: [...sequencerSubframe.peg],
						ball: [...sequencerSubframe.ball, ...forwardEngine.ballCollisions]
					});

					while (
						noteOffset != null &&
						sequence.length > 0 &&
						(sequence[0]?.timeOfImpact ?? 0) - noteOffset <= currentTime
					) {
						const note = sequence.shift();
						if (note) {
							activeNotes[note.xPositionBin + startMidi] = note;
						}
					}

					frameCount++;
				};

				if (motionBlur == null) {
					for (let i = 0; i < iterations; i++) {
						forwardStep();
					}
					renderBalls();
				} else {
					p5.push();
					p5.blendMode(p5.ADD);
					const k = iterations / motionBlur;
					for (let i = 0; i < iterations; i++) {
						forwardStep();
						if (i % k === k - 1) {
							renderBalls(motionBlur);
						}
					}
					p5.pop();
				}
				// if (audioBuffer) {
				// 	onAudioFrame();
				// }
			}
		}

		renderPegs();

		p5.push();
		p5.blendMode(p5.SCREEN);
		p5.background(32);
		p5.pop();
	};

	function renderPegs() {
		p5.push();
		p5.ellipseMode(p5.RADIUS);
		p5.noStroke();
		p5.fill(80);
		engine.pegs.forEachPeg(0, 0, p5.width, p5.height, (x, y) => {
			p5.circle(x, y, engine.pegs.radius);
		});
		p5.stroke(80);
		p5.strokeWeight(binRadius * 2);

		p5.noFill();
		const keyStrokeWeight = 2;
		p5.strokeWeight(keyStrokeWeight);
		p5.strokeCap(p5.SQUARE);

		const keyHeight = p5.height - yFloor - keyStrokeWeight / 2;
		for (let i = startMidi - 1; i <= 100; i++) {
			const keyShape = getPianoKeyShape(i, 90, keyHeight, pegXSpacing, keyStrokeWeight / 2);
			const x0 = (i - startMidi) * pegXSpacing;

			const activeNote = activeNotes[i];
			if (activeNote != null) {
				const tStart = activeNote.timeOfImpact - noteOffset;
				const tEnd = activeNote.endTime - noteOffset;

				const t1 = Math.min(currentTime, tEnd) - tStart;
				let k = 4 ** -t1;
				if (currentTime - tStart < 8 / 60) {
					k *= p5.map(currentTime - tStart, 0, 8 / 60, 2, 1);
				}
				if (currentTime > tEnd) {
					k *= 30 ** -(currentTime - tEnd);
				}
				p5.fill(...activeNote.color, 150 * k);
				p5.stroke(p5.lerpColor(p5.color(80), p5.color(...activeNote.color), k));
			} else {
				p5.noFill();
				p5.stroke(80);
			}
			p5.beginShape();
			for (const [x, y] of keyShape) {
				p5.vertex(x + x0, yFloor + y);
			}
			p5.endShape(p5.CLOSE);
		}
		p5.pop();
	}

	function renderBalls(alphaDivisor = 1) {
		const alpha = 255 / alphaDivisor;

		p5.push();
		p5.blendMode(p5.BLEND);
		p5.ellipseMode(p5.RADIUS);

		const renderBall = (b: Ball, alpha: number) => {
			const bx = b.pos.x;
			const by = b.pos.y;
			if (
				bx > 0 - ballRadius &&
				bx < p5.width + ballRadius &&
				by > 0 - ballRadius &&
				by < p5.height + ballRadius
			) {
				p5.noStroke();
				let k = b.floorCount ?? 0;
				if (k === 0) {
					p5.fill(b.color[0], b.color[1], b.color[2], alpha);
				} else {
					k = k / 60 / iterations;
					k = 1 / (1 + k * 8);
					const c1 = p5.color(...b.color, alpha);
					const c2 = p5.color(0, alpha);
					p5.fill(p5.lerpColor(c2, c1, k));
				}
				p5.circle(bx, by, ballRadius);
			}
		};

		const renderTrail = (b: Ball) => {
			let d = Math.floor(b.duration * 60 * iterations);
			const d0 = d;
			p5.noStroke();
			p5.noFill();
			while (d > 0 && b && b.prev) {
				d--;
				b = b.prev;

				const bx = b.pos.x;
				const by = b.pos.y;

				const modulo = 4;

				const t = d / d0;
				if (d % modulo !== 0) continue;
				if (by < pegsY2 - pegYSpacing * 3) continue;
				const a = p5.map(by, pegsY2 - 100, pegsY2, 0, 1, true);

				if (b.floorCount > 0) {
					// Do nothing
				} else {
					let radius = p5.map(t, 1, 0, ballRadius, 0.5);
					radius *= a;
					const k = 0.7;
					p5.fill(b.color[0] * k, b.color[1] * k, b.color[2] * k, 60 / k);
					p5.circle(bx, by, radius);
				}
			}
		};

		for (let b of forwardEngine.balls) {
			renderBall(b, alpha);
		}

		for (let b of forwardEngine.balls) {
			renderTrail(b);
		}
		for (let b of engine.balls) {
			renderTrail(b);
		}

		for (let b of engine.balls) {
			renderBall(b, alpha);
		}

		p5.pop();
	}
};
