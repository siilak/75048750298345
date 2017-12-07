
function setupUikitForms() {

	function initFormMarkup() {
		// horizontal forms setup
		$("form.uk-form-horizontal").each(function() {
			$(this).find('.InputfieldContent > .Inputfields').each(function() {
				var $content = $(this);
				$content.addClass('uk-form-vertical');
				$content.find('.uk-form-label').removeClass('uk-form-label');
				$content.find('.uk-form-controls').removeClass('uk-form-controls');
			});
			$(this).find('.InputfieldSubmit, .InputfieldButton').each(function() {
				$(this).find('.InputfieldContent').before("<div class='uk-form-label'>&nbsp;</div>");
			});
		});

		// card inputfields setup
		$(".InputfieldNoBorder.uk-card").removeClass('uk-card uk-card-default');

		// offset inputfields setup
		$(".InputfieldIsOffset.InputfieldColumnWidthFirst").each(function() {
			// make all fields in row maintain same offset as first column
			var $t = $(this);
			var $f;
			do {
				$f = $t.next(".InputfieldColumnWidth");
				if(!$f.length || $f.hasClass('InputfieldColumnWidthFirst')) break;
				$f.addClass('InputfieldIsOffset');
				$t = $f;
			} while(true);
		});

		// update any legacy inputfield declarations
		$(".ui-widget.Inputfield, .ui-widget-header.InputfieldHeader, .ui-widget-content.InputfieldContent")
			.removeClass('ui-widget ui-widget-header ui-widget-content');
		
		//$(".Inputfield:not(.InputfieldColumnWidth)").addClass('InputfieldColumnWidthFirst');
	}
	
	function ukGridClass(width) {
		var ukGridClass = 'uk-width-1-1';
		if(!width || width >= 100) return ukGridClass;
		for(var cn in ProcessWire.config.ukGridWidths) {
			var pct = ProcessWire.config.ukGridWidths[cn];
			if(width >= pct) {
				ukGridClass = 'uk-width-' + cn + '@m';
				break;
			}
		}
		return ukGridClass;
	}
	
	function updateInputfieldRow($inputfield) {
		
		var $inputfields = $inputfield.parent().children('.Inputfield');
		var $lastInputfield = null;
		var width = 0;
		var w = 0;
		var lastGridClass = '';
		
		function consoleLog($in, msg) {
			/*
			var id = $in.attr('id');
			id = id.replace('wrap_Inputfield_', '');
			if(id == 'noChildren' || id == 'noParents' || id == 'childTemplates') {
				console.log(id + ' (width=' + width + ', w=' + w + '): ' + msg);	
			}
			*/
		}
		
		function updateLastInputfield(w) {
			if(!$lastInputfield || !$lastInputfield.length) return;
			var gridClass = '';
			if($lastInputfield.hasClass('InputfieldColumnWidthFirst')) {
				gridClass = 'uk-width-1-1';
			} else if(width > 100) {
				gridClass = '';
			} else if(w >= 100) {
				gridClass = 'uk-width-1-1';
			} else {
				gridClass = ukGridClass(100 - width);
			}
			if(gridClass.length) {
				if(lastGridClass.length) $lastInputfield.removeClass(lastGridClass);
				$lastInputfield.addClass(gridClass);
			}
		}
		
		$inputfields.each(function() {
			
			var $inputfield = $(this);
			
			if($inputfield.hasClass('InputfieldColumnWidth')) {
				w = parseInt($inputfield.attr('data-colwidth'));
			} else {
				w = 100;
			}
			
			if($inputfield.hasClass('InputfieldStateHidden')) {
				// hidden, and we'll reserve a spot for it by applying its width to lastInputfield
				width += w;
				updateLastInputfield(w);
				return;
			}
		
			if(!width || width >= 100) {
				// starting a new row
				width = 0;
			} else if(width + w > 100) {
				// start new row and update width for last column
				updateLastInputfield(w);
				width = 0;
			} else {
				// column that isn't first column
				$inputfield.removeClass('InputfieldColumnWidthFirst');
			}
			
			if(!width) {
				// first column in a row
				$inputfield.addClass('InputfieldColumnWidthFirst');
			}
			
			width += w;
			$lastInputfield = $inputfield;
			lastGridClass = ukGridClass(w);
			$inputfield.addClass(lastGridClass);
		});
		
		if(width < 100) {
			consoleLog($lastInputfield, 'outside call because ' + width + '<100');
			updateLastInputfield(w);
		}
	}
	
	// event called when an inputfield is hidden or shown
	var showHideInputfield = function(event, inputfield) {
		var $inputfield = $(inputfield);
		if(event.type == 'showInputfield') {
			$inputfield.removeClass('uk-hidden');
		} else {
			$inputfield.show();
			$inputfield.addClass('uk-hidden');
		}
		updateInputfieldRow($inputfield);
	};

	$(document).on('reloaded', initFormMarkup);
	$(document).on('hideInputfield', showHideInputfield); 
	$(document).on('showInputfield', showHideInputfield);
	
	$('body').addClass('InputfieldColumnWidthsInit');
	initFormMarkup();
}

function initUikitTooltips() {
	$('.tooltip, .pw-tooltip').each(function() {
		$(this).removeClass('tooltip pw-tooltip');
		UIkit.tooltip($(this));
	});
}

	
initUikitForms();
initUikitTooltips();

