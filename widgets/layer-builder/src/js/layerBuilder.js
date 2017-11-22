(function() {
	/**
	 * LayerBuilder: Layer and manipulate a series of images to create a single image
	 * @constructor
	 * @param {string} containerId - The id of the container element
	 * @param {Object} opts - Optional arguments
	 */
	function LayerBuilder(containerId, opts) {
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

		// Optional dimensions of the container
		this.dimensions = null;
		if (opts.hasOwnProperty('dimensions') && typeof opts.dimensions === 'object' && opts.dimensions.length === 2) {
			var w = parseInt(opts.dimensions[0]),
			h = parseInt(opts.dimensions[1]);

			if (!isNaN(w) && !isNaN(h)) {
				this.dimensions = [w, h];
			}
		}

		// An array of layers in the format [{name: 'name', image: url|elem}]
		this.layers = [];

		// Layer indexes by name
		this.layerHash = {};

		// Number of image layers we are drawing
		this.layerCount = 0;

		// True when imgLoadPromise resolves
		this.loaded = false;

		// Resolves after all image layers are done loading
		this.imgLoadPromise = new LBUtil.promise();

		// Resolves after the container is loaded
		this.initPromise = new LBUtil.promise();

		// Resolves after all images have been drawn to canvases
		this.imgDrawPromise = new LBUtil.promise();

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
				self.loaded = true;
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
			canvasStyle = self.dfltCanvasStyle,

			// Set the layer as loaded when the images loads
			onImgLoad = function() {
				this.canvas.setAttribute('data-layername', this.lbName);
				this.canvas.setAttribute('data-idx', this.lbIdx);

				self.layers[this.lbIdx] = {
					name: this.lbName,
					img: this,
					idx: this.lbIdx,
					canvas: this.canvas,
					ctx: this.ctx, 
					loaded: true,
					readOnly: this.lbReadOnly
				};

				self.layerHash[this.lbName] = this.lbIdx;

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

				imgs[i].lbIdx = i;
				imgs[i].lbName = layers[i].name.trim();
				imgs[i].lbReadOnly = !!layers[i].readOnly;

				self.layers[i] = {
					name: imgs[i].lbName,
					loaded: false
				};

				canvasStyle.zIndex = imgs[i].lbIdx + 1;
				imgs[i].canvas = self.createCanvas(canvasStyle);
				imgs[i].ctx = imgs[i].canvas.getContext('2d');
				imgs[i].onload = onImgLoad;
				imgs[i].src = image.trim();
			}

			return self.imgLoadPromise;
		});

		self.imgLoadPromise.done(function() {
			self.drawImages();
		});

		return self.imgDrawPromise;
	};

	/**
	 * Draw the images on their respective canvases
	 */
	LayerBuilder.prototype.drawImages = function() {
		var canvas = null,
		len = this.layers.length,
		imgW = 0,
		imgH = 0,
		maxWidth = 0,
		maxHeight = 0,
		wScale = 0,
		hScale = 0,
		finalScale = 1,
		layer = null,
		i = 0;

		if (this.dimensions) {
			for (i = 0; i < len; i++) {
				if (this.layers[i].img.width > maxWidth) {
					maxWidth = this.layers[i].img.width;
				}
				if (this.layers[i].img.height > maxHeight) {
					maxHeight = this.layers[i].img.height;
				}
			}

			wScale = parseFloat(this.dimensions[0] / maxWidth);
			hScale = parseFloat(this.dimensions[1] / maxHeight);
			finalScale = wScale < hScale ? wScale : hScale;

			if (finalScale > 1) {
				finalScale = 1;
			}
		}

		for (i = 0; i < len; i++) {
			layer = this.layers[i];

			imgW = Math.floor(layer.img.width * finalScale);
			imgH = Math.floor(layer.img.height * finalScale);

			layer.canvas.width = imgW;
			layer.canvas.height = imgH;

			layer.img.origW = layer.img.width;
			layer.img.origH = layer.img.height;

			layer.img.width = imgW;
			layer.img.height = imgH;

			layer.ctx.drawImage(layer.img, 0, 0, imgW, imgH);

			LBUtil.show(layer.canvas, 'block', true);

			layer.imgData = layer.ctx.getImageData(0, 0, imgW, imgH);
			layer.masterCvs = layer.canvas.cloneNode(false);
			layer.masterCvs.getContext('2d').drawImage(layer.img, 0, 0, imgW, imgH);

			layer.unscaledCvs = document.createElement('canvas');
			layer.unscaledCvs.width = layer.img.origW;
			layer.unscaledCvs.height = layer.img.origH;
			layer.unscaledCvs.getContext('2d').drawImage(layer.img, 0, 0, layer.img.origW, layer.img.origH);
		}

		this.imgDrawPromise.resolve();
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

		var layer = this.getLayer(layerName),
		imgData = null,
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

			operation = operation.toLowerCase();
		}


		if (layer.currentColor !== color) {
			layer.currentColor = color;
			this.colorLayer(layer, color, operation);
		}
	};

	/**
	 * Colorize a layer and draw it on a canvas
	 * @param {object} layer - Object representing a layer
	 * @param {string} color - Hex code to colorize the image
	 * @param {string} operation - Optional colorize operation
	 */
	LayerBuilder.prototype.colorLayer = function(layer, color, operation) {
		var self = this,
		canvas = layer.masterCvs,
		ctx = canvas.getContext('2d'),
		imgData = ctx.getImageData(0, 0, canvas.width, canvas.height),
		data = imgData.data,
		imgDataOrig = ctx.getImageData(0, 0, canvas.width, canvas.height),
		origData = imgDataOrig.data,
		colorRgb = LBUtil.hexToRgb(color),
		rgb = {},
		hsl = null,
		shiftHsl = null,
		newRgb = null,
		avg = 0;

		operation = operation ? operation : this.dfltOperation;

		for (var i = 0; i < data.length; i+=4) {
			rgb.r = origData[i + 0];
			rgb.g = origData[i + 1];
			rgb.b = origData[i + 2];
			rgb.a = origData[i + 3];

			switch (operation) {
				case 'multiply':
					data[i + 0] = ((rgb.r/255) * (colorRgb.r/255)) * 255;
					data[i + 1] = ((rgb.g/255) * (colorRgb.g/255)) * 255;
					data[i + 2] = ((rgb.b/255) * (colorRgb.b/255)) * 255;
					data[i + 3] = rgb.a;
					break;
				case 'screen':
					hsl = LBUtil.rgbToHsl(rgb.r, rgb.g, rgb.b);
					shiftHsl = LBUtil.rgbToHsl(colorRgb.r, colorRgb.g, colorRgb.b);
					newRgb = LBUtil.hslToRgb(shiftHsl.h, shiftHsl.s, hsl.l);
				
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

		layer.ctx.putImageData(imgData, 0, 0);
	};

	/**
	 * Reset a layer to its original state
	 * @param {string} layerName - The layer to reset
	 * @param {number} width - Optional width of the image
	 * @param {number} height - Optional height of the image
	 */
	LayerBuilder.prototype.resetLayer = function(layerName, width, height) {
		var layer = this.getLayer(layerName);

		if (!layer) return;

		width = isNaN(parseInt(width)) ? layer.img.width : parseInt(width);
		height = isNaN(parseInt(height)) ? layer.img.height : parseInt(height);

		layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
		layer.ctx.drawImage(layer.img, 0, 0, width, height);
		layer.currentColor = '';
	};

	/**
	 * Reset all layers to their original state
	 */
	LayerBuilder.prototype.resetAllLayers = function() {
		var len = this.layers.length;

		for (var i = 0; i < len; i++) {
			this.resetLayer(this.layers[i].name);
		}
	};

	/**
	 * Get all valid image operations
	 * @returns {Array} - An array of operation types
	 */
	LayerBuilder.prototype.getOperations = function() {
		return this.imgOperations;
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

		return typeof this.layerHash[layerName] !== 'undefined'
			? this.layers[this.layerHash[layerName]]
			: null;
	};

	/**
	 * Export a single image consisting of all canvas layers combined
	 * @param {string} type - Optional image format. png if omitted
	 * @returns {string} A data url representing the image
	 */
	LayerBuilder.prototype.getImage = function(imgType) {
		var res = '',
		len = this.layers.length,
		canvas = null,
		ctx = null,
		layer = null,
		dims = null,
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

		for (var i = 0; i < len; i++) {
			layer = this.layers[i];
			ctx.drawImage(layer.canvas, 0, 0, layer.img.width, layer.img.height);
		}

		res = canvas.toDataURL(imgType);
		this.container.removeChild(canvas);

		return res;
	};

	/**
	 * Export a single, unscaled image for all canvas layers combined
	 * @param {string} imgType - Optional image format
	 * @returns {string|object} A data url representing the image
	 */
	LayerBuilder.prototype.getUnscaledImage = function(imgType) {
		var len = this.layers.length,
		master = null,
		ctx = null,
		layer = null,
		tmpLayer = null,
		canvas = null,
		dims = null,
		img = null,
		tmpW = 0,
		tmpH = 0,
		res = null,
		imgData = null,
		style = {display: 'none'};

		if (!this.layers.length) {
			console.error('Unable to save image: no layers present');
			return;
		}

		dims = this.getOrigDimensions();
		master = this.createCanvas(style);
		master.width = dims.width;
		master.height = dims.height;

		for (var i = 0; i < len; i++) {
			layer = this.layers[i];
			canvas = this.createCanvas(style);
			canvas.width = layer.img.origW;
			canvas.height = layer.img.origH;

			ctx = canvas.getContext('2d');
			ctx.drawImage(layer.unscaledCvs, 0, 0);

			if (layer.currentColor) {
				tmpLayer = {
					masterCvs: canvas,
					ctx: ctx,
					currentColor: layer.currentColor
				};
				this.colorLayer(tmpLayer, layer.currentColor);
			}

			master.getContext('2d').drawImage(canvas, 0, 0);
			this.container.removeChild(canvas);
		}

		res = master.msToBlob ? master.msToBlob() : master.toDataURL(imgType);
		this.container.removeChild(master);
		
		return res; 
	};

	/**
	 * Get the dimensions of the entire layer stack
	 * @returns {object} - An object representing the stack dimensions
	 */
	LayerBuilder.prototype.getDimensions = function() {
		var res = {width: 0, height: 0},
		layer = null;

		for (var i = 0, len = this.layers.length; i < len; i++) {
			layer = this.layers[i];
			if (layer.canvas.width > res.width) {
				res.width = layer.canvas.width;
			}
			if (layer.canvas.height > res.height) {
				res.height = layer.canvas.height;
			}
		}

		return res;
	};

	/**
	 * Get the dimensions of the unscaled stack
	 * @returns {object} - An object representing the stack dimensions
	 */
	LayerBuilder.prototype.getOrigDimensions = function() {
		var res = {width: 0, height: 0},
		layer = null;

		for (var i = 0, len = this.layers.length; i < len; i++) {
			layer = this.layers[i];
			if (layer.img.origW > res.width) {
				res.width = layer.img.origW;
			}
			if (layer.img.origH > res.height) {
				res.height = layer.img.origH;
			}
		}

		return res;
	};

	/****************************************************************************
		Utility functions
	****************************************************************************/

	var LBUtil = {};

	/**
	 * Convert hex color to rgb
	 * From https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	 * @param {string} hex - Hex color
	 * @returns {object} Converted rgb color
	 */
	LBUtil.hexToRgb = function(hex) {
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
	};

	/** 
	 * Converts rgb to hsl
	 * Taken from https://stackoverflow.com/questions/29156849/html5-canvas-changing-image-color
	 * @param {number} r - Red value
	 * @param {number} g - Green value
	 * @param {number} b - Blue value
	 * @returns {object} - Corresonding hsl value
	 */

	LBUtil.rgbToHsl = function(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;

		var max = Math.max(r, g, b), 
		min = Math.min(r, g, b),
		h, s, l = (max + min) / 2;

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
	};

	/** 
	 * Converts hsl to rgb
	 * Taken from https://stackoverflow.com/questions/29156849/html5-canvas-changing-image-color
	 * @param {number} h - Hue value
	 * @param {number} s - Saturation value
	 * @param {number} l - Lightness value
	 * @returns {object} The corresponding rgb value
	 */
	LBUtil.hslToRgb = function(h, s, l) {
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
	};

	/** 
	 * Converts hue to rgb
	 * Taken from https://stackoverflow.com/questions/29156849/html5-canvas-changing-image-color
	 * @param p {number} 
	 * @param q {number}
	 * @param t {number}
	 * @returns {number}
	 */
	LBUtil.hue2rgb = function(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1/6) return p + (q - p) * 6 * t;
		if (t < 1/2) return q;
		if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		return p;
	};

	/**
	 * Promise implementation taken from RideStyler
	 * @returns {object} A promise object
     */
	LBUtil.promise = function() {
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
    };

	/**
     * True if arg is an array
     * @returns {boolean} Boolean indication of whether arg is an array
     */
	LBUtil.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};

	/**
	 * Convert non alphanumeric chars to dashes
	 * @param {string} name - String to convert
	 */
	LBUtil.nonAlpha2Dash = function(name) {
		return name.replace(/\W+/g, '-');
	};

	/**
	 * Swap visibility for two elements
	 * @param {object} showEl - Element to show
	 * @param {object} hideEl - Element to hide
	 */
	LBUtil.toggle = function(showEl, hideEl) {
		if (hideEl) {
			hideEl.style.display = 'none';
			hideEl.style.opacity = 0;
		}
		if (showEl) {
			showEl.style.display = 'block';
			showEl.clientWidth;
			showEl.style.opacity = 1;
		}
	};

	/**
	 * Determines if element el has class cl
	 * @param {Element} el
	 * @param {string} cl
	 * @return {boolean}
	 */
	LBUtil.hasClass = function (el, cl) {
		var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
		return !!el.className.match(regex);
	};

	/**
	 * Add class cl to element el
	 * @param {Element} el
	 * @param {string} cl
	 */
	LBUtil.addClass = function (el, cl) {
		if (el.className.indexOf(cl) === -1) {
			el.className += ' ' + cl;
			el.className = el.className.trim();
		}
	};

	/**
	 * Remove class(es) from element el
	 * @param {Element} el
	 * @param {string|Array} cl
	 */
	LBUtil.removeClass = function (el, cl) {
		var regex = null,
		len = 0;

		if (typeof cl !== 'object') {
			cl = [cl];
		}

		len = cl.length;
		for (var i = 0; i < len; i++) {
			regex = new RegExp('(?:\\s|^)' + cl[i] + '(?:\\s|$)');
			el.className = el.className.replace(regex, ' ');
		}
	};

	LBUtil.hide = function(el, opacity) {
		if (el && typeof el === 'object') {
			if (opacity) {
				el.style.opacity = 0;
			}
			el.style.display = 'none';
		}
	};

	LBUtil.show = function(el, display, setOpacity, opVal) {
		if (el && typeof el === 'object') {
			el.style.display = display ? display : 'block';

			if (setOpacity) {
				el.style.opacity = opVal ? opVal : 1;
			}
		}
	};

	window.LBUtil = LBUtil;
	window.LayerBuilder = LayerBuilder;
})();