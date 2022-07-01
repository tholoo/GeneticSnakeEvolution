class Segment {
    constructor(pos, size, angle = 0, head = false) {
        this.start = pos.copy();
        this.size = size;
        this.r = this.size / 2;
        this.worldAngle = angle;
        this.localAngle = 0;
        this.end = new p5.Vector();
        this.head = head;
        this.getEnd();
    }

    getEnd() {
        this.end.x = Math.cos(this.getAngle());
        this.end.y = Math.sin(this.getAngle());
        this.end.mult(this.size).add(this.start);
    }

    getAngle() {
        return (this.worldAngle + this.localAngle) % TWO_PI;
    }

    setAngle(angle, local = false) {
        if (local) {
            this.localAngle = angle - this.worldAngle;
            this.localAngle %= TWO_PI;
            // if (!this.child) {
            // 	this.localAngle = constrain(
            // 		this.localAngle,
            // 		-QUARTER_PI,
            // 		QUARTER_PI
            // 	);
            // }
        } else {
            this.worldAngle = angle % TWO_PI;
        }
    }

    follow(target) {
        let dir = target.copy().sub(this.start);

        this.start.add(dir.copy().sub(dir.copy().setMag(this.size)));
        this.setAngle(dir.heading(), true);
        this.getEnd();
    }

    setStart(target) {
        this.start = target.copy();
        this.getEnd();
    }

    pointsTowards(segment, vec) {
        const [x1, y1, x2, y2] = [
            this.start.x,
            this.start.y,
            vec ? this.start.x + vec.x : this.end.x,
            vec ? this.start.y + vec.y : this.end.y,
        ];
        const [x3, y3, x4, y4] = [
            segment.start.x,
            segment.start.y,
            segment.end.x,
            segment.end.y,
        ];

        const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (d == 0) return;

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
        const u = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / d;

        if (0 <= t && 0 <= u && u <= 1) {
            return t * this.size;
        }
        return;
    }

    show(col) {
        fill(col);
        circle(this.start.x, this.start.y, this.size);

        fill(255, 0, 0);
        circle(this.start.x, this.start.y, this.r);

        if (!this.child) {
            push();
            translate(this.end.x, this.end.y);
            rotate(this.getAngle());
            fill(0, 255, 255);
            arc(
                0,
                0,
                this.size,
                this.size,
                QUARTER_PI,
                PI + HALF_PI + QUARTER_PI,
                PIE
            );
            // circle(this.end.x, this.end.y, this.size);

            fill(0, 0, 255, 100);
            circle(0, 0, this.r);
            pop();
        }

        push();
        stroke(30, 75, 30);
        strokeWeight(SIZE / 5);
        line(this.start.x, this.start.y, this.end.x, this.end.y);
        pop();
    }
}