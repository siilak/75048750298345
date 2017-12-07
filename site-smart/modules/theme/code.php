<?php namespace ProcessWire;

/**
 * AdminUikit initialization file
 * 
 */

if(!defined("PROCESSWIRE")) die();


/** @var Config $config */
/** @var ProcessWire $wire */
/** @var AdminUikit $adminTheme */
/** @var WireInput $input */

/**
 * Configure PW modules for Uikit
 * 
 */

// uk class => width %
$ukGridWidths = array(
	'4-5' => 80,
	'3-4' => 70,
	'2-3' => 66,
	'4-6' => 64,
	'3-5' => 60,
	'1-2' => 50,
	'2-5' => 40,
	'1-3' => 33,
	'2-6' => 32,
	'1-4' => 25,
	'1-5' => 20,
	'1-6' => 16,
);

$config->set('inputfieldColumnWidthSpacing', 0); 
$config->js('ukGridWidths', $ukGridWidths);

$config->set('InputfieldForm', array(
	'useOffset' => false, // must be false to support configuration per-field
	'useBorders' => true, // must be true to support configuration per-field
	'ukGridWidths' => $ukGridWidths
));

$config->set('JqueryWireTabs', array(
	'ulClass' => 'WireTabs',
	'ulAttrs' => 'uk-tab',
	'liActiveClass' => 'uk-active',
	'aActiveClass' => 'pw-active',
	'loadStyles' => false,
));

$config->set('LanguageTabs', array(
	'jQueryUI' => false, 
	'ulClass' => '',
	'ulAttrs' => 'uk-tab',
	'liActiveClass' => 'uk-active',
	'liDisabledClass' => 'uk-disabled',
	'liEmptyClass' => '',
	'aClass' => '',
));

$config->set('MarkupAdminDataTable', array(
	'addClass' => 'uk-table uk-table-small',
	'loadStyles' => false,
	'loadScripts' => false,
	'responsiveClass' => '',
	'responsiveAltClass' => '',
));

$config->set('MarkupPagerNav', array(
	'nextItemLabel' => "<i class='fa fa-angle-right'></i>",
	'previousItemLabel' => "<i class='fa fa-angle-left'></i>",
	'currentItemClass' => 'uk-active MarkupPagerNavOn',
	'separatorItemLabel' => '<span>&hellip;</span>',
	'separatorItemClass' => 'uk-disabled MarkupPagerNavSeparator',
	'listMarkup' => "<ul class='uk-pagination MarkupPagerNav'>{out}</ul>",
));

$config->set('ProcessPageList', array(
	'paginationClass' => 'uk-pagination',
	'paginationCurrentClass' => 'uk-active',
	'paginationLinkClass' => 'pw-link',
	'paginationLinkCurrentClass' => 'pw-link-active',
	'paginationHoverClass' => 'pw-link-hover',
	'paginationDisabledClass' => 'uk-disabled',
));

$config->set('ProcessList', array(
	'dlClass' => 'uk-description-list uk-description-list-divider',
	'dtClass' => '',
	'ddClass' => '',
	'aClass' => '',
	'disabledClass' => 'ui-priority-secondary',
	'showIcon' => true,
));

$config->set('InputfieldImage', array(
	'buttonClass' => "uk-button uk-button-text uk-margin-right",
	'buttonText' => "{out}",
));

$config->set('InputfieldFile', array(
	'error' => "<span class='ui-state-error-text'>{out}</span>",
));

/**
 * Inputfield forms markup and classes
 * 
 */

$classes = InputfieldWrapper::getClasses();
$classes['form'] = 'InputfieldFormNoWidths InputfieldFormVertical uk-form-vertical';
$classes['list'] = 'Inputfields uk-grid-collapse';
$classes['item_column_width_first'] = 'InputfieldColumnWidthFirst uk-first-column';
$classes['item'] = 'Inputfield {class} Inputfield_{name}';
$classes['item_error'] = "InputfieldStateError uk-alert-danger";
InputfieldWrapper::setClasses($classes);

$markup = InputfieldWrapper::getMarkup();
$markup['list'] = "<ul {attrs} uk-grid>{out}</ul>";
$markup['item_label'] = "<label class='InputfieldHeader uk-form-label' for='{for}'>{out}</label>";
$markup['item_label_hidden'] = "<label class='InputfieldHeader InputfieldHeaderHidden'><span>{out}</span></label>";
$markup['item_content'] = "<div class='InputfieldContent uk-form-controls'>{out}</div>";
InputfieldWrapper::setMarkup($markup);

if(!$config->get('InputfieldWrapper')) $config->set('InputfieldWrapper', array());
$config->InputfieldWrapper('useColumnWidth', false);

?>

<script type="text/javascript">
    $(document).ready(function() {
        
    });

    // $(document).bind('touchmove', false);
</script>
