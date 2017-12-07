<?php namespace ProcessWire;

if(!defined("PROCESSWIRE")) die();

/** @var AdminUikit $adminTheme */
/** @var AdminThemeUikitMarkup $markup */
/** @var User $user */
/** @var array $extras */
/** @var Paths $urls */
/** @var Config $config */

?>
<header id='pw-masthead-mobile' class='uk-hidden@m uk-background-muted'>
	<div class='uk-container uk-container-expand'>
		<div class='uk-padding-small uk-text-center'>
			<a href='#' onclick='$("#offcanvas-toggle").click(); return false;'>
                <img class='uk-image' src='<?php echo $config->urls->templates ."/design/"; ?>logo.svg'>
			</a>
		</div>
	</div>
</header>
<header id='pw-masthead' class='uk-background-muted uk-visible@m'>

	<div class='uk-container uk-container-expand'>
        <nav class="uk-navbar-container uk-margin-top uk-margin-bottom uk-navbar-transparent" uk-navbar>
			<div class="uk-navbar-left">
				<?php if($adminTheme->isLoggedIn): ?>
				<ul class='uk-navbar-nav'>
          <li class="uk-navbar-item">
            <a class="uk-logo" href="/">
              <img class='uk-image' src='<?php echo $config->urls->templates ."/design/"; ?>logo.svg'>
            </a>
          </li>
					<?php echo $adminTheme->renderPrimaryNavItems(); ?>
				</ul>	
				<?php endif; ?>
			</div>
			<?php if($adminTheme->isLoggedIn): ?>
			<div class="uk-navbar-right uk-visible@m">
				<ul class='uk-navbar-nav uk-margin-right'>
					<li>
						<a id="tools-toggle" class="pw-dropdown-toggle" href="<?php echo $urls->admin; ?>profile/">
							<?php echo $adminTheme->renderNavIcon('user') . $user->name; ?>
						</a>
						<ul class="pw-dropdown-menu uk-dropdown" data-my="left top" data-at="left bottom" style="display: none;">
							<?php if($config->debug): ?>
								<li>
								<a href='#' onclick="$('#debug_toggle').click(); return false;">
									<?php echo $adminTheme->renderNavIcon('bug') . __('Debug'); ?>
								</a>
							</li>
							<?php endif; ?>
							<?php echo $adminTheme->renderUserNavItems(); ?>
						</ul>
					</li>
          <li>
            <a href="#"><i class="fa fa-globe"></i></a>
			  <?php
			  // remember what language is set to
			  $savedLanguage = $user->language;
			  echo "<div uk-dropdown='mode: click'>";
			  foreach($languages as $language) {

				  // if user is already viewing the page in this language, skip it
				  if($language->id == $savedLanguage->id) continue;

				  // if this page isn't viewable (active) for the language, skip it
				  if(!$page->viewable($language)) continue;

				  // set the user's language, so that the $page->url and any other
				  // fields we access from it will be reflective of the $language
				  $user->language = $language;

				  // output a link to this page in the other language

				  echo "<div><a href='$page->url'>$language->title</a></div>";
			  }
			  // restore the original language setting
			  $user->language = $savedLanguage;
			  echo "</div>";
			  ?>
          </li>
				</ul>	
			
				<?php include(__DIR__ . '/_search-form.php'); ?>
				
			</div>
			<?php endif; // loggedin ?>
		</nav>
	</div>
	<?php echo $adminTheme->renderExtraMarkup('masthead'); ?>
</header>

