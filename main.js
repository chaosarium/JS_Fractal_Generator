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

// returns the reciprocal of a complex numbers
function complex_reciprocal(complex) {
	return [complex[0] / ((complex[0] * complex[0]) + (complex[1] * complex[1])), (0 - complex[1]) / ((complex[0] * complex[0]) + (complex[1] * complex[1]))]
}

// returns the magnitude of complex number c
function complex_magnitude_squared(c) {
	return c[0] * c[0] + c[1] * c[1]
}

// function to return number of iterations processed before the magnitude of f(z) escapes given c value and that z initial = 0, 
function calculate_escape_time(c, iteration_depth, bailout, formula) {
	var z = [0, 0]
	var i = 1
	while (i <= iteration_depth && complex_magnitude_squared(z) < bailout) {
		z = fractal_algorithms[formula](z, c)
		i++
	}
	if (i > iteration_depth) {
		return Infinity
	}
	else {
		return i
	}
}

// function to return number of iterations processed before the magnitude of f(z) escapes given c value and that z initial = c, 
function calculate_julia_escape_time(c, iteration_depth, bailout, formula, julia_value) {
	var z = c
	var i = 1
	while (i <= iteration_depth && complex_magnitude_squared(z) < bailout) {
		z = fractal_algorithms[formula](z, julia_value)
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

var fractal_algorithms = {
	"mandelbrot_algorhthm": function(z, c) {return complex_addition(complex_product(z, z), c)},
	"mandelbrot_cubed_altorhthm": function(z, c) {return complex_addition(complex_product(complex_product(z, z), z), c)},
	"newton_altorhthm": function(z, c) {return complex_addition(complex_product(complex_product(z, z), z), [-1,0])},
	"burning_ship_altorhthm": function(z, c) {return complex_addition(complex_product([Math.abs(z[0]), Math.abs(z[1])], [Math.abs(z[0]), Math.abs(z[1])]), c)},
	"magnet_altorhthm": function(z, c) {return complex_product(complex_product(complex_addition(complex_addition(complex_product(z, z), c), [-1, 0]), complex_reciprocal(complex_addition(complex_addition(complex_product([2, 0], z), c), [-2, 0]))), complex_product(complex_addition(complex_addition(complex_product(z, z), c), [-1, 0]), complex_reciprocal(complex_addition(complex_addition(complex_product([2, 0], z), c), [-2, 0]))))},
	"suspicious_mandelbrot_altorhthm": function(z, c) {return complex_addition(complex_product(z, complex_addition(z, c)), c)},
}

// =================================
// -----------Setup DOM-------------
// =================================

// Set up canvas
var main_canvas = document.getElementById('fractal_viewport')
// get canvas details for later manipulation
var canvas_width = main_canvas.width
var canvas_height = main_canvas.height
var canvas_context = main_canvas.getContext('2d')
var renderer_console_output = ""
// get control over status text
var status_text = document.getElementById("status_text")
// Function to update status text
function update_status(message) {
	status_text.innerHTML = message
}

// =================================
// -------Pixel manipulation--------
// =================================

// function to update image according to the pixel information and the x y coordinate of the pixel
function update_pixel([r, g, b, l], x, y) {
	main_canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray([r, g, b, l]), 1, 1), x, y)
}

// Colouring algorithms
colouring_algorithms = {
	"linear": function(x){return x},
	"square": function(x){return x*x},
	"sqrt": function(x){return Math.sqrt(x)},
	"log": function(x){return Math.log(x)},
}

// colour ramp
var colour_presets = {
	"greyscale": [[255,255,255,255], [0,0,0,255]],
	"inverted_greyscale": [[0,0,0,255], [255,255,255,255]],
	"ocean": [[137, 196, 214,255], [64, 108, 219,255]],
	"flame": [[227, 8, 0,255],[245, 215, 44,255]],
	"life": [[0,0,0,255], [255,255,255,255]],
}

