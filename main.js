function complex_product(c1, c2) {
	return [c1[0] * c2[0] - c1[1] * c2[1], c1[0] * c2[1] + c2[0] * c1[1]]
}

function complex_addition(complex1, complex2) {
	return [complex1[0] + complex2[0], complex1[1] + complex2[1]]
}

function mandelbrot_altorhthm(z, c) {
	return complex_addition(complex_product(z, z), c)
}

function complex_magnitude_squared(c) {
	return c[0] * c[0] + c[1] * c[1]
}

function escape_time(c, iteration_depth, formula) {
	var z = [0, 0]
	var i = 1
	while (i <= iteration_depth && complex_magnitude_squared(z) < 4) {
		z = formula(z, c)
		i++
	}
	if (i > iteration_depth) {
		return Infinity
	}
	else {
		return i
	}
}

console.log(escape_time([0.3, 0], 100, mandelbrot_altorhthm))

