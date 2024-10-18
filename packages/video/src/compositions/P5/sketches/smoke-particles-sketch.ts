import { Color, Image, Vector } from 'p5';
import { staticFile } from 'remotion';

import { P5RemotionController, TRemotionSketch } from '../P5RemotionController';

export const smokeParticleSketch: TRemotionSketch = (p5) => {
	const controller = new P5RemotionController(p5);
	let particleTexture: Image;
	let particleSystem: ParticleSystem;

	p5.preload = () => {
		particleTexture = p5.loadImage(staticFile('static/image/particle_texture.png'));
	};

	p5.setup = () => {
		controller.setup();
		p5.colorMode(p5.HSB);

		// Initialize the particle system
		particleSystem = new ParticleSystem(
			0,
			p5.createVector(p5.width / 2, p5.height - 60),
			particleTexture
		);
	};

	p5.updateWithProps = (props) => {
		controller.updateProps(props);
	};

	p5.draw = () => {
		p5.background(20);

		// Create a constant wind force
		const wind = p5.createVector(-0.1, 0);

		// Apply the wind and run the particle system
		particleSystem.applyForce(wind);
		particleSystem.run();
		for (let i = 0; i < 2; i++) {
			particleSystem.addParticle();
		}

		// Draw an arrow representing the wind force
		drawVector(wind, p5.createVector(p5.width / 2, 50), 500);
	};

	// Display an arrow to show a vector magnitude and direction
	const drawVector = (v: Vector, loc: Vector, scale: number) => {
		p5.push();
		const arrowSize = 4;
		p5.translate(loc.x, loc.y);
		p5.stroke(255);
		p5.strokeWeight(3);
		p5.rotate(v.heading());

		const length = v.mag() * scale;
		p5.line(0, 0, length, 0);
		p5.line(length, 0, length - arrowSize, +arrowSize / 2);
		p5.line(length, 0, length - arrowSize, -arrowSize / 2);
		p5.pop();
	};

	class ParticleSystem {
		particles: Particle[] = [];
		origin: Vector;
		img: Image;

		constructor(particleCount: number, origin: Vector, textureImage: Image) {
			this.origin = origin.copy();
			this.img = textureImage;
			for (let i = 0; i < particleCount; i++) {
				this.particles.push(new Particle(this.origin, this.img));
			}
		}

		run() {
			for (let i = this.particles.length - 1; i >= 0; i--) {
				const particle = this.particles[i];
				particle?.run();
				if (particle?.isDead()) {
					this.particles.splice(i, 1);
				}
			}
		}

		applyForce(dir: Vector) {
			this.particles.forEach((particle) => particle.applyForce(dir));
		}

		addParticle() {
			this.particles.push(new Particle(this.origin, this.img));
		}
	}

	class Particle {
		loc: Vector;
		velocity: Vector;
		acceleration: Vector;
		lifespan: number;
		texture: Image;
		color: Color;

		constructor(pos: Vector, imageTexture: Image) {
			this.loc = pos.copy();
			const xSpeed = p5.randomGaussian() * 0.3;
			const ySpeed = p5.randomGaussian() * 0.3 - 1.0;
			this.velocity = p5.createVector(xSpeed, ySpeed);
			this.acceleration = p5.createVector();
			this.lifespan = 100.0;
			this.texture = imageTexture;
			this.color = p5.color(p5.frameCount % 256, 255, 255);
		}

		run() {
			this.update();
			this.render();
		}

		render() {
			p5.imageMode(p5.CENTER);
			p5.tint(this.color as unknown as number, this.lifespan);
			p5.image(this.texture, this.loc.x, this.loc.y);
		}

		applyForce(f: Vector) {
			this.acceleration.add(f);
		}

		isDead() {
			return this.lifespan <= 0.0;
		}

		update() {
			this.velocity.add(this.acceleration);
			this.loc.add(this.velocity);
			this.lifespan -= 2.5;
			this.acceleration.mult(0);
		}
	}
};
