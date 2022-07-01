class Snake {
    constructor(pos, hungerRate, maxSpeed, n, size, brain) {
        this.r = size / 2;
        this.size = size;
        this.segments = [];

        this.segments.push(new Segment(pos, size, random(TWO_PI), true));
        this.head = this.segments[0];

        for (let i = 1; i < n; i++) {
            this.addSegment();
        }

        for (let i = this.segments.length - 1; i > 0; i--) {
            this.segments[i].child = this.segments[i - 1];
        }

        this.maxSpeed = maxSpeed;
        this.vel = new p5.Vector();
        this.acc = new p5.Vector();

        // X Multiplier, Y Multiplier, Distance Divider, Color
        if (brain) {
            this.brain = brain;
        } else {
            this.brain = new Neural(29, [32], 3);
        }
        this.dna = [
            [random(255), random(255), random(255)]
        ];
        // this.dna = [
        // 	random(-1, 1),
        // 	random(-1, 1),
        // 	random(-3, 3) + 0.1,
        // 	[random(255), random(255), random(255)],
        // 	random(-1, 1),
        // 	random(-1, 1),
        // 	random(-3, 3) + 0.1,
        // ];

        this.hunger = 1;
        this.hungerRate = hungerRate;

        this.fitness = this.segments.length;
        this.food = new Food(
            random(FOOD_R, width - FOOD_R),
            random(FOOD_R, height - FOOD_R),
            FOOD_R
        );
    }

    applyForce(force) {
        this.acc.add(force);
    }
    addSegment() {
        const last = this.segments[this.segments.length - 1];
        let pos = last.start.copy().add(last.start.copy().sub(last.end));

        const seg = new Segment(pos, this.size);
        seg.child = last;
        this.segments.push(seg);
    }

    mutate(chance = 0.5, rate = 0.1) {
        for (let i = 0; i < 3; i++) {
            if (random() <= 1) {
                this.dna[0][i] += randomGaussian(1, rate);
                this.dna[0][i] = constrain(this.dna[0][i], 0, 255);
            }
        }
        // for (let i = 1; i < this.dna.length; i++) {
        // 	if (random() <= 1) {
        // 		this.dna[i] *= randomGaussian(1, rate);
        // 	}
        // }

        this.brain.mutate(chance, rate);
        // for (let i = 0; i <= 2; i++) {
        // 	if (random() <= chance) {
        // 		this.dna[i] *= random(1 - rate, 1.01 + rate);
        // 	}
        // }
        // for (let i = 4; i <= 5; i++) {
        // 	if (random() <= chance) {
        // 		this.dna[i] *= random(1 - rate, 1.01 + rate);
        // 	}
        // }

        // for (let i = 0; i < 3; i++) {
        // 	if (random() <= 1) {
        // 		this.dna[3][i] *= random(1 - rate, 1.01 + rate);
        // 		this.dna[3][i] = max(0, min(255, this.dna[3][i]));
        // 	}
        // }
    }

    copy(pos) {
        const snake = new Snake(
            pos,
            HUNGER_RATE,
            this.maxSpeed,
            NUM_SEGMENTS,
            this.size,
            this.brain.copy()
        );

        snake.dna = [...this.dna];
        snake.dna[0] = [...this.dna[0]];
        return snake;
    }

    reproduce(pos = false, parent = false) {
        if (!pos) {
            pos = this.segments[this.segments.length - 1].start;
        }
        const snake = this.copy(pos);

        if (parent) {
            let c_chance = this.fitness / (this.fitness + parent.fitness);
            this.brain.crossover(parent.brain, c_chance * CROSSOVER_CHANCE);
        }

        snake.mutate(
            1 / Math.pow(this.fitness, 2),
            1 / Math.pow(this.fitness, 2)
        );
        // snake.mutate(
        // 	randomGaussian(0, 0.5) + 1 / Math.pow(this.fitness, 2),
        // 	randomGaussian(0, 0.5) + 1 / Math.pow(this.fitness, 2)
        // );
        return snake;
    }

    eat(lenSnakes) {
        this.addSegment();
        // this.fitness *= 2;
        this.fitness += 1;
        // this.hunger += Math.pow(NUM_SNAKES / lenSnakes, 2);
        // this.hunger = constrain(this.hunger, 0, 10);
        this.hunger = 1;
        this.timer = 0;
        return random() <= REPRODUCE_CHANCE;
    }

    distHeadToSegment() {
        let closest = Infinity;
        for (const segment of this.segments) {
            if (segment != this.head) {
                const d = this.head.pointsTowards(segment);
                if (d) {
                    closest = min(closest, d);
                }
            }
        }
        if (closest == Infinity) {
            return;
        } else {
            return closest;
        }
    }

    headRays(angle) {
        let vec = p5.Vector.fromAngle(angle);
        let closest = Infinity;

        for (const segment of this.segments) {
            if (segment != this.head) {
                const d = this.head.pointsTowards(segment, vec);
                if (d) {
                    closest = min(closest, d);
                }
            }
        }
        if (closest == Infinity) {
            return 1;
        } else {
            return closest;
        }
    }

    think(snakes) {
        let closestFood = this.food;
        let closestFoodD = this.food.pos.dist(this.head.end);
        // this.fitness += 1 / closestFoodD;

        // let closestSnake;
        // let closestSnakeD = Infinity;

        // for (const snake of snakes) {
        // 	const d = snake.dist(this);
        // 	if (d < closestSnakeD) {
        // 		closestSnakeD = d;
        // 		closestSnake = snake;
        // 	}
        // }

        let closestSegment;
        let closestSegmentD = Infinity;

        for (const seg of this.segments) {
            const d = this.head.end.dist(seg.start);
            if (d < closestSegmentD) {
                closestSegmentD = d;
                closestSegment = seg;
            }
        }
        const dirToSeg = closestSegment.start
            .copy()
            .sub(this.head.end)
            .normalize();
        // fill(255);
        // circle(closestSegmentVec.x, closestSegmentVec.y, 25);

        let dirToFood = closestFood.pos
            .copy()
            .sub(this.head.end)
            .normalize();

        // let dirToSnake = closestSnake.head.end
        // 	.copy()
        // 	.sub(this.head.end)
        // 	.normalize();

        let h = this.head.end;

        // let inputs = [dirToFood.x, dirToFood.y];
        // let inputs = [
        // 	map(dirToFood.x, -1, 1, 0, 1),
        // 	map(dirToFood.y, -1, 1, 0, 1),
        // 	map(h.x, 0, width, 0, 1),
        // 	map(h.y, 0, height, 0, 1),
        // 	map(dirToSeg.x, -1, 1, 0, 1),
        // 	map(dirToSeg.y, -1, 1, 0, 1),
        // 	sigmoid.func(closestSegmentD),
        // 	sigmoid.func(closestFoodD),
        // 	map(this.vel.x, -this.maxSpeed, this.maxSpeed, 0, 1),
        // 	map(this.vel.y, -this.maxSpeed, this.maxSpeed, 0, 1),
        // ];
        let ds = [];
        for (let angle = -45; angle <= 45; angle += 5) {
            let d = this.headRays(radians(angle));
            d = Math.pow(map(d, 0, width * height, -1, 1), 3);
            ds.push(d);
        }

        let inputs = [
            dirToFood.x,
            dirToFood.y,
            map(h.x, 0, width, -1, 1),
            map(h.y, 0, height, -1, 1),
            dirToSeg.x,
            dirToSeg.y,
            Math.pow(map(closestSegmentD, 0, width * height, -1, 1), 2),
            Math.pow(map(closestFoodD, 0, width * height, -1, 1), 2),
            this.vel.x / this.maxSpeed,
            this.vel.y / this.maxSpeed,
            ...ds,
        ];
        // let inputs = [
        // 	dirToFood.x,
        // 	dirToFood.y,
        // 	h.x,
        // 	h.y,
        // 	closestFoodD,
        // 	this.vel.x,
        // 	this.vel.y,
        // ].map(tanh.func);

        // let inputs = [
        // 	map(dirToFood.x, closestFood.r, width - closestFood.r, -1, 1),
        // 	map(
        // 		dirToFood.y,
        // 		closestFood.r,
        // 		height - closestFood.r,
        // 		-1,
        // 		1
        // 	),
        // ];
        let decision = this.brain.feedforward(inputs);
        // this.move(decision[0]);


        let decisionVector = new p5.Vector(decision[0], decision[1])
            .mult(this.maxSpeed * decision[2])
            .limit(this.maxSpeed);


        this.applyForce(decisionVector);

        return closestSegmentD < this.head.r + closestSegment.r / 2;
    }
    dist(snake) {
        return snake.head.end.copy().dist(this.head.end);
    }
    isDead(snakes) {
        if (this.hunger <= 0) return true;

        let h = this.head.end.copy();
        if (h.x <= this.r || h.x >= width - this.r) {
            return true;
        } else if (h.y <= this.r || h.y >= height - this.r) {
            return true;
        }
    }

    move(amnt) {

        // push();
        let angle = amnt * QUARTER_PI + this.head.getAngle();
        angle %= TWO_PI;
        this.vel.setHeading(angle);
        // stroke(255);
        // strokeWeight(4);
        // line(0, 0, this.vel.x * 10, this.vel.y * 10);
        // pop();
    }

    update_show(show = true) {
        const dead = this.think();

        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.acc.mult(0);

        // Within screen
        let target = this.head.end.copy().add(this.vel);

        target.x = min(target.x, width - this.r);
        target.x = max(target.x, this.r);

        target.y = min(target.y, height - this.r);
        target.y = max(target.y, this.r);

        // Update and show segments
        for (const seg of this.segments) {
            seg.follow(target);
            target = seg.start;
            // seg.show(this.dna[3]);
        }

        this.food.update();
        let eaten = this.food.isEaten(this);
        if (eaten) {
            const new_snake = this.eat();
            this.food = new Food(
                random(FOOD_R, width - FOOD_R),
                random(FOOD_R, height - FOOD_R),
                FOOD_R
            );
        }

        if (show) {
            strokeWeight(1);
            stroke(0);
            for (let i = this.segments.length - 1; i >= 0; i--) {
                this.segments[i].show(this.dna[0]);
            }
            this.food.show();
        }
        this.hunger -= this.hungerRate;

        return dead || this.isDead();
    }
}