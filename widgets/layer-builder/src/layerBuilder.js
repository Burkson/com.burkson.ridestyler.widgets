(function() {
	/**
	 * LayerBuilder: Layer and manipulate a series of images to create a single image
	 * @constructor
	 * @param {string} containerId - The id of the container element
	 * @param {Object} opts - Optional arguments
	 */
	function LayerBuilder(containerId, layers, opts) {
		var self = this;

		if (!containerId || typeof containerId !== 'string') {
			console.error('Invalid containerId');
			return;
		}

		if (typeof opts !== 'object') {
			opts = {};
		}

		// The id of the container element
		this.containerId = containerId;

		// The container element
		this.container = document.getElementById(containerId);

		// Optional name for the layer set
		this.name = typeof opts.name === 'string' ? opts.name.trim() : '';

		// An array of layers in the format [{name: 'name', image: url|elem}]
		this.layers = [];

		// Layer indexes by name
		this.layerHash = {};

		// Number of image layers we are drawing
		this.layerCount = 0;

		// Resolves after all image layers are done loading
		this.imgLoadPromise = new promise();

		// Resolves after the container is loaded
		this.initPromise = new promise();

		// Valid image color operations
		this.imgOperations = ['multiply', 'screen', 'grayscale'];

		// Default operation
		this.dfltOperation = 'multiply';

		// Default canvas style
		this.dfltCanvasStyle = {
			position: 'absolute',
			opacity: 0
		};

		if (!this.container) {
			document.addEventListener('DOMContentLoaded', function() {
				self.container = document.getElementById(self.containerId);
				self.initPromise.resolve();
			});
		} else {
			self.initPromise.resolve();
		}
	}

	/**
	 * Create a new canvas element and insert it into the container
	 * @param {object} style - An object containing style properties for the canvas
	 */
	LayerBuilder.prototype.createCanvas = function(style) {
		var canvas = document.createElement('canvas');

		if (typeof style === 'object') {
			for (var i in style) {
				canvas.style[i] = style[i];
			}
		}

		this.container.appendChild(canvas);

		return canvas;
	};

	/**
	 * Check if all of the images have loaded
	 * When all are loaded, resolve imgLoadPromise and show all canvases
	 */
	LayerBuilder.prototype.checkAsyncComplete = function() {
		var self = this,
		len = this.layers.length,
		loadedCt = 0,
		i = 0;

		if (len === this.layerCount) {
			for (i = 0; i < len; i++) {
				if (this.layers[i].loaded) {
					loadedCt++;
				}
			}

			if (loadedCt === this.layerCount) {
				var canvas = null;

				for (i = 0; i < len; i++) {
					canvas = this.layers[i].canvas;
					canvas.style.transition = 'opacity 1s linear';
					canvas.style.setProperty('-webkit-transition', 'opacity 1s linear');
					canvas.style.opacity = 1;
				}

				self.imgLoadPromise.resolve();
			}
		}
	};

	/**
	 * Takes an array of name/image layers and creates a series of canvases based on them
	 * @param {Array} layers - An array of objects representing each layer
	 * @returns {object} A promise object which resolves after init is complete
	 */
	LayerBuilder.prototype.setLayers = function(layers) {
		if (typeof layers !== 'object' || !layers.length) {
			return;
		}

		var self = this;

		this.initPromise.done(function() {
			var len = layers.length,
			image = '',
			imgs = [],
			canvasStyle = self.dfltCanvasStyle;

			// Draw the image when loaded and save the layer internally
			onImgLoad = function() {
				this.canvas.width = this.width;
				this.canvas.height = this.height;
				this.canvas.id = this.wbName;
				this.ctx.drawImage(this, 0, 0, this.width, this.height);

				self.layers[this.wbIdx] = {
					name: this.wbName,
					img: this,
					idx: this.wbIdx,
					canvas: this.canvas,
					ctx: this.ctx, 
					loaded: true,
					imgData: this.ctx.getImageData(0, 0, this.width, this.height)
				};

				self.layerHash[this.wbName] = this.wbIdx;

				self.checkAsyncComplete();
			};

			self.layers = [];
			self.layerCount = len;

			for (var i = 0; i < len; i++) {
				if (typeof layers[i] !== 'object' ||
					typeof layers[i].name !== 'string' || 
					!layers[i].name,
					!layers[i].img
				) {
					console.error('Invalid layer: ' + layers[i].name);
					continue;
				}

				image = layers[i].img;
				if (typeof image === 'string') {
					imgs[i] = new Image();
				} else {
					console.error('Invalid image for layer ' + layers[i].name);
					continue;
				}

				imgs[i].wbIdx = i;
				imgs[i].wbName = layers[i].name.trim();

				self.layers[i] = {
					name: imgs[i].wbName,
					loaded: false
				};

				canvasStyle.zIndex = imgs[i].wbIdx + 1;
				imgs[i].canvas = self.createCanvas(canvasStyle);
				imgs[i].ctx = imgs[i].canvas.getContext('2d');
				imgs[i].onload = onImgLoad;
				imgs[i].src = image.trim();
			}

			return self.imgLoadPromise;
		});

		return self.imgLoadPromise;
	};

	/**
	 * Set the color of a given layer
	 * @param {string} layerName - Name of the layer 
	 * @color {string} color - Hex color of the layer
	 * @returns {object} A promise objecct which resolves after all images have loaded
	 */
	LayerBuilder.prototype.setColor = function(layerName, color, operation) {
		if (!layerName || 
			!color ||
			!this.layers.length
		) {
			console.error('Unable to set colors. Invalid params or no layers present');
			return;
		}

		var self = this,
		layer = this.getLayer(layerName),
		colorRgb = hexToRgb(color),
		rgb = {},
		newRgb = {},
		hsl = null,
		shiftHsl =  null,
		avg = 0,
		ctx = layer.ctx;

		if (!layer) {
			console.error('Invalid layer: ' + layerName);
			return;
		} 

		if (!operation) {
			operation = this.dfltOperation;
		} else {
			if (typeof operation !== 'string' || 
				this.imgOperations.indexOf(operation.toLowerCase()) === -1
			) {
				console.error('Invalid operation');
				return;
			}
		}

		operation = operation.toLowerCase();

		var imgData = new ImageData(layer.img.width, layer.img.height);
		imgData.data.set(new Uint8ClampedArray(layer.imgData.data));

		var data = imgData.data,
		imgDataOrig = new ImageData(layer.img.width, layer.img.height);
		imgDataOrig.data.set(new Uint8ClampedArray(layer.imgData.data));
		origData = imgDataOrig.data;

		for (var i = 0; i < data.length; i+=4) {
			rgb.r = origData[i + 0];
			rgb.g = origData[i + 1];
			rgb.b = origData[i + 2];
			rgb.a = origData[i + 3];

			// skip transparent/semiTransparent pixels
			//if (rgb.a < 100) {continue;}

			switch (operation) {
				case 'multiply':
					data[i + 0] = ((rgb.r/255) * (colorRgb.r/255)) * 255;
					data[i + 1] = ((rgb.g/255) * (colorRgb.g/255)) * 255;
					data[i + 2] = ((rgb.b/255) * (colorRgb.b/255)) * 255;
					data[i + 3] = rgb.a;
					break;
				case 'screen': 
					hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
					shiftHsl = rgbToHsl(colorRgb.r, colorRgb.g, colorRgb.b);
					newRgb = hslToRgb(shiftHsl.h, shiftHsl.s, hsl.l);
				
					data[i + 0] = newRgb.r;
					data[i + 1] = newRgb.g;
					data[i + 2] = newRgb.b;
					data[i + 3] = rgb.a;
					break;

				case 'grayscale': 
					avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
					data[i] = avg;
					data[i + 1] = avg;
					data[i + 2] = avg;
					break;
			}
		}

		setTimeout(function() {
			ctx.putImageData(imgData, 0, 0);	
		}, 0);
	};

	/**
	 * Reset a layer to its original state
	 */
	LayerBuilder.prototype.resetLayer = function(layerName) {
		var layer = this.getLayer(layerName);

		if (!layer) return;

		layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
		layer.ctx.putImageData(layer.imgData, layer.img.width, layer.img.height);
	};

	/**
	 * Get a layer by its name
	 * @param {string} layerName - The layer name
	 * @returns {object} The corresponding layer object
	 */
	LayerBuilder.prototype.getLayer = function(layerName) {
		if (typeof layerName !== 'string' ||
			!layerName.trim() ||
			!this.layers.length
		) {
			console.error('Invalid layer name or no layers set');
			return;
		}

		return this.layers[this.layerHash[layerName]];
	};

	/**
	 * Export a single image consisting of all canvas layers combined
	 * @param {string} type - Optional image format. png if omitted
	 */
	LayerBuilder.prototype.getImage = function(imgType) {
		var width = 0,
		height = 0,
		len = this.layers.length,
		canvas = null,
		ctx = null,
		link = null,
		layer = null,
		dims = null;
		style = {display: 'none'};

		if (!this.layers.length) {
			console.error('Unable to save image: no layers present');
			return;
		}

		imgType = typeof imgType === 'string' ? imgType.trim() : 'image/png';

		dims = this.getDimensions();
		canvas = this.createCanvas(style);
		canvas.width = dims.width;
		canvas.height = dims.height;
		ctx = canvas.getContext('2d');

		for (i = 0; i < len; i++) {
			ctx.drawImage(this.layers[i].canvas, 0, 0);
		}

		return canvas.toDataURL(imgType);
	};

	/**
	 * Get the dimensions of the entire layer stack
	 * @returns {object} - An object representing the stack dimensions
	 */
	LayerBuilder.prototype.getDimensions = function() {
		var res = {width: 0, height: 0};

		for (var i = 0, len = this.layers.length; i < len; i++) {
			layer = this.layers[i];
			if (layer.canvas.clientWidth > res.width) {
				res.width = layer.canvas.clientWidth;
			}
			if (layer.canvas.clientHeight > res.height) {
				res.height = layer.canvas.clientHeight;
			}
		}

		return res;
	};

	/****************************************************************************
		Utility functions
	****************************************************************************/

	/**
	 * Convert hex color to rgb
	 * From https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	 * @param {string} hex - Hex color
	 * @returns {object} Converted rgb color
	 */
	function hexToRgb(hex) {
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
		result = null;

		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	/** 
	 * Converts rgb to hsl
	 * Taken from https://stackoverflow.com/questions/29156849/html5-canvas-changing-image-color
	 * @param {number} r - Red value
	 * @param {number} g - Green value
	 * @param {number} b - Blue value
	 * @returns {object} - Corresonding hsl value
	 */
	function rgbToHsl(r, g, b) {
		r /= 255, 
		g /= 255, 
		b /= 255;

		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if (max == min) {
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
			  case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			  case g: h = (b - r) / d + 2; break;
			  case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return({h:h, s:s, l:l});
	}

	/** 
	 * Converts hsl to rgb
	 * Taken from https://stackoverflow.com/questions/29156849/html5-canvas-changing-image-color
	 * @param {number} h - Hue value
	 * @param {number} s - Saturation value
	 * @param {number} l - Lightness value
	 * @returns {object} The corresponding rgb value
	 */
	function hslToRgb(h, s, l) {
		var r, g, b;

		if (s == 0) {
			r = g = b = l; // achromatic
		} else {
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return {
			r:Math.round(r * 255),
			g:Math.round(g * 255),
			b:Math.round(b * 255)
		};
	}

	/** 
	 * Converts hue to rgb
	 * Taken from https://stackoverflow.com/questions/29156849/html5-canvas-changing-image-color
	 * @param p {number} 
	 * @param q {number}
	 * @param t {number}
	 * @returns {number}
	 */
	function hue2rgb(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1/6) return p + (q - p) * 6 * t;
		if (t < 1/2) return q;
		if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		return p;
	}

	/**
	 * Promise implementation taken from RideStyler
	 * @returns {object} A promise object
     */
	function promise() {
        var states = {
            pending: 0,
            resolved: 1,
            rejected: 2
        },
        currentState = states.pending,
        currentValue = null,
        callbacks = [];

        return {
            state: function() {
                return currentState;
            },
            value: function() {
                return currentValue;
            },
            changeState: function(state,  value) {
                if (currentState === state) {
                    return console.error('Cannot changeState to same state: ' + state);
                }
                if (currentState !== states.pending) {
                    return console.error('Cannot changeState when promise is finalized.');
                }

                currentState = state;
                currentValue = value;
                resolve();

                return currentState;
            },
            resolve: function(value) {
                this.changeState(states.resolved, value);
            },
            reject: function(value) {
                this.changeState(states.rejected, value);
            },
            always: function(callback) {
                addCallback({ always: callback });
                return this;
            },
            done: function(callback) {
                addCallback({ done: callback });
                return this;
            },
            fail: function(callback) {
                addCallback({ fail: callback });
                return this;
            },
            isResolved: function() {
                return currentState === states.resolved;
            },
            isRejected: function() {
                return currentState === states.rejected;
            }
        };

        function addCallback(callback) {
            callbacks.push(callback);
            resolve();
        }

        function resolve() {
            if (currentState === states.pending) {
                return;
            }

            while (callbacks.length > 0) {
                var c = callbacks.shift();

                if (currentState === states.resolved &&
                    typeof c.done == 'function') {
                    c.done(currentValue);
                } else if (currentState === states.rejected && typeof c.fail === 'function') {
                    c.fail(currentValue);
                }

                if (typeof c.always == 'function') {
                    c.always(currentValue);
                }
            }
        }
    }

    /**
     * True if arg is an array
     * @returns {boolean} Boolean indication of whether arg is an array
     */
	function isArray(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	}

	window.LayerBuilder = LayerBuilder;
})();