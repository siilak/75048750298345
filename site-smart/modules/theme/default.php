<?php namespace ProcessWire;

/**
 * default.php: Main markup template file for AdminUikit
 * 
 * FileCompiler=0
 * 
 */

/** @var Config $config */
/** @var AdminUikit $adminTheme */
/** @var User $user */
/** @var Modules $modules */
/** @var Notices $notices */
/** @var Page $page */
/** @var Process $process */
/** @var Sanitizer $sanitizer */
/** @var WireInput $input */
/** @var Paths $urls */

if(!defined("PROCESSWIRE")) die();

if(!isset($content)) $content = '';
$version = $adminTheme->version . 'a';

$config->styles->prepend($config->urls->root . "wire/templates-admin/styles/AdminTheme.css?v=$version");
$config->styles->prepend($adminTheme->getUikitCSS());
$config->styles->append($config->urls->root . "wire/templates-admin/styles/font-awesome/css/font-awesome.min.css?v=$version"); 
$config->styles->append($config->urls->templates . "/design/css/www.css?v=$version");

$ext = $config->debug ? "js" : "min.js";
$config->scripts->append($config->urls->root . "wire/templates-admin/scripts/inputfields.$ext?v=$version");
$config->scripts->append($config->urls->root . "wire/templates-admin/scripts/main.$ext?v=$version");
$config->scripts->append($config->urls->templates . "dist/js/uikit.min.js?v=$version");
$config->scripts->append($config->urls->adminTemplates . "scripts/main.js?v=$version");
	
?><!DOCTYPE html>
<html class="pw" lang="<?php echo $adminTheme->_('en'); /* this intentionally on a separate line */ ?>">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta name="robots" content="noindex, nofollow" />
	<meta name="google" content="notranslate" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title><?php echo $adminTheme->getBrowserTitle(); ?></title>

	<script>
		<?php echo $adminTheme->getHeadJS(); ?>
	</script>	

	<?php 
	foreach($config->styles as $file) {
		echo "\n\t<link type='text/css' href='$file' rel='stylesheet' />"; 
	}
	foreach($config->scripts as $file) {
		echo "\n\t<script type='text/javascript' src='$file'></script>";
	}
	?>
	
	<?php echo $adminTheme->renderExtraMarkup('head'); ?>

</head>
<body class='<?php echo $adminTheme->getBodyClass(); ?>'>

	<?php 
	if(!$adminTheme->isModal) include(__DIR__ . "/_masthead.php");
	echo $adminTheme->renderNotices($notices); 
	?>

	<!-- MAIN CONTENT -->
	<main id='main' class='uk-container uk-container-expand uk-margin uk-margin-large-bottom'>
		<div class='pw-content' id='content'>
			
			<header id='pw-content-head'>
				
				<?php echo $adminTheme->renderBreadcrumbs(); ?>
				
				<div id='pw-content-head-buttons' class='uk-float-right uk-margin-small-top uk-visible@s'>
					<?php echo $adminTheme->renderAddNewButton(); ?>
				</div>
				
				<?php if(!$adminTheme->isModal):?>
				<h1 class='uk-margin-remove-top'><?php echo $adminTheme->getHeadline(); ?></h1>
				<?php endif; ?>
				
			</header>	
			
			<div id='pw-content-body'>
        <div class="uk-margin-top">
          <?php echo $page->get('body'); ?>
        </div>
				<?php
				echo $content;
				echo $adminTheme->renderExtraMarkup('content'); 
				?>
			</div>
		</div>
	</main>

	<?php 
	if(!$adminTheme->isModal) {
		include(__DIR__ . '/_footer.php');
		if($adminTheme->isLoggedIn) include(__DIR__ . '/_offcanvas.php');
	}
	echo $adminTheme->renderExtraMarkup('body');
	?>
	
	<script>ProcessWireAdminTheme.init();</script>

</body>
</html>
