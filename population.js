class Population {
    constructor(num) {
        this.num = num;

        this.init();
    }

    initVariables() {
            // this.foods = [];
            this.snakes = [];
            this.sumFitness = 0;
            this.bestFitness = 0;
            this.bestSnake;
            this.bestSnakeAlive;
            this.lenSnakes = this.num;
        }
        // initFood() {
        // 	for (let i = 0; i < NUM_FOODS; i++) {
        // 		this.foods.push(this.createFood());
        // 	}
        // }

    init() {
        this.initVariables();
        // this.initFood();

        for (let i = 0; i < NUM_SNAKES; i++) {
            this.snakes.push(this.createSnake());
        }
        this.deadSnakes = [];
    }

    createSnake() {
        return new Snake(
            new p5.Vector(
                random(SIZE, width - SIZE),
                random(SIZE, height - SIZE)
            ),
            HUNGER_RATE,
            MAX_SPEED,
            NUM_SEGMENTS,
            SIZE
        );
    }
    createFood() {
        return new Food(
            random(FOOD_R, width - FOOD_R),
            random(FOOD_R, height - FOOD_R),
            FOOD_R
        );
    }

    selectOne(arr) {
        let rand = random(this.sumFitness);
        let index = -1;
        let theChosenOne;

        while (rand >= 0) {
            index++;
            theChosenOne = arr[index];
            rand -= theChosenOne.fitness;
        }
        return theChosenOne;
    }

    nextPopulation() {
        this.initVariables();
        // this.initFood();

        for (const deadSnake of this.deadSnakes) {
            deadSnake.fitness = Math.pow(deadSnake.fitness, 2);
            this.sumFitness += deadSnake.fitness;
        }

        for (let i = 0; i < NUM_SNAKES; i++) {
            const snakeA = this.selectOne(this.deadSnakes);
            const snakeB = this.selectOne(this.deadSnakes);
            this.snakes.push(
                snakeA.reproduce(
                    new p5.Vector(
                        random(SIZE, width - SIZE),
                        random(SIZE, height - SIZE)
                    ),
                    snakeB
                )
            );
        }

        this.deadSnakes = [];
    }

    update(show = true) {
        for (let i = this.snakes.length - 1; i >= 0; i--) {
            const snake = this.snakes[i];
            // snake.think(this.foods, this.snakes);
            const isBest = snake == this.bestSnakeAlive;
            const showBest =
                show &&
                (!config.showBest ||
                    (config.showBest && (isBest || !this.bestSnakeAlive)));

            const dead = snake.update_show(showBest);

            if (dead) {
                this.snakes.splice(i, 1);
                this.lenSnakes--;
                this.deadSnakes.push(snake);
                if (this.deadSnakes.length > this.num) {
                    this.deadSnakes.shift();
                }
                if (isBest) {
                    this.bestSnakeAlive = false;
                }
            } else {
                if (!this.bestSnakeAlive ||
                    snake.fitness > this.bestSnakeAlive.fitness
                ) {
                    this.bestSnakeAlive = snake;
                }
            }

            if (snake.fitness > this.bestFitness) {
                this.bestFitness = snake.fitness;
                this.bestSnake = snake;
            }
        }


        if (this.lenSnakes <= 0) {
            console.log(this.bestFitness);
            this.nextPopulation();
        }
    }
}