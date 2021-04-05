// =================================
// ----------Mathematics------------
// =================================
// Note that all complex numbers are stored as arrays with two elements in the form of [real, imaginary]. This helps to reduce the number of variables needed in the rendering process. Additionally, defining functions that take in multiple complex numbers represented by arrays allows easier complex number calculation.

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

// function to return number of iterations processed before the magnitude of f(z) escapes the bailout magnitude given c value and that z initial = 0. If the number of iterations calculated exceeds the iteration_depth, the function assumes that the c value never escapes under the given formula and thus returns Infinity.
function calculate_escape_time(c, iteration_depth, bailout, formula) {
	var z = [0, 0]
	var i = 1
	while (i <= iteration_depth && complex_magnitude_squared(z) < bailout) {
		z = fractal_algorithms[formula](z, c)
		i++
	}
	if (i > iteration_depth) {
		return Infinity // It blew up
	}
	else {
		return i
	}
}

// function to return number of iterations processed before the magnitude of f(z) escapes the bailout magnitude given c value and that z initial = c as in the Julia set. If the number of iterations calculated exceeds the iteration_depth, the function assumes that the c value never escapes under the given formula and thus returns Infinity.
function calculate_julia_escape_time(c, iteration_depth, bailout, formula, julia_value) {
	var z = c
	var i = 1
	while (i <= iteration_depth && complex_magnitude_squared(z) < bailout) {
		z = fractal_algorithms[formula](z, julia_value)
		i++
	}
	if (i > iteration_depth) {
		return Infinity // It blew up
	}
	else {
		return i
	}
}

// =================================
// ------Fractal Algorithms---------
// =================================

// This dictionary provides a number of fractal algorithms that can be called when needed. Note that the keys indicate the name of the algorithm whereas the values are the corresponding function that takes in complex numbers c and z as inputs.
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
// This allows the javascript code to interact with the content on the html interface

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

// This function serves to update image according to the pixel information and the x y coordinate of the pixel. The colour of the pixel is given by the array [r, g, b, l]
function update_pixel([r, g, b, a], x, y) {
	main_canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray([r, g, b, a]), 1, 1), x, y)
}

// This is a dictionary that contains a number of pre-defined colour presets that the user can choose from
var colour_presets = {
	"greyscale": [[255, 255, 255,255], [0, 0, 0,255]],
	"inverted_greyscale": [[0,0,0,255], [255,255,255,255]],
	"violet": [[244,244,255,255], [60,0,50,255]],
	"moss": [[255,254,253,255], [1,2,3,255]],
	"ocean": [[209, 234, 235,255], [9, 77, 184,255]],
	"flame": [[227, 8, 0,255],[245, 215, 44,255]],
	"life": [[0, 105, 16,255], [255, 132, 38,255]],
}

// This is a dictionary of colouring algorithms that helps to map escape time onto a specific colour in the gradient map created in map_colour()
colouring_algorithms = {
	"linear": function(x){return x},
	"square": function(x){return x * x},
	"sqrt": function(x){return Math.sqrt(x)},
	"log": function(x){return Math.log(x)},
}

