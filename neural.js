class Activation {
    constructor(func, dfunc) {
        this.func = func;
        this.dfunc = dfunc;
    }
}

let sigmoid = new Activation(
    (x) => 1 / (1 + Math.exp(-x)),
    (y) => y * (1 - y)
);

let tanh = new Activation(
    (x) => Math.tanh(x),
    (y) => 1 - Math.pow(y, 2)
);

let none = new Activation(
    (x) => x,
    (y) => y
);

let clamp = new Activation((x) => constrain(x, -1, 1));
let relu = new Activation((x) => max(0, x));
let mish = new Activation((x) => x * Math.tanh(softplus.func(x)));

let softplus = new Activation((x) => Math.log(1 + Math.exp(x)));

class Neural {
    constructor(n_inputs, n_hiddens, n_outputs) {
        if (n_inputs instanceof Array) {
            // Copy neural network
            this.shape = [...n_inputs];
            this.weights = [...n_hiddens].map((matrix) => matrix.copy());
            this.biases = [...n_outputs].map((matrix) => matrix.copy());
        } else {
            if (!(n_hiddens instanceof Array)) {
                n_hiddens = [n_hiddens];
            }
            n_hiddens = n_hiddens.filter((x) => x > 0);

            this.shape = [n_inputs, ...n_hiddens, n_outputs];
            this.weights = [];
            this.biases = [];

            for (let i = 0; i < this.shape.length - 1; i++) {
                this.weights.push(
                    new Matrix(this.shape[i], this.shape[i + 1]).initilize(
                        n_inputs,
                        n_outputs
                    )
                );
                this.biases.push(
                    new Matrix(1, this.shape[i + 1]).randomize()
                );
            }
        }
        this.activation = tanh;
        this.lastActivation = tanh;
    }

    mutate(chance, amnt) {
        this.weights = this.weights.map((weight) =>
            weight.mutate(chance, amnt)
        );
        this.biases = this.biases.map((bias) =>
            bias.mutate(chance, amnt)
        );
    }

    crossover(neural, chance = 0.5) {
        // let ind = Math.floor(random(this.weights.length));

        // for (let i = ind; i < this.weights.length; i++) {
        // 	this.weights[i] = neural.weights[i].copy();
        // }

        // ind = Math.floor(random(this.biases.length));

        // for (let i = ind; i < this.biases.length; i++) {
        // 	this.biases[i] = neural.biases[i].copy();
        // }

        this.weights = this.weights.map((weight, i) =>
            weight.crossover(neural.weights[i].copy(), chance)
        );
        this.biases = this.biases.map((bias, i) =>
            bias.crossover(neural.biases[i].copy(), chance)
        );
    }

    copy() {
        return new Neural(this.shape, this.weights, this.biases);
    }

    feedforward(arr, returnMatrix = false, memory = false) {
        if (arr.length != this.shape[0]) {
            console.error('Input shape not as expected! ' + arr.length);
            return;
        }
        let inputs = new Matrix(1, this.shape[0]).set(arr);

        let result = inputs;
        if (memory) {
            this.memory = [inputs];
        }

        const len = this.weights.length;
        for (let i = 0; i < len; i++) {
            const weight = this.weights[i];
            const bias = this.biases[i];

            result = Matrix.dot(result, weight).add(bias);

            if (i == len - 1) {
                result = result.map(this.lastActivation.func);
            } else {
                result = result.map(this.activation.func);
            }
            if (memory) {
                this.memory.push(result);
            }
        }

        if (returnMatrix) {
            return result;
        } else {
            return result.values.flat();
        }
    }

    train(x, y, learningRate = 0.1) {
        let yhat = this.feedforward(x, true, true);

        let error = y.map((x, i) => x - yhat.values.flat()[i]);
        error = new Matrix(1, error.length).set(error);

        for (let i = this.weights.length - 1; i >= 0; i--) {
            const weight = this.weights[i];
            const layer = this.memory[i + 1];

            let gradients = layer
                .map(this.activation.dfunc)
                .mult(error)
                .mult(learningRate);

            let deltas = Matrix.dot(
                Matrix.transpose(this.memory[i]),
                gradients
            );

            this.weights[i].add(deltas);
            this.biases[i].add(gradients);

            error = Matrix.dot(error, Matrix.transpose(weight));
        }
    }

    print() {
        this.weights.map((weight) => weight.print());
        this.biases.map((bias) => bias.print());
    }
}