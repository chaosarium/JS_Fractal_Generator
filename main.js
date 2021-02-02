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

// Set up canvas
var main_canvas = document.getElementById('fractal_viewport')
var canvas_width = main_canvas.width
var canvas_height = main_canvas.height

// get pixel_data for later manipulation
var canvas_context = main_canvas.getContext('2d')
// pixel data structure seems to be [r, g, b, l, r, g, b, l, ..., r, g, b, l]
var pixel_data = canvas_context.getImageData(0, 0, canvas_width, canvas_height)


// function to update image according to the pixel information and the x y coordinate of the pixel
function update_pixel([r, g, b, l], x, y) {
	main_canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray([r, g, b, l]), 1, 1), x, y)
}


update_pixel([155, 155, 155, 155], 12, 12)










// process rendering parameters
var x_min = -2
var x_max = 2
var y_min = -2
var y_max = 2
var x_dim = 240
var y_dim = 120
var x_step = (x_max - x_min) / x_dim
var y_step = (y_max - y_min) / y_dim
var renderer_console_output = ""

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
	for (let i = 1; i <= x_dim; i++) {
			if(escape_time([real, imaginary], 100, mandelbrot_altorhthm) == Infinity) {
				renderer_console_output = renderer_console_output + "X"
			}
			else {
				renderer_console_output = renderer_console_output + " "
			}
		real = real + x_step
	}
	imaginary = imaginary - y_step
	renderer_console_output = renderer_console_output + "\n"
}