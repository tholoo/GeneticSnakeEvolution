p5.disableFriendlyErrors = true;
const NUM_SNAKES = 50;
const MAX_SPEED = 10;
const NUM_SEGMENTS = 1;
const SIZE = 20;

// const NUM_FOODS = 3;
const FOOD_R = 10;

let REPRODUCE_CHANCE = 0.75;
let HUNGER_RATE = 0.001;
let MUTATION_CHANCE = 1;
let MUTATION_RATE = 1;

// let MUTATION_CHANCE = 0.1;
// let MUTATION_RATE = 0.1;
let CROSSOVER_CHANCE = 1;

config = new(function() {
    this.iters = 1;
    this.showBest = false;
})();

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);

    show = true;

    gui = new dat.GUI();
    gui.add(config, 'iters', 0, 500, 1);
    gui.add(config, 'showBest');

    population = new Population(NUM_SNAKES);
}

function draw() {
    for (let iter = 0; iter < config.iters; iter++) {
        show = iter % config.iters == 0;
        if (show) {
            background(40);
        }
        population.update(show);
    }
}