function map_colour(escape_time, max_depth, begin_rgba, end_rgba, colouring_algorithm_name) {
	percentile = colouring_algorithms[colouring_algorithm_name](escape_time) / colouring_algorithms[colouring_algorithm_name](max_depth);
	resultant_rgba = [
		Math.round(begin_rgba[0] + ((end_rgba[0] - begin_rgba[0]) * percentile)),
		Math.round(begin_rgba[2] + ((end_rgba[2] - begin_rgba[2]) * percentile)),
		Math.round(begin_rgba[1] + ((end_rgba[1] - begin_rgba[1]) * percentile)),
		255
	]
	return resultant_rgba
}

// render fractal image according on canvas according to parameters
function render_fractal(x_centre, y_centre, zoom_level, iteration_depth, bailout, fractal_algorithm, julia_mode, begin_rgba, end_rgba, colouring_algorithm_name, julia_value = [0, 0]) {
	// process rendering parameters to calculate scaled dimensions according to cangas size
	var x_min = x_centre - (1 / zoom_level)
	var x_max = x_centre + (1 / zoom_level)
	var y_min = y_centre - (1 / zoom_level)
	var y_max = y_centre + (1 / zoom_level)
	// calculate step size
	var x_step = (x_max - x_min) / canvas_width
	var y_step = (y_max - y_min) / canvas_height
	// iterate by rows
	var imaginary = y_max
	for (let i = 1; i <= canvas_height; i++) {
		setTimeout(function() {
			var real = x_min
			for (let j = 1; j <= canvas_width; j++) {
				if(julia_mode) {
					var escape_time = calculate_julia_escape_time([real, imaginary], iteration_depth, bailout, fractal_algorithm, julia_value)
				}
				else {
					var escape_time = calculate_escape_time([real, imaginary], iteration_depth, bailout,  fractal_algorithm)
				}
				// if fully escape
				if(escape_time == Infinity) {
					update_pixel(end_rgba, j, i)
				}
				// if partially escape
				else {
					update_pixel(map_colour(escape_time, iteration_depth, begin_rgba, end_rgba, colouring_algorithm_name), j, i)
				}
				real = real + x_step
			}
			imaginary = imaginary - y_step
			console.log("progress: " + Math.round(100 * (i / canvas_height)) + "%")
			update_status("Calculation progress: " + Math.round(100 * (i / canvas_height)) + "%")
		}, 1);
	}
	update_status("Done")
}

// =================================
// -------Events Handeling----------
// =================================

// Render button
function render_trigger() {
	// collect user input
	user_x_centre = parseFloat(document.getElementById("x_centre").value)
	user_y_centre = parseFloat(document.getElementById("y_centre").value)
	user_zoom_level = parseFloat(document.getElementById("zoom_level").value)
	user_iteration_depth = Math.round(document.getElementById("iteration_depth").value)
	user_bailout = parseFloat(document.getElementById("bailout").value)
	user_fractal_algorithm = document.getElementById("fractal_algorithm").value
	user_colouring_algorithm = document.getElementById("colouring_algorithm").value
	user_colour_ramp = document.getElementById("colour_ramp").value
	user_julia_mode = (document.getElementById("mode").value == "julia_mode")
	user_julia_coordinate = [parseFloat(document.getElementById("julia_real").value), parseFloat(document.getElementById("julia_imaginary").value)]
	console.log(user_julia_coordinate)
	// render based on user parameters
	render_fractal(user_x_centre, user_y_centre, user_zoom_level, user_iteration_depth, user_bailout, user_fractal_algorithm, user_julia_mode, colour_presets[user_colour_ramp][0], colour_presets[user_colour_ramp][1], user_colouring_algorithm, user_julia_coordinate)
}

// =================================
// ----------Playground-------------
// =================================

update_pixel([155, 155, 155, 155], 12, 12)

var x_centre = 0.3
var y_centre = 0
var zoom_level = 4


// console.log(calculate_julia_escape_time([1, 1], 100, mandelbrot_altorhthm))
// console.log(calculate_escape_time([0.9, 0.1], 100, mandelbrot_altorhthm))