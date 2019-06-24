(function () {
	/**
	 * PlusSizeCalculator: Render the Plus Size Calculator widget within a container element
	 * @constructor
	 * @param {number} containerId - The id of the widget's parent element
	 * @param {Object} options - Optional arguments
	 */
	function PlusSizeCalculator(containerId, options) {
		var self = this;

		if (typeof options !== 'object') {
			options = {};
		}

		// Dev or production
		this.dev = options.dev ? options.dev : false;

		// Id of our widget's parent element
		this.containerId = containerId;

		// Loading spinner
		this.loadingImg = 'data:image/gif;base64,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ODwvYj48YnIgLz4KPGJyIC8+CjxiPldhcm5pbmc8L2I+OiAgbXlzcWxfcXVlcnkoKSBbPGEgaHJlZj0nZnVuY3Rpb24ubXlzcWwtcXVlcnknPmZ1bmN0aW9uLm15c3FsLXF1ZXJ5PC9hPl06IENhbid0IGNvbm5lY3QgdG8gbG9jYWwgTXlTUUwgc2VydmVyIHRocm91Z2ggc29ja2V0ICcvdmFyL3J1bi9teXNxbGQvbXlzcWxkLnNvY2snICgyKSBpbiA8Yj4vaG9tZS9hamF4bG9hZC93d3cvbGlicmFpcmllcy9jbGFzcy5teXNxbC5waHA8L2I+IG9uIGxpbmUgPGI+Njg8L2I+PGJyIC8+CjxiciAvPgo8Yj5XYXJuaW5nPC9iPjogIG15c3FsX3F1ZXJ5KCkgWzxhIGhyZWY9J2Z1bmN0aW9uLm15c3FsLXF1ZXJ5Jz5mdW5jdGlvbi5teXNxbC1xdWVyeTwvYT5dOiBBIGxpbmsgdG8gdGhlIHNlcnZlciBjb3VsZCBub3QgYmUgZXN0YWJsaXNoZWQgaW4gPGI+L2hvbWUvYWpheGxvYWQvd3d3L2xpYnJhaXJpZXMvY2xhc3MubXlzcWwucGhwPC9iPiBvbiBsaW5lIDxiPjY4PC9iPjxiciAvPgo8YnIgLz4KPGI+V2FybmluZzwvYj46ICBteXNxbF9xdWVyeSgpIFs8YSBocmVmPSdmdW5jdGlvbi5teXNxbC1xdWVyeSc+ZnVuY3Rpb24ubXlzcWwtcXVlcnk8L2E+XTogQ2FuJ3QgY29ubmVjdCB0byBsb2NhbCBNeVNRTCBzZXJ2ZXIgdGhyb3VnaCBzb2NrZXQgJy92YXIvcnVuL215c3FsZC9teXNxbGQuc29jaycgKDIpIGluIDxiPi9ob21lL2FqYXhsb2FkL3d3dy9saWJyYWlyaWVzL2NsYXNzLm15c3FsLnBocDwvYj4gb24gbGluZSA8Yj42ODwvYj48YnIgLz4KPGJyIC8+CjxiPldhcm5pbmc8L2I+OiAgbXlzcWxfcXVlcnkoKSBbPGEgaHJlZj0nZnVuY3Rpb24ubXlzcWwtcXVlcnknPmZ1bmN0aW9uLm15c3FsLXF1ZXJ5PC9hPl06IEEgbGluayB0byB0aGUgc2VydmVyIGNvdWxkIG5vdCBiZSBlc3RhYmxpc2hlZCBpbiA8Yj4vaG9tZS9hamF4bG9hZC93d3cvbGlicmFpcmllcy9jbGFzcy5teXNxbC5waHA8L2I+IG9uIGxpbmUgPGI+Njg8L2I+PGJyIC8+Cg==';

		// The template html
		this.tplHtml = '';

		// Paths to our stylesheet and template
		this.urlPfx = this.dev ? 'src/' : 'https://static.ridestyler.net/widgets/plus-size-calculator/1.3/';
		this.cssFile = this.dev ? 'psc.css' : 'psc.min.css';
		this.cssUrl = this.urlPfx + 'css/' + this.cssFile;
		this.tplUrl = this.urlPfx + 'html/psc.tpl';

		// Increment the Tire Speed Difference data by this value per row
		this.mphIncrement = options.mphIncrement ? options.mphIncrement : 10;

		// Metric and flotation tire sizes
		this.metricSizes = [];
		this.flotSizes = [];

		// Indicates whether each measurement section is complete
		this.tmComplete = false;
		this.ctmComplete = false;

		// If our stylesheet and template have been loaded
		this.stylesheetLoaded = false;
		this.templateLoaded = false;

		// Tire data from Ridestyler has been loaded
		this.metricLoaded = false;
		this.flotationLoaded = false;

		// Template init is complete
		this.tplInitComplete = false;

		// Width thresholds for adjusting layout
		this.smallWidth = 880;
		this.smallestWidth = 480;

		// The widget container element
		this.element = document.getElementById(this.containerId);

		// The widget wrapper element, used in resizing
		this.wrap = null;

		// Groups of input selects
		this.inputGroups = null;

		// "Measurement" headers, used when showing spinner during api calls
		this.selectHeaders = null;

		// Form inputs
		this.firsti = null;
		this.secondi = null;
		this.thirdi = null;
		this.sizeType0 = null;
		this.sizeType1 = null;
		this.sizeTypeCompare0 = null;
		this.sizeTypeCompare1 = null;
		this.submit = null;
		this.selects = null;

		// If we don't have a container element loaded, wait for DOMContent loaded to fire
		if (!this.element) {
			this.addListener(document, 'DOMContentLoaded', function(event) {
				self.element = document.getElementById(self.containerId);
				self.onDomReady();
			});
		} else {
			self.onDomReady();
		}
	}

	/**
	 * When the DOM is ready, show a loading message and inject our stylesheet and template
	 */
	PlusSizeCalculator.prototype.onDomReady = function() {
		var cb = this.onAsyncComplete;

		this.showLoading(true);

		if (this.element == null) {
			console.error('Invalid container Id');
			return;
		}

		this.loadStyles(cb);
		this.loadTemplate(cb);
		this.getTireSizes('metric', cb);
		this.getTireSizes('flotation', cb);
	};

	/**
	 * True when all async requests have completed
	 */
	PlusSizeCalculator.prototype.isReady = function() {
		return this.stylesheetLoaded &&
			this.templateLoaded &&
			this.metricLoaded &&
			this.flotationLoaded;
	};

	/**
	 * Check if all of the async requests have finished, then initialize the template
	 */
	PlusSizeCalculator.prototype.onAsyncComplete = function() {
		if (!this.isReady()) {
			return;
		}

		// Initialize template when we are ready
		if (!this.tplInitComplete) {
			this.showLoading(false);
			this.element.innerHTML = this.tplHtml;
			this.adjustLayout();
			this.initTpl();
			this.tplInitComplete = true;
		}
	};


	/**
	 * Get tire size data from RideStyler
	 * @param {string} sizeType - Metric or flotation tire size
	 * @param {function} cb - Callback function
	 */
	PlusSizeCalculator.prototype.getTireSizes = function(sizeType, cb) {
		var self = this;

		sizeType = sizeType.toLowerCase();
		if (sizeType !== 'metric' && sizeType !== 'flotation') {
			console.error('Invalid size type: ' + sizeType);
			return;
		}

		ridestyler.ajax.send({
			action: 'Tire/GetValidTireSizeDescriptions',
			data: {
				SizeType: sizeType
			},
			callback: function (res) {
				if (res.Success) {
					if (sizeType === 'metric') {
						self.metricSizes = self.normalizeMetric(res.Sizes);
						self.metricLoaded = true;
					} else {
						self.flotSizes = self.normalizeFlotation(res.Sizes);
						self.flotationLoaded = true;
					}

					if (typeof cb === 'function') {
						cb.apply(self);
					}
				} else {
					console.error('Failed to retrieve tire sizes');
				}
			}
		});
	};

	/**
	 * Initialize the template, populate the form with data and set up event handlers
	 */
	PlusSizeCalculator.prototype.initTpl = function() {
		var md = this.metricSizes,
		i = 0,
		len;

		// Save these so we don't have to continually select them
		this.inputGroups = this.element.getElementsByClassName('psc-input-select-group');
		this.wrap = this.element.getElementsByClassName('psc-widget')[0];
		this.firsti = this.element.getElementsByClassName('psc-firsti');
		this.secondi = this.element.getElementsByClassName('psc-secondi');
		this.thirdi = this.element.getElementsByClassName('psc-thirdi');
		this.sizeType = this.element.getElementsByClassName('psc-sizetype');
		this.sizeType1 = this.element.getElementsByClassName('psc-sizetype1');
		this.selects = this.element.getElementsByClassName('psc-select');
		this.selectHeaders = this.element.getElementsByClassName('psc-select-header');
		this.spinners = this.element.getElementsByClassName('psc-loading');
		this.submit = document.getElementById('psc-form-submit');

		// Initialize the 'firsti' selects with metric data
		if (md.first.length) {
			len = this.firsti.length;
			for (i = 0; i < len; i++) {
				initSelect(this.firsti[i], 'Width', md.first);
			}
		}

		// Set our spinner backround
		len = this.spinners.length;
		for (i = 0; i < len; i++) {
			this.spinners[i].style['background-image'] = "url('" + this.loadingImg + "')";
		}

		// Event handlers
		this.addListener(window, 'resize', this.adjustLayout);
		this.addListeners(this.firsti, 'change', this.onFirstChange);
		this.addListeners(this.secondi, 'change', this.onSecondChange);
		this.addListeners(this.thirdi, 'change', this.onThirdChange);
		this.addListeners(this.sizeType, 'change', this.onSizeTypeChange);
		this.addListeners(this.sizeType1, 'change', this.onSizeTypeChange);
		this.addListeners(this.submit, 'click', this.onSubmit);

		this.adjustLayout();
	};

	/**
	 * A first menu has changed, clear second and third menus and repopulate second
	 */
	PlusSizeCalculator.prototype.onFirstChange = function(e) {
		var first = e.target,
		secondVals = [],
		secondLabel = '',
		fVal = parseFloatValue(first.value),
		parent = first.parentElement.parentElement,
		second = first.parentElement.nextElementSibling,
		third = second.nextElementSibling;

		emptyDisableElem(second.children[0]);
		emptyDisableElem(third.children[0]);

		this.checkFormAfterChange();

		if (fVal != '') {
			secondVals = hasClass(parent, 'flotation') ? this.flotSizes.second[fVal] : this.metricSizes.second[fVal];
			if (secondVals && secondVals.length) {
				secondLabel = hasClass(parent, 'flotation') ? 'Width' : 'Aspect Ratio';
				initSelect(second.children[0], secondLabel, secondVals);
			}
		}
	};

	/**
	 * A second menu has changed, clear the third menu and repopulate it
	 */
	PlusSizeCalculator.prototype.onSecondChange = function(e) {
		var second = e.target,
		thirdVals = [],
		sVal = parseFloatValue(second.value),
		parent = second.parentElement.parentElement,
		first = second.parentElement.previousElementSibling,
		third = second.parentElement.nextElementSibling,
		fVal = first.children[0].value;

		emptyDisableElem(third.children[0]);

		this.checkFormAfterChange();

		if (fVal != '' && sVal != '') {
			thirdVals = hasClass(parent, 'flotation') ? this.flotSizes.third[fVal + '_' + sVal] : this.metricSizes.third[fVal + '_' + sVal];
			if (thirdVals.length) {
				initSelect(third.children[0], 'Inner Diameter', thirdVals);
			}
		}
	};

	/**
	 * A third menu has changed, clear spec values and submit our form
	 */
	PlusSizeCalculator.prototype.onThirdChange = function() {
		this.checkFormAfterChange();
		this.submit.click();
	};

	/**
	 * Change to/from metic/flotation
	 * Clear our menus and repopulate the firsts
	 * @param {Object} e - Click event
	 */
	PlusSizeCalculator.prototype.onSizeTypeChange = function(e) {
		var self = this,
		sizetype = e.target,
		firstSelects = this.firsti[0],
		len = 3,
		stVal = sizetype.value,
		firstVals = null,
		i = 0,
		parent = e.target.parentElement.parentElement.previousElementSibling;

		if(e.target.name == "psc-sizetype2"){
			firstSelects = this.firsti[1];
			len = 6;
			i = 3;
		}

		for (i; i < len; i++) {
			emptyDisableElem(this.selects[i]);
		}

		if (stVal === 'flotation') {
			firstVals = this.flotSizes.first;
			initSelect(firstSelects, 'Outer Diameter', firstVals);
			addClass(parent, 'flotation');
		} else {
			firstVals = this.metricSizes.first;
			initSelect(firstSelects, 'Width', firstVals);
			removeClass(parent, 'flotation');
		}
	};

	/**
	 * One or more of our measurement sections are complete
	 * Make an API call to compare sizes and display the info
	 * @param {Object} e - Form submission event
	 * @return {boolean} - Always false to suppress form submission
	 */
	PlusSizeCalculator.prototype.onSubmit = function(e) {
		e.preventDefault();
		if (!this.tmComplete) {
			return false;
		}

		var self = this,
		sep1 = hasClass(this.inputGroups[0], 'flotation') ? 'x' : '/',
		sep2 = hasClass(this.inputGroups[1], 'flotation') ? 'x' : '/',
		tmSize = this.selects[0].value + sep1 + this.selects[1].value + 'R' + this.selects[2].value,
		compareSize = tmSize,
		params = {},
		header,
		spinner;

		if (this.ctmComplete) {
			compareSize = this.selects[3].value + sep2 + this.selects[4].value + 'R' + this.selects[5].value;
			header = this.selectHeaders[1];
			spinner = this.spinners[1];
		} else {
			header = this.selectHeaders[0];
			spinner = this.spinners[0];
		}

		params = {
			BaseSize: tmSize,
			'NewSizes[0]': compareSize
		};

		setTimeout(function() {
			if (!xhr || xhr.readyState !== 4) {
				spinner.style.display = 'inline-block';
			}
		}, 200);

		var xhr = ridestyler.ajax.send({
			action: 'Tire/CompareSizes',
			data: params,
			callback: function (res) {
				if (res.Success) {
					self.populateComparison(res);
				} else {
					console.error('RS request failed');
				}
				spinner.style.display = 'none';
			}
		});

		return false;
	};

	/**
	 * Set class(es) on widget wrapper based on container dimensions
	 */
	PlusSizeCalculator.prototype.adjustLayout = function() {
		if (!this.element) return;

		var cWidth = this.element.offsetWidth;

		if (this.wrap) {
			if (cWidth <= this.smallestWidth) {
				if (!hasClass(this.wrap, 'psc-small')) {
					addClass(this.wrap, 'psc-small');
				}
				if (!hasClass(this.wrap, 'psc-smallest')) {
					addClass(this.wrap, 'psc-smallest');
				}
			} else if (cWidth <= this.smallWidth) {
				if (!hasClass(this.wrap, 'psc-small')) {
					addClass(this.wrap, 'psc-small');
				}
				removeClass(this.wrap, 'psc-smallest');
			} else {
				removeClass(this.wrap, ['psc-small', 'psc-smallest']);
			}
		}
	};

	/**
	 * After a form change, check whether each measurement form is filled out
	 * Set an internal indicator if so
	 */
	PlusSizeCalculator.prototype.checkFormAfterChange = function() {
		var self = this,
		baseGroup = this.inputGroups[0].getElementsByClassName('psc-select'),
		compGroup = this.inputGroups[1].getElementsByClassName('psc-select'),
		baseVals = [],
		compVals = [],
		len = baseGroup.length,
		exceptClass = '';
		val = null;

		for (var i = 0; i < len; i++) {
			val = baseGroup[i].value;
			if (!val || val.trim() == '') {
				baseVals.push(baseGroup[i]);
				self.tmComplete = false;
			}
		}

		len = compGroup.length;
		for (i = 0; i < len; i++) {
			val = compGroup[i].value;
			if (!val || val.trim() == '') {
				compVals.push(compGroup[i]);
				self.ctmComplete = false;
			}
		}

		if (!baseVals.length) {
			self.tmComplete = true;
		}

		if (!compVals.length) {
			self.ctmComplete = true;
		}

		// If the first section measurements are complete (tmComplete=true), clear the tire2 vals
		// Otherwise, clear all vals
		if (this.tmComplete) {
			exceptClass = 'psc-tire1';
		}
		clearValsByClass('psc-value', exceptClass);
	};

	/**
	 * Organize metric GetValidTireSizeDescriptions response data into arrays for each menu
	 * @param {Array} tireSizes - Raw metric data on tire sizes
	 * @return {Object} - Measurements in the form {first:[], second:[], third:[]}
	 */
	PlusSizeCalculator.prototype.normalizeMetric = function(tireSizes) {
		var res = {},
		width = [],
		aspect = [],
		inDiam = [],
		len = tireSizes.length,
		tSize = null;

		for (var i = 0; i < len; i++) {
			tSize = tireSizes[i];
			if (width.indexOf(tSize.Width) === -1) {
				width.push(tSize.Width);
				aspect[tSize.Width] = [];
				aspect[tSize.Width].push(tSize.AspectRatio);
				inDiam[tSize.Width + '_' + tSize.AspectRatio] = [];
				inDiam[tSize.Width + '_' + tSize.AspectRatio].push(tSize.InsideDiameter);
			} else {
				if (aspect[tSize.Width].indexOf(tSize.AspectRatio) === -1) {
					aspect[tSize.Width].push(tSize.AspectRatio);
					inDiam[tSize.Width + '_' + tSize.AspectRatio] = [];
					inDiam[tSize.Width + '_' + tSize.AspectRatio].push(tSize.InsideDiameter);
				} else {
					if (inDiam[tSize.Width + '_' + tSize.AspectRatio].indexOf(tSize.InsideDiameter) === -1) {
						inDiam[tSize.Width + '_' + tSize.AspectRatio].push(tSize.InsideDiameter);
					}
				}
			}
		}

		res.first = width;
		res.second = aspect;
		res.third = inDiam;

		return res;
	};

	/**
	 * Organize flotation GetValidTireSizeDescriptions response data into arrays for each menu
	 * @param {Array} tireSizes - Raw flotation data on tire sizes
	 * @return {Object} - Measurements in the form {first:[], second:[], third:[]}
	 */
	PlusSizeCalculator.prototype.normalizeFlotation = function(tireSizes) {
		var res = {},
		outDiam = [],
		width = [],
		inDiam = [],
		len = tireSizes.length,
		tSize = null,
		lastNum = null;

		for (var i = 0; i < len; i++) {
			tSize = tireSizes[i];

			if (outDiam.indexOf(tSize.OutsideDiameter) === -1) {
				outDiam.push(tSize.OutsideDiameter);
				width[tSize.OutsideDiameter] = [];
				if(tSize.Width.toString().length === 1){
					width[tSize.OutsideDiameter].push(parseFloat(tSize.Width.toString()).toFixed(1));
				} else {
					width[tSize.OutsideDiameter].push(tSize.Width);
				}
				inDiam[tSize.OutsideDiameter + '_' + tSize.Width] = [];
				inDiam[tSize.OutsideDiameter + '_' + tSize.Width].push(tSize.InsideDiameter);
			} else {
				if (width[tSize.OutsideDiameter].indexOf(tSize.Width) === -1) {
					if(lastNum != tSize.Width){
						if(tSize.Width.toString().length === 1){
							width[tSize.OutsideDiameter].push(parseFloat(tSize.Width.toString()).toFixed(1));
						} else {
							width[tSize.OutsideDiameter].push(tSize.Width);
						}
					}
					inDiam[tSize.OutsideDiameter + '_' + tSize.Width] = [];
					inDiam[tSize.OutsideDiameter + '_' + tSize.Width].push(tSize.InsideDiameter);
				} else {
					if (inDiam[tSize.OutsideDiameter + '_' + tSize.Width].indexOf(tSize.InsideDiameter) === -1) {
						inDiam[tSize.OutsideDiameter + '_' + tSize.Width].push(tSize.InsideDiameter);
					}
				}
			}
			lastNum = tSize.Width;
		}
		res.first = outDiam;
		res.second = width;
		res.third = inDiam;

		return res;
	};

	/**
	 * Populates the tire specification / difference sections
	 * @param {Object} compData - Data from ridestyler comparing two tire sizes
	 */
	PlusSizeCalculator.prototype.populateComparison = function(compData) {
		var baseSize = compData.BaseSize,
		newSizes = compData.NewSizes[0],
		diffs = compData.Differences[0],
		tsdBody = document.getElementById('psc-tsd-table').getElementsByTagName('tbody'),
		trs = tsdBody[0].getElementsByTagName('tr'),
		len = trs.length,
		increment = this.mphIncrement,
		rowVals = null,
		rows = {
			OutsideDiameter: document.getElementById('psc-diameter-row').getElementsByClassName('psc-value'),
			Width: document.getElementById('psc-width-row').getElementsByClassName('psc-value'),
			SidewallHeight: document.getElementById('psc-sidewall-row').getElementsByClassName('psc-value'),
			OutsideCircumference: document.getElementById('psc-circumference-row').getElementsByClassName('psc-value'),
			Revolutions: document.getElementById('psc-revsmile-row').getElementsByClassName('psc-value')
		};

		for (var i in rows) {
			if (i === 'Revolutions') {
				rows[i][0].innerHTML = baseSize[i].PerMile.toFixed(2);
				rows[i][1].innerHTML = newSizes[i].PerMile.toFixed(2);
			} else {
				rows[i][0].innerHTML = baseSize[i].Inches.toFixed(2);
				rows[i][1].innerHTML = newSizes[i].Inches.toFixed(2);
			}
			rows[i][2].innerHTML = (100 * diffs[i].Percent).toFixed(2) + '%';
		}

		for (i = 0; i < len; i++) {
			rowVals = trs[i].getElementsByClassName('psc-value');
			rowVals[0].innerHTML = increment;
			rowVals[1].innerHTML = ((diffs.OutsideCircumference.Percent + 1) * increment).toFixed(2);
			increment += this.mphIncrement;
		}

		if (!this.ctmComplete) {
			clearValsByClass('psc-value', 'psc-tire1');
		}
	};

	/**
	 * Fetch our html template via xhr
	 * @param {function} cb
	 */
	PlusSizeCalculator.prototype.loadTemplate = function(cb) {
		var self = this,
		xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function() {
			var completed = 4;

			if (xhr.readyState === completed) {
				if (xhr.status === 200) {
					self.tplHtml = xhr.responseText;
					self.templateLoaded = true;

					if (typeof cb === 'function') {
						cb.apply(self);
					}
				} else {
					console.error('xhr request for template failed');
				}
			}
		};

		xhr.open('GET', this.tplUrl, true);
		xhr.send(null);
	};

	/**
	 * Insert our stylesheet into the <head>
	 * @param {function} cb
	 */
	PlusSizeCalculator.prototype.loadStyles = function(cb) {
		var self = this,
		css = document.createElement('link');

		css.rel = 'stylesheet';
		css.type = 'text/css';
		css.href = this.cssUrl;

		css.onload = function() {
			if (!self.stylesheetLoaded) {
				self.stylesheetLoaded = true;

				if (typeof cb === 'function') {
					cb.apply(self);
				}
			}
		};

		prependChild(document.getElementsByTagName('head')[0], css);
	};

	/**
	 * Display or remove a loading indicator
	 * @param {boolean} isLoading
	 */
	PlusSizeCalculator.prototype.showLoading = function(isLoading) {
		var loadingIndicator = document.getElementById('psc-loading'),
		elem = null,
		position = '',
		cHeight = this.element.clientHeight;
		cWidth = this.element.clientWidth;

		if (this.templateLoaded && this.stylesheetLoaded) {
			isLoading = false;
		}

		if (isLoading) {
			if (!loadingIndicator && cHeight > 0 && cWidth > 0) {
				elem = document.createElement('img');
				elem.id = 'psc-loading';
				elem.src = this.loadingImg;
				elem.style.position = 'absolute';
				elem.style.margin = 'auto';
				elem.style.top = '0';
				elem.style.bottom = '0';
				elem.style.left = '0';
				elem.style.right = '0';

				position = this.element.style.position;
				if (position !== 'relative' && position !== 'absolute') {
					this.element.style.position = 'relative';
				}

				this.element.appendChild(elem);
			}
		} else {
			if (loadingIndicator) {
				loadingIndicator.outerHTML = '';
			}
		}
	};

	/**
	 * Add an event listener of type eventType for one or more elements
	 * @param {Array} els - Array of elements on which to attach listeners
	 * @param {string} eventType - The event type we are listening for
	 * @param {function} cb - Callback to execute when the event fires
	 */
	PlusSizeCalculator.prototype.addListeners = function(els, eventType, cb) {
		if (els) {
			if (typeof els.length !== 'undefined') {
				for (var i = 0; i < els.length; i++) {
					this.addListener(els[i], eventType, cb);
				}
			} else {
				this.addListener(els, eventType, cb);
			}
		}
	};

	/**
	 * Add an event listener of type eventType for a single element
	 * @param {Element} el
	 * @param {string} eventType
	 * @param {function} cb
	 */
	PlusSizeCalculator.prototype.addListener = function(el, eventType, cb) {
		if (el) {
			if (el.addEventListener) {
				el.addEventListener(eventType, proxy(cb, this));
			} else if (el.attachEvent) {
				el.attachEvent('on' + eventType, proxy(cb, this));
			} else {
				console.error('Unable to attach ' + eventType + ' event listener');
			}
		}
	};

	/**
	*	Takes a string value and returns a number if the val can be parsed
	* @param {String} val
	*/
	var parseFloatValue = function(val) {
		var parsedValue,
		valString = val;

		if(valString.length == 3 && valString.charAt(2) == 0){ //can be parsed, parse value return value
			parsedValue = parseFloat(valString);
			return parsedValue;
		} else { //cant be parsed, just return val
			return val;
		}
	};

	/**
	 * Empty and disable an element
	 * @param {Element} elem
	 */
	var emptyDisableElem = function(elem) {
		elem.innerHTML = '';
		elem.disabled = 'disabled';
	};

	/**
	 * Initialize a measurement select
	 * Empty the select, sort the data to populate it, and create <options> for the data
	 * @param {Element} elem - The select Element to initialize
	 * @param {string} label - Label for the first option
	 * @param {Array} data - Data to populate the select
	 */
	var initSelect = function(elem, label, data) {
		var opt = null,
		len = data.length;

		elem.innerHTML = '';

		data.sort(function(one, two) {
			return one - two;
		});

		opt = document.createElement('option');
		opt.innerText = label;
		opt.value = '';

		elem.appendChild(opt);
		elem.disabled = false;

		for (var i = 0; i < len; i++) {
			opt = document.createElement('option');
			opt.innerText = data[i];
			elem.appendChild(opt);
		}
	};

	/**
	 * Clear a class of elements
	 * @param {string} className - Class to clear
	 * @param {string} exceptClass - Optional class to ignore
	 */
	var clearValsByClass = function (className, exceptClass) {
		var elems = document.getElementsByClassName(className),
		len = elems.length;

		for (var i = 0; i < len; i++) {
			if (!exceptClass || !hasClass(elems[i], exceptClass)) {
				elems[i].innerText = '';
				elems[i].innerHTML = '';
			}
		}
	};

	/**
	 * Determines if element el has class cl
	 * @param {Element} el
	 * @param {string} cl
	 * @return {boolean}
	 */
	var hasClass = function (el, cl) {
		var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
		return !!el.className.match(regex);
	};

	/**
	 * Add class cl to element el
	 * @param {Element} el
	 * @param {string} cl
	 */
	var addClass = function (el, cl) {
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
	var removeClass = function (el, cl) {
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

	/**
	 * Call function cbwith context ctx
	 * @param {function} cb
	 * @param {Object} ctx
	 * @return {function}
	 */
	var proxy = function(cb, ctx) {
		return function() {
			return cb.apply(ctx, arguments);
		};
	};

	/**
	 * Prepend node newChild to a parent element
	 * @param {Element} parent
	 * @param {Element} newChild
	 */
	function prependChild(parent, newChild) {
		parent.insertBefore(newChild, parent.firstChild);
	}

	window.PlusSizeCalculator = PlusSizeCalculator;
})();
