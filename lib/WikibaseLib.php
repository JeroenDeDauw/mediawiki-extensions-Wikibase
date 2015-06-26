<?php

/**
 * Welcome to the inside of Wikibase,              <>
 * the software that powers                   /\        /\
 * Wikidata and other                       <{  }>    <{  }>
 * structured data websites.        <>   /\   \/   /\   \/   /\   <>
 *                                     //  \\    //  \\    //  \\
 * It is Free Software.              <{{    }}><{{    }}><{{    }}>
 *                                /\   \\  //    \\  //    \\  //   /\
 *                              <{  }>   ><        \/        ><   <{  }>
 *                                \/   //  \\              //  \\   \/
 *                            <>     <{{    }}>     +--------------------------+
 *                                /\   \\  //       |                          |
 *                              <{  }>   ><        /|  W  I  K  I  B  A  S  E  |
 *                                \/   //  \\    // |                          |
 * We are                            <{{    }}><{{  +--------------------------+
 * looking for people                  \\  //    \\  //    \\  //
 * like you to join us in           <>   \/   /\   \/   /\   \/   <>
 * developing it further. Find              <{  }>    <{  }>
 * out more at http://wikiba.se               \/        \/
 * and join the open data revolution.              <>
 */

/**
 * Entry point for the WikibaseLib extension.
 *
 * @see README.md
 * @see https://www.mediawiki.org/wiki/Extension:WikibaseLib
 * @licence GNU GPL v2+
 */

if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

// Needs to be 1.20c because version_compare() works in confusing ways.
if ( version_compare( $GLOBALS['wgVersion'], '1.20c', '<' ) ) {
	die( '<b>Error:</b> WikibaseLib requires MediaWiki 1.20 or above.' );
}

if ( defined( 'WBL_VERSION' ) ) {
	// Do not initialize more than once.
	return 1;
}

define( 'WBL_VERSION', '0.5 alpha'
	. ( defined( 'WB_EXPERIMENTAL_FEATURES' ) && WB_EXPERIMENTAL_FEATURES ? '/experimental' : '' ) );

// This is the path to the autoloader generated by composer in case of a composer install.
if ( ( !defined( 'WIKIBASE_DATAMODEL_VERSION' ) || !defined( 'Diff_VERSION' ) || !defined( 'DATAVALUES_VERSION' ) )
	&& file_exists( __DIR__ . '/../vendor/autoload.php' ) ) {
	include_once __DIR__ . '/../vendor/autoload.php';
}

call_user_func( function() {
	global $wgExtensionCredits, $wgJobClasses, $wgHooks, $wgResourceModules, $wgMessagesDirs;

	$wgExtensionCredits['wikibase'][] = array(
		'path' => __DIR__,
		'name' => 'WikibaseLib',
		'version' => WBL_VERSION,
		'author' => array(
			'The Wikidata team', // TODO: link?
		),
		'url' => 'https://www.mediawiki.org/wiki/Extension:WikibaseLib',
		'descriptionmsg' => 'wikibase-lib-desc'
	);

	define( 'SUMMARY_MAX_LENGTH', 250 );

	// i18n
	$wgMessagesDirs['WikibaseLib']           = __DIR__ . '/i18n';

	$wgJobClasses['ChangeNotification'] = 'Wikibase\ChangeNotificationJob';

	// Hooks
	$wgHooks['UnitTestsList'][]							= 'Wikibase\LibHooks::registerPhpUnitTests';
	$wgHooks['ResourceLoaderTestModules'][]				= 'Wikibase\LibHooks::registerQUnitTests';

	/**
	 * Called when generating the extensions credits, use this to change the tables headers.
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ExtensionTypes
	 *
	 * @since 0.1
	 *
	 * @param array &$extensionTypes
	 *
	 * @return boolean
	 */
	$wgHooks['ExtensionTypes'][] = function( array &$extensionTypes ) {
		// @codeCoverageIgnoreStart
		$extensionTypes['wikibase'] = wfMessage( 'version-wikibase' )->text();

		return true;
		// @codeCoverageIgnoreEnd
	};

	// Resource Loader Modules:
	$wgResourceModules = array_merge(
		$wgResourceModules,
		include __DIR__ . '/resources/Resources.php'
	);

	if ( defined( 'WB_EXPERIMENTAL_FEATURES' ) && WB_EXPERIMENTAL_FEATURES ) {
		include_once __DIR__ . '/config/WikibaseLib.experimental.php';
	}
} );
