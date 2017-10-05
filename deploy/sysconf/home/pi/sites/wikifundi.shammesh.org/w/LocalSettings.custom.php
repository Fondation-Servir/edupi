<?php
# Debug
/*
error_reporting( -1 );
ini_set( 'display_errors', 1 );
$wgShowExceptionDetails=true;
$wgDebugToolbar=true;
$wgShowDebug=true;
$wgDevelopmentWarnings=true;
*/
# General
$wgLanguageCode     = "fr";
$wgSitename         = "WikiFundi - Fondation Orange";

# Database settings
$wgDBtype        = "sqlite";
$wgDBserver      = "";
$wgDBname        = "mw_fr_africapack";
$wgDBuser        = "";
$wgDBpassword    = "";
$wgSQLiteDataDir = "/home/pi/sites/wikifundi.shammesh.org/";

# Entropy
$wgSecretKey = "d5eb60c72d9fa0946adcfb1cb55cd66c654a093df0a63946d32d645f38a5eb19";

# Wikipedia namespace
define("NS_FOO", 3000);
define("NS_FOO_TALK", 3001);
$wgExtraNamespaces[NS_FOO] = "Wikipédia";
$wgExtraNamespaces[NS_FOO_TALK] = "Wikipédia_talk"; // Note underscores in the namespace name.

# Not limit for attempting to login
$wgPasswordAttemptThrottle = false;

# Allow to put __NOINDEX__ on all pages
$wgExemptFromUserRobotsControl = array();

# Allow JS for users
$wgUseSiteJs = true;
$wgUserSiteJs = true;
$wgAllowUserJs = true;

# Allow heavy template
$wgMaxArticleSize = 10000;
$wgExpensiveParserFunctionLimit = 10000;
$wgAllowSlowParserFunctions = true;

# Necessary if you use nginx as reverse proxy
$wgUsePrivateIPs = true;
$wgSquidServersNoPurge = array('127.0.0.1');

# Avoid blocked users to login
$wgBlockDisablesLogin = true;

# The following permissions were set based on your choice in the installer
$wgGroupPermissions['*']['createaccount'] = false;
$wgGroupPermissions['*']['edit'] = false;

# Upload file allowed extension
$wgFileExtensions = array_merge( $wgFileExtensions, array( 'zip', 'ogg' ) );

# Hieroglyphs
require_once "$IP/extensions/wikihiero/wikihiero.php";

# Maths
require_once "$IP/extensions/Math/Math.php";

# Echo extension
require_once("$IP/extensions/Echo/Echo.php");

# Mobile frontend
require_once("$IP/extensions/MobileFrontend/MobileFrontend.php");
$wgMFAutodetectMobileView = true;

# Thanks
require_once ( "$IP/extensions/Thanks/Thanks.php" );

# Timeline
putenv("GDFONTPATH=/usr/share/fonts/truetype/freefont");
require_once ( "$IP/extensions/TimeLine/Timeline.php" );

# Visual Editor
require_once("$IP/extensions/VisualEditor/VisualEditor.php");
$wgDefaultUserOptions['visualeditor-enable'] = 1;
$wgVisualEditorNamespaces[] = NS_PROJECT;
$wgVirtualRestConfig['modules']['parsoid'] = array(
                                                   'url' => 'http://wikifundi.shammesh.org:8002',
                                                   'domain' => 'wikifundi.shammesh.org',
                                                   'prefix' => 'fr_africapack',
                                                   'forwardCookies' => true
                                                   );
$wgScribuntoEngineConf['luastandalone']['luaPath'] = "/usr/bin/lua5.1";
?>