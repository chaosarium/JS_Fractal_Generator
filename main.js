// Set up canvas
var main_canvas = document.getElementById('fractal_viewport')
// get canvas details for later manipulation
var canvas_width = main_canvas.width
var canvas_height = main_canvas.height
var canvas_context = main_canvas.getContext('2d')
var renderer_console_output = ""

// return the product of two complex numbers
function complex_product(c1, c2) {
	return [c1[0] * c2[0] - c1[1] * c2[1], c1[0] * c2[1] + c2[0] * c1[1]]
}

// returns the sum of two complex numbers
function complex_addition(complex1, complex2) {
	return [complex1[0] + complex2[0], complex1[1] + complex2[1]]
}

// returns the value after one iteration given complex number z and c
function mandelbrot_altorhthm(z, c) {
	return complex_addition(complex_product(z, z), c)
}

// returns the magnitude of complex number c
function complex_magnitude_squared(c) {
	return c[0] * c[0] + c[1] * c[1]
}

// function to return number of iterations processed before the magnitude of f(z) escapes
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

// function to update image according to the pixel information and the x y coordinate of the pixel
function update_pixel([r, g, b, l], x, y) {
	main_canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray([r, g, b, l]), 1, 1), x, y)
}

update_pixel([155, 155, 155, 155], 12, 12)



var x_min = -2
var x_max = 2
var y_min = -2
var y_max = 2


// render fractal image according on canvas according to parameters
function render_fractal(x_min, x_max, y_min, y_max, iteration_depth) {
	// process rendering parameters
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
	// iterate by rows
	var imaginary = y_max
	for (let i = 1; i <= y_dim; i++) {
		var real = x_min
		for (let j = 1; j <= x_dim; j++) {
				if(escape_time([real, imaginary], 100, mandelbrot_altorhthm) == Infinity) {
					renderer_console_output = renderer_console_output + "X"
					update_pixel([0, 0, 0, 255], j, i)
				}
				else {
					renderer_console_output = renderer_console_output + " "
					update_pixel([255, 255, 255, 255], j, i)
				}
			real = real + x_step
		}
		imaginary = imaginary - y_step
		renderer_console_output = renderer_console_output + "\n"
		console.log("row " + i + " of " + y_dim)
	}
}

function render_trigger() {
	render_fractal(x_min, x_max, y_min, y_max, 10)
}

console.log(renderer_console_output)








