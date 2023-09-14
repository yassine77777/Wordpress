Chart.defaults.elements.line.backgroundColor = '#ddd';
Chart.defaults.elements.line.tension = 0.1;

let setupChart = function (chart) {
	let statData = JSON.parse(chart.querySelector('.em-chart-wrapper').getAttribute('data-chart'));
	canvas = chart.querySelector('canvas');
	let currentChart = Chart.getChart(canvas[0]);
	if( currentChart ){
		currentChart.destroy();
	}
	chart.querySelector('.em-chart-title').innerHTML = statData.chartTitle;

	let currencyFormat = function (value) {
		return new Intl.NumberFormat(statData.locale, {
			style: 'currency',
			currency: statData.currency,
			maximumFractionDigits: 0,
			minimumFractionDigits: 0
		}).format(value);
	}

	let getScales = function () {
		if (!statData.scales) {
			return null;
		}
		let scales = {};
		let currencyScale = {
			beginAtZero: true,
			display: true,
			ticks: {
				callback: currencyFormat, // Include a dollar sign in the ticks
				precision: 0,
			},
			grid: {
				display: true,
				drawOnChartArea: true,
			}
		};
		let intScale = {
			beginAtZero: true,
			display: true,
			type: 'linear',
			precision: 0,
			grid: {
				drawOnChartArea: true, // only want the grid lines for one axis to show up
			},
			ticks: {
				precision: 0,
			}
		};
		if (statData.scales.y0.type === 'price') {
			scales.y0 = currencyScale;
		} else {
			scales.y0 = intScale;
		}
		if ('y1' in statData.scales && statData.scales.y1) {
			if (statData.scales.y1.type === 'price') {
				scales.y1 = Object.assign({}, currencyScale);
			} else {
				scales.y1 = Object.assign({}, intScale);
			}
			scales.y1.position = 'right';
			scales.y1.grid.drawOnChartArea = false;
		} else if (statData.subgroups) {
			// stack values depending on what's returned (server-side determined)
			scales.x = {
				stacked: true,
			}
			scales.y0.stacked = true;
		}
		return scales;
	}

	let config = {
		type: statData.type,
		data: statData.data,
		options: {
			chartArea: {
				backgroundColor: 'rgb(255, 255, 255)',
			},
			scales: getScales(),
			interaction: {
				intersect: false,
				mode: 'x',
			},
			plugins: {
				tooltip: {
					callbacks: {
						title: function (context) {
							if ( statData.subgroups && statData.compare && context.length > 0 ){
								return '';
							} else if ( statData.compare && statData.type !== 'pie' ) {
								return '';
							} else {
								return context[0].label;
							}
						},
						label: function (context) {
							let label = context.dataset.label || '';
							if( statData.type !== 'pie') {
								if (!statData.subgroups && statData.compare && context.dataIndex in context.dataset.compareLabels) {
									label = ' ' + context.dataset.compareLabels[context.dataIndex];
								}
							}

							if (label) {
								label += ' : ';
							} else {
								label += ' ';
							}

							let y = typeof context.parsed.y === 'undefined' ? context.parsed : context.parsed.y;
							if (y === null) {
								return false;
							}
							if (context.dataset.format === 'price') {
								label += new Intl.NumberFormat(statData['locale'], {
									style: 'currency',
									currency: statData['currency'],
									maximumFractionDigits: 0,
									minimumFractionDigits: 0
								}).format(y);
							} else {
								label += y;
							}

							if (statData.type === 'pie') {
								let total = 0;
								context.dataset.data.forEach(function (item) {
									total += parseFloat(item);
								});
								label += '  ( ' + ((y / total) * 100).toPrecision(2) + '% )';
							}
							return label;
						},
						footer: function (tooltipItems) {
							if (tooltipItems.length > 1 && statData.compare && statData.compareType === 'scope' && !statData.subgroups ) {
								let qty1 = 0;
								let qty2 = 0;
								if( statData.subgroups ){
									tooltipItems.forEach( function( tooltipItem ){
										if( tooltipItem.dataset.stack === 0 ){
											qty1 += tooltipItem.parsed.y;
										}else if( tooltipItem.dataset.stack === 1 ){
											qty2 += tooltipItem.parsed.y;
										}
									});
								}else{
									qty1 = tooltipItems[0].parsed.y;
									qty2 = tooltipItems[1].parsed.y;
								}
								if (qty1 === null || qty2 === null) return '';
								let change;
								let difference = qty1 - qty2;
								if (qty1 === qty2) {
									change = '0%';
									difference = 0;
								} else if (qty1 > qty2) {
									if (qty2 === 0 || qty2 === null) {
										change = 100;
										difference = qty1 - qty2;
									} else {
										change = ((qty1 / qty2) - 1) * 100;
									}
									change = '+' + change.toFixed(2) + '%'
								} else {
									if (qty1 === 0 || qty1 === null) {
										change = 100;
									} else {
										change = (1 - (qty1 / qty2)) * 100;
									}
									change = '-' + change.toFixed(2) + '%'
								}

								if (tooltipItems[0].dataset.format === 'price') {
									difference = new Intl.NumberFormat(statData['locale'], {
										style: 'currency',
										currency: statData['currency'],
										maximumFractionDigits: 0,
										minimumFractionDigits: 0
									}).format(difference);
								}
								return 'Change: ' + change + "\n" + 'Difference: ' + difference;
							}else if( statData.subgroups ){
								let subtotal = 0;
								tooltipItems.forEach( function(tooltipItem){
									subtotal += tooltipItem.parsed.y;
								});
								if (tooltipItems[0].dataset.format === 'price') {
									subtotal = new Intl.NumberFormat(statData['locale'], {
										style: 'currency',
										currency: statData['currency'],
										maximumFractionDigits: 0,
										minimumFractionDigits: 0
									}).format(subtotal);
								}
								return 'Subtotal: ' + subtotal;
							}
						},
						beforeBody : function( context ){
							if( statData.subgroups && statData.compare && context.length > 0 ){
								let index = 0;
								if( context[0].raw === null ){
									context.every( function(tooltipItem, i){
										index = i;
										return tooltipItem.raw === null;
									});
								}

								return context[index].dataset.compareLabels[context[index].dataIndex];
							}
						},
						/*
						beforeLabel : function(){ return 'beforeLabel'; },
						afterLabel : function(){ return 'afterLabel'; },
						afterBody : function(){ return 'afterBody'; },
						beforeFooter : function(){ return 'beforeFooter'; },
						*/
					}
				},
				legend : {
					// works for lines and bars inc stacked
					onHover: function (evt, item, legend) {
						evt.native.target.style.cursor = 'pointer';
						// lighten non-hovered pie items
						legend.chart.data.datasets.forEach(function (dataset, index, datasets) {
							let color = dataset.backgroundColor;
							let colorOpacity = statData.subgroups && statData.type === 'line' ? 1 : '0.75';
							let opacity = statData.subgroups && statData.type === 'line' ? '0.05' : '0.2';
							dataset.backgroundColor = dataset.label !== item.text && color.indexOf(opacity) === -1 ? color.replace(', '+ colorOpacity +')', ', '+ opacity +')') : color;
							dataset.borderColor = dataset.label !== item.text && color.indexOf(opacity) === -1 ? color.replace(', '+ colorOpacity +')', ', '+ opacity +')') : color;
							// trigger tooltip for highlighted legend
						});
						legend.chart.update();
					},
					onLeave: function (evt, item, legend) {
						// unlighten non-hovered pie items
						legend.chart.data.datasets.forEach(function (dataset, index, datasets) {
							let color = dataset.backgroundColor;
							let colorOpacity = statData.subgroups && statData.type === 'line' ? 1 : '0.75';
							let opacity = statData.subgroups && statData.type === 'line' ? '0.05' : '0.2';
							dataset.backgroundColor = color.indexOf(opacity) === -1 ? color : color.replace(', '+ opacity +')', ', '+ colorOpacity +')');
							dataset.borderColor = color.indexOf(opacity) === -1 ? color : color.replace(', '+ opacity +')', ', '+ colorOpacity +')');
						});
						legend.chart.update();
					},
				}
			},
		},
		plugins: [{
			beforeDraw: function (chart, easing) {
				if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
					let chartArea = chart.chartArea;
					chart.ctx.save();
					chart.ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
					chart.ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
					chart.ctx.restore();
				}
			},
		}],
	};
	if (statData.type === 'pie') {
		config.options.interaction.mode = 'index';
		config.options.plugins.legend = {
			position: 'right',
			onHover: function (evt, item, legend) {
				// lighten non-hovered pie items
				legend.chart.data.datasets[0].backgroundColor.forEach(function (color, index, colors) {
					colors[index] = index !== item.index && color.indexOf('a') === -1 ? color.replace(')', ', 0.3)').replace('rgb', 'rgba') : color;
					// trigger tooltip for highlighted legend
					if (index === item.index) {
						const tooltip = legend.chart.tooltip;
						const chartArea = legend.chart.chartArea;
						tooltip.setActiveElements([{datasetIndex: 0, index: index,}], {
							x: (chartArea.left + chartArea.right) / 2,
							y: (chartArea.top + chartArea.bottom) / 2,
						});
					}
				});
				legend.chart.update();
			},
			onLeave: function (evt, item, legend) {
				// unlighten non-hovered pie items
				legend.chart.data.datasets[0].backgroundColor.forEach(function (color, index, colors) {
					colors[index] = color.indexOf('a') === -1 ? color : color.replace(', 0.3)', ')').replace('rgba', 'rgb');
					// untrigger tooltip for highlighted legend
					const tooltip = legend.chart.tooltip;
					tooltip.setActiveElements([], {x: 0, y: 0});
				});
				legend.chart.update();
			},
		};
	}
	//let altconfig = {};
	//"callbacks": config.options.plugins.tooltip.callbacks,
	//statData.compare = true;
	//statData.subgroups = true;
	//config = Object.assign(config, altconfig);

	// add more colors for larger datasets
	const colorOpacity = statData.subgroups && statData.type === 'line' ? 1 : '0.75';
	const colors = [
		'rgba(54, 162, 235, '+ colorOpacity +')',
		'rgba(255, 99, 132, '+ colorOpacity +')',
		'rgba(255, 205, 86, '+ colorOpacity +')',
		'rgba(75, 192, 192, '+ colorOpacity +')',
		'rgba(153, 102, 255, '+ colorOpacity +')',
		'rgba(255, 159, 64, '+ colorOpacity +')',
		'rgba(146, 203, 207, '+ colorOpacity +')',
		'rgba(201, 231, 127, '+ colorOpacity +')',
		'rgba(203, 67, 53, '+ colorOpacity +')',
		'rgba(31, 97, 141, '+ colorOpacity +')',
		'rgba(241, 196, 15, '+ colorOpacity +')',
		'rgba(39, 174, 96, '+ colorOpacity +')',
		'rgba(136, 78, 160, '+ colorOpacity +')',
		'rgba(211, 84, 0, '+ colorOpacity +')',
		'rgba(213, 90, 200, '+ colorOpacity +')',
		'rgba(200, 90, 100, '+ colorOpacity +')',
		'rgba(34, 207, 207, '+ colorOpacity +')',
		'rgba(5, 155, 255, '+ colorOpacity +')',
		'rgba(201, 203, 207, '+ colorOpacity +')',
		'rgba(129, 129, 129, '+ colorOpacity +')',
	];
	if( statData.subgroups ) {
		let subgroups = {};
		let colorIndex = 0;
		config.data.datasets.forEach(function (dataset, index, datasets) {
			if ( !(dataset.label in subgroups) ) {
				subgroups[dataset.label] = colors[colorIndex];
			}
			dataset.backgroundColor = subgroups[dataset.label];
			colorIndex = (colorIndex < colors.length - 1) ? colorIndex + 1 : 0;
		});
		config.options.interaction.mode = 'x';
		config.options.plugins.legend = Object.assign( config.options.plugins.legend, {
			position: 'right',
			onClick: (evt, legendItem, legend) => {
				let newVal = !legendItem.hidden;
				legend.chart.data.datasets.forEach(dataset => {
					if (dataset.label === legendItem.text) {
						dataset.hidden = newVal
					}
				});
				legend.chart.update();
			},
			labels: {
				filter: (legendItem, chartData) => {
					/*
					let colors = [];
					chartData.datasets.forEach( function(dataset){
						colors.push(dataset.backgroundColor);
					});
					console.log(colors);

					 */
					let entries = chartData.datasets.map(e => e.label);
					return entries.indexOf(legendItem.text) === legendItem.datasetIndex;
				}
			},
		});
	}
	if( config.type !== 'pie' ){
		let colorIndex = 0;
		let colorStack = {}
		config.data.datasets.forEach(function (dataset) {
			let color;
			if( statData.compare && !statData.subgroups ){
				// when comparing two datasets
				color = dataset.stack in colorStack ? colorStack[dataset.stack] : colors[colorIndex];
				colorStack[dataset.stack] = color;
			}else{
				// anything else
				color = dataset.label in colorStack ? colorStack[dataset.label] : colors[colorIndex];
				colorStack[dataset.label] = color;
			}
			dataset.backgroundColor = color;
			dataset.borderColor = color;
			colorIndex = (colorIndex < colors.length - 1) ? colorIndex + 1 : 0;
		});
	}
	let $chart = new Chart(canvas, config);

	// update view options
	/*
	chart.querySelector('select[name="stacked"]').checked = statData.subgroups;
	chart.querySelector('select[name="stacked"]').disabled = !statData.stackable;
	if( statData.stackable ){
		chart.querySelector('label.em-chart-stackable').classList.remove('disabled');
	}else{
		chart.querySelector('label.em-chart-stackable').classList.add('disabled');
	}

	 */

	let viewOptions = chart.querySelector('select[name="type"]');
	Object.keys(statData.views).forEach( function(index){
		viewOptions.querySelector('option[value="'+ index +'"]').disabled = !statData.views[index];
	});
	viewOptions.value = statData.type;

	return $chart;
}

