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

// function to return number of iterations processed before the magnitude of f(z) escapes given c value and that z initial = 0, 
function calculate_escape_time(c, iteration_depth, formula) {
	var z = [0, 0]
	var i = 1
	while (i <= iteration_depth && complex_magnitude_squared(z) < 4) {
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
function calculate_julia_escape_time(c, iteration_depth, formula, julia_value) {
	var z = c
	var i = 1
	while (i <= iteration_depth && complex_magnitude_squared(z) < 4) {
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
	mandelbrot_algorhthm: function(z, c) {return complex_addition(complex_product(z, z), c)},

	square_mandelbrot_altorhthm: function(z, c) {return complex_addition(complex_product(complex_product(z, z), z), c)},

	newton_altorhthm: function(z, c) {return complex_addition(complex_product(complex_product(z, z), z), c)}
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
// get control over status bar
var progress_bar = document.getElementById("progress_bar_inside")
// Function to update progress bar
function update_progress_bar(value) {
	progress_bar.style.width = value + "%"
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
function render_fractal(x_centre, y_centre, zoom_level, iteration_depth, fractal_algorithm, julia_mode, begin_rgba, end_rgba, colouring_algorithm_name, julia_value = [0, 0]) {
	// process rendering parameters to calculate scaled dimensions according to cangas size
	var x_min = x_centre - zoom_level
	var x_max = x_centre + zoom_level
	var y_min = y_centre - zoom_level
	var y_max = y_centre + zoom_level
	// calculate step size
	var x_step = (x_max - x_min) / canvas_width
	var y_step = (y_max - y_min) / canvas_height
	// logging
	if(julia_mode) {
		// iterate by rows
		var imaginary = y_max
		for (let i = 1; i <= canvas_height; i++) {
			setTimeout(() => {
				var real = x_min
				for (let j = 1; j <= canvas_width; j++) {
						var escape_time = calculate_julia_escape_time([real, imaginary], iteration_depth, fractal_algorithm, julia_value)
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
				update_status("calculating julia... progress: " + Math.round(100 * (i / canvas_height)) + "%")
			}, 1);
		}
	}
	else {
		// iterate by rows
		var imaginary = y_max
		for (let i = 1; i <= canvas_height; i++) {
			setTimeout(() => {
				var real = x_min
				for (let j = 1; j <= canvas_width; j++) {
						var escape_time = calculate_escape_time([real, imaginary], iteration_depth, fractal_algorithm)
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
				update_status("calculating...")
			}, 1);
		}
	}
}

// =================================
// -------Events Handeling----------
// =================================

// Render button
function render_trigger() {
	update_status("starting calculation... (this will take a while)")
	setTimeout(() => {
		render_fractal(x_centre, y_centre, zoom_level, 100, "mandelbrot_algorhthm", true, [255,255,255,255], [0,0,0,255], "sqrt", [-0.14,0.7])
	}, 10);
}

// =================================
// ----------Playground-------------
// =================================

update_pixel([155, 155, 155, 155], 12, 12)

var x_centre = 0
var y_centre = 0
var zoom_level = 2


// console.log(calculate_julia_escape_time([1, 1], 100, mandelbrot_altorhthm))
// console.log(calculate_escape_time([0.9, 0.1], 100, mandelbrot_altorhthm))