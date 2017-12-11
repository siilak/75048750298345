<?php

/**
 * Default Theme MarkupSocialShareButtons
 *
 * This file is the default used by the module after a clean install.
 *
 * A theme can be choosen in the module config screen.
 *
 * Alternatively from the API you can set a theme by using method "theme" options
 * i.e. $options = array("theme" => "themename");
 *
 * To create your own create a file with the content of this file somewhere in your site/templates/ folder
 * This would be a subfolder, and in there a file "theme.php".
 *
 * Now you can enter the path relative from "site/templates" in the module config
 * $options = array("theme" => "templates/socialbuttontheme/mytheme");
 * $modules->MarkupSocialShareButtons->render($options);
 *
 * For the PNG icons themes I created using a set of PNG icons for free here
 * http://customizr.net/icons/?set=social-media
 *
 */

// {themeUrl} or $themeUrl is available and set by the module
// you can also get a custom path to and use API here with wire("config") or $this->config
//
// $themeUrl = wire("config")->urls->templates . "imgs/icons/";

$socialIcons = array(
    'email_icon'        => '<i uk-icon="icon: mail"/></i>',
    'googleplus_icon'   => '<i uk-icon="icon: google"/></i>',
    'facebook_icon'     => '<i uk-icon="icon: facebook"/></i>',
    'twitter_icon'      => '<i uk-icon="icon: twitter"/></i>',
    'linkedin_icon'     => '<i uk-icon="icon: linkedin"/></i>',
    'reddit_icon'       => '<i uk-icon="icon: reddit"/></i>',
    'tumblr_icon'       => '<i uk-icon="icon: tumblr"/></i>',
    'pinterest_icon'    => '<i uk-icon="icon: printerest"/></i>',
    );