function map_colour(escape_time, max_depth, colour_preset, colouring_algorithm_name) {
	// Calculate escape time percentile based on colouring algorithm
	percentile = Math.min(colouring_algorithms[colouring_algorithm_name](escape_time) / colouring_algorithms[colouring_algorithm_name](max_depth), 1);

	// Obtain start and end colour from colour_presets according to the user's chosen preset
	begin_rgba = colour_presets[colour_preset][0]
	end_rgba = colour_presets[colour_preset][1]

	// Check if greyscale
	if(begin_rgba[0] == begin_rgba[1] && begin_rgba[1] == begin_rgba[2] && end_rgba[0] == end_rgba[1] && end_rgba[1] == end_rgba[2]) {
		console.log("greyscale")
		resultant_rgba = [
			Math.max(0, Math.min(begin_rgba[0] + (percentile * (end_rgba[0] - begin_rgba[0])), 255)),
			Math.max(0, Math.min(begin_rgba[1] + (percentile * (end_rgba[1] - begin_rgba[1])), 255)),
			Math.max(0, Math.min(begin_rgba[2] + (percentile * (end_rgba[2] - begin_rgba[2])), 255)),
			255
		]
		return resultant_rgba
	} 
	// if colour
	else {
		// Convert RGB data to HSL
		// Note that Please.js is an open source javascript library created by Fooidge for converting colour formats. For more information, see https://github.com/Fooidge/PleaseJS
		begin_hsv = Please.RGB_to_HSV({r: begin_rgba[0], g: begin_rgba[1], b: begin_rgba[2]})
		end_hsv = Please.RGB_to_HSV({r: end_rgba[0], g: end_rgba[1], b: end_rgba[2]})

		// Calculate HSL gradient
		resultant_hsv = [
			begin_hsv.h + ((end_hsv.h - begin_hsv.h) * percentile),
			begin_hsv.s + ((end_hsv.s - begin_hsv.s) * percentile),
			begin_hsv.v + ((end_hsv.v - begin_hsv.v) * percentile)
		]

		// Convert new colour back to RGB
		resultant_rgb = Please.HSV_to_RGB({h: resultant_hsv[0], s: resultant_hsv[1], v: resultant_hsv[2]})

		// Convert new colour to RGBA
		resultant_rgba = [
			Math.max(0, Math.min(resultant_rgb.r, 255)),
			Math.max(0, Math.min(resultant_rgb.g, 255)),
			Math.max(0, Math.min(resultant_rgb.b, 255)),
			255
		]
		return resultant_rgba
		// </note>
	}
}

// render fractal image according on canvas according to parameters
function render_fractal(x_centre, y_centre, zoom_level, iteration_depth, bailout, fractal_algorithm, mode, colour_preset, colouring_algorithm_name, julia_value = [0, 0]) {
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
			if(mode == "julia_mode") {
				for (let j = 1; j <= canvas_width; j++) {
					var escape_time = calculate_julia_escape_time([real, imaginary], iteration_depth, bailout, fractal_algorithm, julia_value)
					// if fully escape
					if(escape_time == Infinity) {
						update_pixel(colour_presets[colour_preset][1], j - 1, i - 1)
					}
					// if partially escape
					else {
						update_pixel(map_colour(escape_time, iteration_depth, colour_preset, colouring_algorithm_name), j - 1, i - 1)
					}
					real = real + x_step
				}
			}
			else {
				for (let j = 1; j <= canvas_width; j++) {
					var escape_time = calculate_escape_time([real, imaginary], iteration_depth, bailout,  fractal_algorithm)
					// if fully escape
					if(escape_time == Infinity) {
						update_pixel(colour_presets[colour_preset][1], j - 1, i - 1)
					}
					// if partially escape
					else {
						update_pixel(map_colour(escape_time, iteration_depth, colour_preset, colouring_algorithm_name), j - 1, i - 1)
					}
					real = real + x_step
				}
			}
			imaginary = imaginary - y_step
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
	// collect user input from html document object model
	user_x_centre = parseFloat(document.getElementById("x_centre").value)
	user_y_centre = parseFloat(document.getElementById("y_centre").value)
	user_zoom_level = parseFloat(document.getElementById("zoom_level").value)
	user_iteration_depth = Math.round(document.getElementById("iteration_depth").value)
	user_bailout = parseFloat(document.getElementById("bailout").value)
	user_fractal_algorithm = document.getElementById("fractal_algorithm").value
	user_colouring_algorithm = document.getElementById("colouring_algorithm").value
	user_colour_ramp = document.getElementById("colour_ramp").value
	user_julia_mode = document.getElementById("mode").value
	user_julia_coordinate = [parseFloat(document.getElementById("julia_real").value), parseFloat(document.getElementById("julia_imaginary").value)]
	console.log(user_julia_coordinate)
	// render based on user parameters
	render_fractal(user_x_centre, user_y_centre, user_zoom_level, user_iteration_depth, user_bailout, user_fractal_algorithm, user_julia_mode, user_colour_ramp, user_colouring_algorithm, user_julia_coordinate)
}