let setupChartFilters = function (chart) {
	jQuery(document).on('em_flatpickr_loaded', function () {
		// add range support for mixed datepickers
		let flatpickr = chart.querySelector('.em-chart-dates-custom .em-date-input')._flatpickr;
		let flatpickrCompare = chart.querySelector('.em-chart-dates-compare .em-date-input')._flatpickr;
		let setMaxDate = function (selectedDates) {
			let maxDate;
			if (selectedDates.length > 0) {
				let difference = selectedDates[1].getTime() - selectedDates[0].getTime();
				maxDate = new Date(selectedDates[0].getTime() - difference - 86400000);
			} else {
				maxDate = new Date(selectedDates[0].getTime() - 86400000);
			}
			flatpickrCompare.set('maxDate', maxDate);
			if (!flatpickrCompare.selectedDates[0] || flatpickrCompare.selectedDates[0] > maxDate) {
				flatpickrCompare.setDate(maxDate);
			}
			return maxDate;
		}
		//flatpickr.l10ns.rangeSeparator = ' - ';
		let altConfig = {
			altInput: true,
			allowInput: false,
			dateFormat: "YYYY-MM-DD",
			altFormat: "MMM DD, YYYY",
			parseDate: function (datestr, format) {
				return moment(datestr, format, true).toDate();
			},
			formatDate: function (date, format, locale) {
				if (format === 'x') {
					// locale can also be used
					let selectedDates = flatpickr.selectedDates;
					if (selectedDates.length > 1) {
						let difference = selectedDates[1].getTime() - selectedDates[0].getTime();
						let endDate = new Date(date.getTime() + difference);
						return moment(date).format("MMM DD, YYYY") + ' - ' + moment(endDate).format("MMM DD, YYYY");
					} else {
						return moment(date).format("MMM DD, YYYY");
					}
				}
				return moment(date).format(format);
			},
		}
		Object.assign(flatpickr.config, altConfig);
		Object.assign(flatpickrCompare.config, altConfig);
		//flatpickr.l10n.rangeSeparator = " \- ";
		flatpickrCompare.config.altFormat = 'x'; // trigger a rewrite
		if (flatpickr.selectedDates.length > 0) {
			flatpickr.setDate(flatpickr.selectedDates, false);
			setMaxDate(flatpickr.selectedDates);
		}

		jQuery(document).ready(function ($) {
			let $chart = $(chart);
			let currentRequest;
			let refreshChart = function () {
				if( currentRequest ){
					currentRequest.abort();
				}
				let formData = new FormData($chart.find('form')[0]);
				formData.set('action', 'em_chart_bookings');
				let chartArea = $chart.find('.em-chart-wrapper').addClass('loading');
				chartArea.append($('<div class="em-loading"></div>'));
				currentRequest = $.ajax({
					url: EM.ajaxurl,
					data: formData,
					processData: false,
					contentType: false,
					type: 'POST',
					success: function (data) {
						let $data = $(data);
						chartArea.replaceWith($data);
						setupChart(chart);
						currentRequest = null;
					}
				});
			}
			let disableInputs = function( el ){
				if( el.name === 'range_type' ){
					if( el.value === 'all' ){
						// disable comparisons
						$chart.find('select[name="compare"] optgroup[data-label-key="time"] option').prop('disabled',true);
					}else{
						$chart.find('select[name="compare"] optgroup[data-label-kdey="time"] option').prop('disabled',false);
					}
				}else if( el.name === 'unit' ){
					$chart.find('select[name="compare"] optgroup[data-label-key="units"] option').prop('disabled',false).filter('option[value="'+el.value+'"]').prop('disabled', true);
				}else if( el.name === 'mode' ){
					let stackables = {
						day : ['ticket'],
						week : ['day','ticket'],
						month : ['week','day','ticket'],
						year : ['month','week','day','ticket'],
					}
					let stackingEl = $chart.find('select[name="stacked"]');
					if( el.value in stackables ){
						let stackable = stackables[el.value];
						if( stackingEl.val() && !stackable.includes(stackingEl.val()) ){
							stackingEl.val('0');
						}
						stackingEl.find('option').each( function(){
							if( this.value !== '0' ){
								this.disabled = !stackable.includes(this.value);
							}
						});
					}else{
						stackingEl.val('0');
					}
				}
			}
			$chart.find('select').each( function(){ disableInputs(this); } );
			$chart.on('change', 'input[type="text"], select, input[type="checkbox"]', function () {
				if (this.name === 'compare' || this.name === 'range_type') {
					if (this.value === 'custom') {
						return true;
					}
				}
				disableInputs(this);
				refreshChart();
			});

			// date chagnes and range picker
			let datepickerListener = function () {
				let el = $(this);
				if (el.val() === 'custom') {
					if (this.name === 'range_type') {
						flatpickr.clear();
						flatpickrCompare.clear();
					}
					el.closest('.em-chart-filter-set').find('.em-datepicker').show();
				} else {
					if (this.name === 'range_type') {
						// set the date range based on choice
						let dates = [];
						let opt = this.options[this.selectedIndex];
						opt.getAttribute('data-date').split(',').forEach(function (date) {
							dates.push(new Date(date));
						});
						if (dates.length > 0) {
							flatpickr.setDate(dates, false);
							let maxDate = setMaxDate(flatpickr.selectedDates);
							flatpickrCompare.setDate(maxDate);
						}
					}
					el.closest('.em-chart-filter-set').find('.em-datepicker').hide();
				}
			}
			let datepickerListeners = $chart.find('[name="range_type"], [name="compare"]').on('change', datepickerListener);
			datepickerListeners.each(function () {
				datepickerListener.apply(this);
			});
			// flatpickr listener with block function ref
			flatpickr.config.onClose.push(function (selectedDates, dateStr, instance) {
				setMaxDate(selectedDates);
			});
			flatpickr.config.onChange.push(function (selectedDates, dateStr, instance) {
				// trigger refresh only with a range
				if( selectedDates.length > 1 ) {
					refreshChart();
				}
			});
			flatpickrCompare.config.onChange.push(refreshChart);

			// filter and modal triggers
			$chart.find('.em-chart-filters-trigger').on('click', function(){
				$chart.toggleClass('hidden-filters');
			});
			//Settings & Export Modal
			let settingsTrigger = $chart.find('.em-chart-settings-trigger');
			let setingsModal = $(settingsTrigger.attr('rel'));
			setingsModal.on('click', '.button-primary', function(){
				closeModal( setingsModal, refreshChart );
			});
			settingsTrigger.on('click', function(e){
				e.preventDefault();
				openModal( setingsModal );
			});
		});
	});
	let breakpoints = {
		'small': 450,
		'medium': 1110,
		'large': false,
	}
	const chart_ro = EM_ResizeObserver(breakpoints, [chart]);
}

let canvas;
const charts = document.querySelectorAll('.em-chart');
charts.forEach(function (chart) {
	setupChart(chart);
	setupChartFilters(chart);
});