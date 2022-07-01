class Food {
	constructor(x, y, r) {
		this.pos = new p5.Vector(x, y);
		this.r = r;
		this.animateR = 0;
	}
	isEaten(snake) {
		return this.pos.dist(snake.head.end) <= snake.r + this.r;
	}
	update() {
		this.animateR = lerp(this.animateR, this.r, 0.1);
	}
	show() {
		stroke(0);
		strokeWeight(1);
		fill(0, 255, 0);
		circle(this.pos.x, this.pos.y, this.animateR * 2);
		fill(0, 100, 0);
		circle(this.pos.x, this.pos.y, this.animateR / 1.5);
	}
}
