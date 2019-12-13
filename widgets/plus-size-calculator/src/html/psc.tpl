<div class="psc-widget">
	<form id="psc-form">
		<div id="psc-selections-wrapper">
			<div class="psc-tm-wrap">
				<div class="psc-select-header-wrapper">
					<h5 class="psc-select-header">Tire 1</h5>
					<span id="psc-sizetype1-0" name="psc-sizetype1" class="psc-sizetype selected">Metric</span>
					<span id="psc-sizetype1-1" name="psc-sizetype1" class="psc-sizetype">Flotation</span>
				</div>

				<p>Enter the sizing information for your current tire:</p>

				<div class="psc-input-group psc-input-select-group">
					<span class="psc-first-input">
						<select class="form-select psc-firsti psc-select" id="psc-first0" name="psc-first0" disabled></select>
					</span>
					<span class="psc-second-input">
						<select class="form-select psc-secondi psc-select" id="psc-second0" name="psc-second0" disabled></select>
					</span>
					<span class="psc-third-input">
						<select class="form-select psc-thirdi psc-select" id="psc-third0" name="psc-third0" disabled></select>
					</span>
				</div>
			</div>

			<div class="psc-ctm-wrap">
				<div class="psc-select-header-wrapper">
					<h5 class="psc-select-header">Tire 2</h2>
					<span id="psc-sizetype2-0" name="psc-sizetype2" class="psc-sizetype1 selected">Metric</span>
					<span id="psc-sizetype2-1" name="psc-sizetype2" class="psc-sizetype1">Flotation</span>
				</div>

				<p>Enter the sizing information for your comparison tire:</p>

				<div class="psc-input-group psc-input-select-group">
					<span class="psc-first-input">
						<select class="form-select psc-firsti psc-select" id="psc-first1" name="psc-first1" disabled></select>
					</span>
					<span class="psc-second-input">
						<select class="form-select psc-secondi psc-select" id="psc-second1" name="psc-second1" disabled></select>
					</span>
					<span class="psc-third-input">
						<select class="form-select psc-thirdi psc-select" id="psc-third1" name="psc-third1" disabled></select>
					</span>
				</div>
			</div>
			<div id="psc-disclaimer"></div>
		</div>

		<div id="psc-info-wrapper">
			<div id="psc-info-header">
				<h5>Results</h5>
				<p id="sizeToggle" class="toggler selected">Size</p>
				<p id="speedToggle" class="toggler ">Speed</p>
			</div>
			<div class="psc-ts-wrap" id="sizeWrapper">
				<p>Physical differences between Tire 1 and Tire 2</p>
				<table class="psc-table psc-ts-table" id="psc-ts-table">
					<thead>
						<tr>
							<th class="psc-image">&nbsp;</th>
							<th>&nbsp;</th>
							<th>Tire 1</th>
							<th>Tire 2</th>
							<th class="psc-diff-header">Difference</th>
						</tr>
					</thead>
					<tbody>
						<tr id="psc-diameter-row">
							<td class="psc-image"><i class="psc-sprite psc-diameter"></i></td>
							<td><span class="psc-title">Diameter</span><span class="psc-exp">Inch</span></td>
							<td><span class="psc-value psc-tire1"></span></td>
							<td><span class="psc-value psc-tire2"></span></td>
							<td><span class="psc-value psc-diff"></span></td>
						</tr>
						<tr id="psc-width-row">
							<td class="psc-image"><i class="psc-sprite psc-width"></i></td>
							<td><span class="psc-title">Width</span><span class="psc-exp">Inch</span></td>
							<td><span class="psc-value psc-tire1"></span></td>
							<td><span class="psc-value psc-tire2"></span></td>
							<td><span class="psc-value psc-diff"></span></td>
						</tr>
						<tr id="psc-sidewall-row">
							<td class="psc-image"><i class="psc-sprite psc-sidewall"></i></td>
							<td><span class="psc-title">Sidewall</span><span class="psc-exp">Inch</span></td>
							<td><span class="psc-value psc-tire1"></span></td>
							<td><span class="psc-value psc-tire2"></span></td>
							<td><span class="psc-value psc-diff"></span></td>
						</tr>
						<tr id="psc-circumference-row">
							<td class="psc-image"><i class="psc-sprite psc-circumference"></i></td>
							<td><span class="psc-title">Circumference</span><span class="psc-exp">Inch</span></td>
							<td><span class="psc-value psc-tire1"></span></td>
							<td><span class="psc-value psc-tire2"></span></td>
							<td><span class="psc-value psc-diff"></span></td>
						</tr>
						<tr id="psc-revsmile-row">
							<td class="psc-image"><i class="psc-sprite psc-revsmile"></i></td>
							<td><span class="psc-title">Revs / Mile</span></td>
							<td><span class="psc-value psc-tire1"></span></td>
							<td><span class="psc-value psc-tire2"></span></td>
							<td><span class="psc-value psc-diff"></span></td>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="psc-tsd-wrap" id="speedWrapper">
				<p>Driving speed for Tire 1 vs Driving speed for Tire 2</p>
				<table class="psc-table psc-tsd-table" id="psc-tsd-table">
					<thead>
						<tr>
							<th>Tire 1</th>
							<th></th>
							<th>Tire 2</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="tire-1"><span class="psc-value psc-tire1"></span></td>
							<td class="vs">vs</td>
							<td class="tire-2"><span class="psc-value"></span></td>
						</tr>
						<tr>
							<td class="tire-1"><span class="psc-value psc-tire1"></span></td>
							<td class="vs">vs</td>
							<td class="tire-2"><span class="psc-value"></span></td>
						</tr>
						<tr>
							<td class="tire-1"><span class="psc-value psc-tire1"></span></td>
							<td class="vs">vs</td>
							<td class="tire-2"><span class="psc-value"></span></td>
						</tr>
						<tr>
							<td class="tire-1"><span class="psc-value psc-tire1"></span></td>
							<td class="vs">vs</td>
							<td class="tire-2"><span class="psc-value"></span></td>
						</tr>
						<tr>
							<td class="tire-1"><span class="psc-value psc-tire1"></span></td>
							<td class="vs">vs</td>
							<td class="tire-2"><span class="psc-value"></span></td>
						</tr>
						<tr>
							<td class="tire-1"><span class="psc-value psc-tire1"></span></td>
							<td class="vs">vs</td>
							<td class="tire-2"><span class="psc-value"></span></td>
						</tr>
						<tr>
							<td class="tire-1"><span class="psc-value psc-tire1"></span></td>
							<td class="vs">vs</td>
							<td class="tire-2"><span class="psc-value"></span></td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div class="psc-clear"></div>
		<input id="psc-form-submit" type="submit">
	</form>
</div>
