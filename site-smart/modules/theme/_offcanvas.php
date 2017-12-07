<?php namespace ProcessWire;

if(!defined("PROCESSWIRE")) die();

/** @var AdminUikit $adminTheme */
/** @var Paths $urls */

?>

<!-- OFFCANVAS NAV TOGGLE -->
<a id='offcanvas-toggle' class='uk-hidden' href="#offcanvas-nav" uk-toggle>
	<?php echo $adminTheme->renderIcon('bars fa-lg'); ?>
</a>

<!-- OFFCANVAS NAVIGATION -->
<div id="offcanvas-nav" uk-offcanvas>
	<div class="uk-offcanvas-bar">
			<!--
		<form class='uk-margin' action='<?php echo $urls->admin; ?>page/search/' method='get'> 
			<div class="uk-inline">
				<span class="uk-form-icon"><?php echo $adminTheme->renderIcon('search'); ?></span>
				<input type='text' class='uk-input uk-form-width-large' placeholder='' name='q' value='' />
			</div>
			<input class='uk-hidden' type='submit' name='search' value='Search' />
			<input type='hidden' name='show_options' value='1' />
		</form>
		-->
		<?php include(__DIR__ . '/_search-form.php'); ?>
		<ul class='pw-sidebar-nav uk-nav uk-nav-primary uk-nav-parent-icon' data-uk-nav='animation: false;'>
			<?php echo $adminTheme->renderSidebarNavItems(); ?>
		</ul>	
	</div>
</div>

