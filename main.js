// =================================
// ----------Mathematics------------
// =================================

// return the product of two complex numbers
function complex_product(c1, c2) {
	return [c1[0] * c2[0] - c1[1] * c2[1], c1[0] * c2[1] + c2[0] * c1[1]]
}

// returns the sum of two complex numbers
function complex_addition(complex1, complex2) {
	return [complex1[0] + complex2[0], complex1[1] + complex2[1]]
}

// returns the magnitude of complex number c
function complex_magnitude_squared(c) {
	return c[0] * c[0] + c[1] * c[1]
}

// function to return number of iterations processed before the magnitude of f(z) escapes given c value, 
function calculate_escape_time(c, iteration_depth, formula) {
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

function calculate_julia_escape_time(c, iteration_depth, formula, julia_value) {
	var z = c
	var i = 1
	while (i <= iteration_depth && complex_magnitude_squared(z) < 4) {
		z = formula(z, julia_value)
		i++
	}
	if (i > iteration_depth) {
		return Infinity
	}
	else {
		return i
	}
}

// =================================
// ------Fractal Algorithms---------
// =================================

function mandelbrot_altorhthm(z, c) {
	return complex_addition(complex_product(z, z), c)
}

function square_mandelbrot_altorhthm(z, c) {
	return complex_addition(complex_product(complex_product(z, z), z), c)
}

function newton_altorhthm(z, c) {
	return complex_addition(complex_product(complex_product(z, z), z), c)
}

// =================================
// ---------Canvas Setup------------
// =================================

// Set up canvas
var main_canvas = document.getElementById('fractal_viewport')
// get canvas details for later manipulation
var canvas_width = main_canvas.width
var canvas_height = main_canvas.height
var canvas_context = main_canvas.getContext('2d')
var renderer_console_output = ""

// =================================
// -------Pixel manipulation--------
// =================================

// function to update image according to the pixel information and the x y coordinate of the pixel
function update_pixel([r, g, b, l], x, y) {
	main_canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray([r, g, b, l]), 1, 1), x, y)
}

// Colouring algorithms
colouring_altorithms = {
	"linear": function(x){return x},
	"square": function(x){return x*x},
	"sqrt": function(x){return Math.sqrt(x)},
	"log": function(x){return Math.log(x)},
}

// colour ramp
function map_colour(escape_time, max_depth, begin_rgba, end_rgba, colouring_altorithm_name) {
	percentile = colouring_altorithms[colouring_altorithm_name](escape_time) / colouring_altorithms[colouring_altorithm_name](max_depth);
	resultant_rgba = [
		Math.round(begin_rgba[0] + ((end_rgba[0] - begin_rgba[0]) * percentile)),
		Math.round(begin_rgba[2] + ((end_rgba[2] - begin_rgba[2]) * percentile)),
		Math.round(begin_rgba[1] + ((end_rgba[1] - begin_rgba[1]) * percentile)),
		255
	]
	return resultant_rgba
}

// render fractal image according on canvas according to parameters
function render_fractal(x_min, x_max, y_min, y_max, iteration_depth, fractal_algorithm, julia_mode, begin_rgba, end_rgba, colouring_altorithm_name, julia_value = [0, 0]) {
	// process rendering parameters to calculate scaled dimensions according to cangas size
	var x_dim = canvas_width
	var y_dim = canvas_height
	var x_step = (x_max - x_min) / x_dim
	var y_step = (y_max - y_min) / y_dim
	// logging
	console.log("Start rendering")
	console.log("x_min: " + x_min)
	console.log("x_max: " + x_max)
	console.log("y_min: " + y_min)
	console.log("y_max: " + y_max)
	console.log("x_dim: " + x_dim)
	console.log("y_dim: " + y_dim)
	console.log("x_step: " + x_step)
	console.log("y_step: " + y_step)
	if(julia_mode) {
		console.log("julia enabled")
			// iterate by rows
			var imaginary = y_max
			for (let i = 1; i <= y_dim; i++) {
				var real = x_min
				for (let j = 1; j <= x_dim; j++) {
						var escape_time = calculate_julia_escape_time([real, imaginary], iteration_depth, fractal_algorithm, julia_value)
						// if fully escape
						if(escape_time == Infinity) {
							update_pixel(end_rgba, j, i)
						}
						// if partially escape
						else {
							update_pixel(map_colour(escape_time, iteration_depth, begin_rgba, end_rgba, colouring_altorithm_name), j, i)
						}
					real = real + x_step
				}
				imaginary = imaginary - y_step
				console.log("progress: " + Math.round(100 * (i / y_dim)) + "%")
			}
	}
	else {
		// iterate by rows
		var imaginary = y_max
		for (let i = 1; i <= y_dim; i++) {
			var real = x_min
			for (let j = 1; j <= x_dim; j++) {
					var escape_time = calculate_escape_time([real, imaginary], iteration_depth, fractal_algorithm)
					// if fully escape
					if(escape_time == Infinity) {
						update_pixel(end_rgba, j, i)
					}
					// if partially escape
					else {
						update_pixel(map_colour(escape_time, iteration_depth, begin_rgba, end_rgba, colouring_altorithm_name), j, i)
					}
				real = real + x_step
			}
			imaginary = imaginary - y_step
			console.log("progress: " + Math.round(100 * (i / y_dim)) + "%")
		}
	}
}

// =================================
// -------Events Handeling----------
// =================================

// Render button
function render_trigger() {
	render_fractal(x_min, x_max, y_min, y_max, 100, mandelbrot_altorhthm, true, [255,255,255,255], [0,0,0,255], "sqrt", [-0.14,0.7])
}

// =================================
// ----------Playground-------------
// =================================

update_pixel([155, 155, 155, 155], 12, 12)

var x_min = -2
var x_max = 2
var y_min = -2
var y_max = 2


console.log(calculate_julia_escape_time([1, 1], 100, mandelbrot_altorhthm))
console.log(calculate_escape_time([0.9, 0.1], 100, mandelbrot_altorhthm))