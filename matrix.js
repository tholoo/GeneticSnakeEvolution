class Matrix {
	constructor(rows, cols, values) {
		this.rows = rows;
		this.cols = cols;
		if (values) {
			this.values = values;
		} else {
			this.values = Array(rows)
				.fill()
				.map(() => Array(cols).fill(0));
		}
	}

	copy() {
		let clone = new Matrix(this.rows, this.cols, [
			...this.values.map((arr) => [...arr]),
		]);
		return clone;
	}

	initilize(nIn, nOut) {
		return this.map(() => random(-1, 1));
		// let r = Math.sqrt(6 / (nIn + nOut));
		// return this.map(() => Math.random() * 2 * r - r);
	}

	randomize(range = 1) {
		return this.map(() => random(-range, range));
	}

	set(setArr) {
		if (setArr.length != this.rows * this.cols) {
			console.error("Array length doesn't match matrix");
			return;
		}
		this.values = this.values.map((arr, row) =>
			arr.map((_, col) => setArr[row * this.cols + col])
		);
		return this;
	}

	add(value) {
		if (value instanceof Matrix) {
			if (this.rows != value.rows || this.cols != value.cols) {
				console.error("Cols and Rows don't match for addition");
				return;
			}
			this.values = this.values.map((arr, row) =>
				arr.map((x, col) => x + value.values[row][col])
			);
			return this;
		} else {
			return this.map((x) => x + value);
		}
	}

	subtract(value) {
		return this.map((x) => x - value);
	}

	mult(value) {
		if (value instanceof Matrix) {
			if (this.rows != value.rows || this.cols != value.cols) {
				console.error(
					"Rows and Columns don't match for multiplication"
				);
			}

			this.values = this.values.map((arr, row) =>
				arr.map((x, col) => x * value.values[row][col])
			);

			return this;
		} else {
			return this.map((x) => x * value);
		}
	}

	static transpose(m) {
		let result = new Matrix(m.cols, m.rows);
		result.values = result.values.map((arr, row) =>
			arr.map((x, col) => m.values[col][row])
		);
		return result;
	}

	map(func) {
		this.values = this.values.map((arr) => arr.map(func));
		return this;
	}
	mutate(chance, sd = 0.1) {
		return this.map((x) =>
			random() <= chance ? x * randomGaussian(1, sd) : x
		);
	}

	crossover(matrix, chance = 0.5) {
		this.values = this.values.map((arr, row) =>
			arr.map((x, col) =>
				random() <= chance ? x : matrix.values[row][col]
			)
		);
		return this;
	}

	static dot(m1, m2) {
		if (m1.cols != m2.rows) {
			console.error('COLUMNS and ROWS do not match');
			return;
		}

		let result = new Matrix(m1.rows, m2.cols);

		result.values = result.values.map((arr, row) =>
			arr.map((_, col) =>
				m1.values[row]
					.map((x, i) => x * m2.values[i][col])
					.reduce((a, b) => a + b)
			)
		);

		// for (let row = 0; row < result.rows; row++) {
		// 	for (let col = 0; col < result.cols; col++) {
		// 		result.values[row][col] = m1.values[row]
		// 			.map((x, i) => x * m2.values[i][col])
		// 			.reduce((a, b) => a + b);
		// 	}
		// }
		return result;
	}

	print() {
		console.table(this.values);
	}
}
