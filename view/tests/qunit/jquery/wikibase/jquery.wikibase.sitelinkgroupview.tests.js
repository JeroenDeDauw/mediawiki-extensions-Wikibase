/**
 * @licence GNU GPL v2+
 * @author H. Snater < mediawiki@snater.com >
 */
( function( $, wb, QUnit ) {
	'use strict';

/**
 * @param {Object} [options]
 * @return {jQuery}
 */
function createSitelinkgroupview( options ) {
	options = $.extend( {
		siteLinksChanger: 'I am a SiteLinksChanger',
		entityStore: new wb.store.EntityStore()
	}, options );

	var $sitelinkgroupview = $( '<div/>' )
		.addClass( 'test_sitelinkgroupview' )
		.appendTo( $( 'body' ) )
		.sitelinkgroupview( options );

	var sitelinkgroupview = $sitelinkgroupview.data( 'sitelinkgroupview' ),
		sitelinklistview = sitelinkgroupview.$sitelinklistview.data( 'sitelinklistview' );

	sitelinklistview._saveSiteLink = function( siteLink ) {
		if( !( siteLink instanceof wb.datamodel.SiteLink ) ) {
			throw new Error( 'SiteLink object expected' );
		} else {
			return ( new $.Deferred() ).resolve().promise();
		}
	};

	return $sitelinkgroupview;
}

QUnit.module( 'jquery.wikibase.sitelinkgroupview', QUnit.newWbEnvironment( {
	config: {
		wbSiteDetails: {
			aawiki: {
				apiUrl: 'http://aa.wikipedia.org/w/api.php',
				name: 'Qafár af',
				pageUrl: 'http://aa.wikipedia.org/wiki/$1',
				shortName: 'Qafár af',
				languageCode: 'aa',
				id: 'aawiki',
				group: 'group1'
			},
			enwiki: {
				apiUrl: 'http://en.wikipedia.org/w/api.php',
				name: 'English Wikipedia',
				pageUrl: 'http://en.wikipedia.org/wiki/$1',
				shortName: 'English',
				languageCode: 'en',
				id: 'enwiki',
				group: 'group1'
			},
			dewiki: {
				apiUrl: 'http://de.wikipedia.org/w/api.php',
				name: 'Deutsche Wikipedia',
				pageUrl: 'http://de.wikipedia.org/wiki/$1',
				shortName: 'Deutsch',
				languageCode: 'de',
				id: 'dewiki',
				group: 'group2'
			}
		}
	},
	teardown: function() {
		$( '.test_sitelinkgroupview' ).each( function() {
			var $sitelinkgroupview = $( this ),
				sitelinkgroupview = $sitelinkgroupview.data( 'sitelinkgroupview' );

			if( sitelinkgroupview ) {
				sitelinkgroupview.destroy();
			}

			$sitelinkgroupview.remove();
		} );
	}
} ) );

QUnit.test( 'Create and destroy', function( assert ) {
	var siteLink = new wikibase.datamodel.SiteLink( 'enwiki', 'Main Page' ),
		$sitelinkgroupview = createSitelinkgroupview( {
			value: { group: 'group1', siteLinks: [siteLink] }
		} ),
		sitelinkgroupview = $sitelinkgroupview.data( 'sitelinkgroupview' );

	assert.ok(
		sitelinkgroupview !== undefined,
		'Created widget.'
	);

	sitelinkgroupview.destroy();

	assert.ok(
		$sitelinkgroupview.data( 'sitelinkgroupview' ) === undefined,
		'Destroyed widget.'
	);

	assert.throws( function() {
			$sitelinkgroupview = createSitelinkgroupview();
		},
		'Widget does not accept an empty value.'
	);
} );

QUnit.test( 'startEditing() & stopEditing()', 4, function( assert ) {
	var $sitelinkgroupview = createSitelinkgroupview( {
			value: {
				group: 'group1',
				siteLinks: [new wb.datamodel.SiteLink( 'enwiki', 'enwiki-page' )]
			}
		} ),
		sitelinkgroupview = $sitelinkgroupview.data( 'sitelinkgroupview' );

	$sitelinkgroupview
	.on( 'sitelinkgroupviewafterstartediting', function( event ) {
		assert.ok(
			true,
			'Started edit mode.'
		);
	} )
	.on( 'sitelinkgroupviewafterstopediting', function( event, dropValue ) {
		assert.ok(
			true,
			'Stopped edit mode.'
		);
	} );

	/**
	 * @param {Function} func
	 * @param {boolean} expectingEvent
	 * @return {Object} jQuery.Promise
	 */
	function testEditModeChange( func, expectingEvent ) {
		var deferred = $.Deferred();

		if( !expectingEvent ) {
			func();
			return deferred.resolve().promise();
		}

		$sitelinkgroupview
		.one( 'sitelinkgroupviewafterstartediting.sitelinkgroupviewtest', function( event ) {
			$sitelinkgroupview.off( '.sitelinkgroupviewtest' );
			deferred.resolve();
		} )
		.one(
			'sitelinkgroupviewafterstopediting.sitelinkgroupviewtest',
			function( event, dropValue ) {
				$sitelinkgroupview.off( '.sitelinkgroupviewtest' );
				deferred.resolve();
			}
		);

		func();

		return deferred.promise();
	}

	var $queue = $( {} );

	/**
	 * @param {jQuery} $queue
	 * @param {Function} func
	 * @param {boolean} [expectingEvent]
	 */
	function addToQueue( $queue, func, expectingEvent ) {
		if( expectingEvent === undefined ) {
			expectingEvent = true;
		}
		$queue.queue( 'tests', function( next ) {
			QUnit.stop();
			testEditModeChange( func, expectingEvent ).always( function() {
				QUnit.start();
				next();
			} );
		} );
	}

	addToQueue( $queue, function() {
		sitelinkgroupview.startEditing();
	} );

	addToQueue( $queue, function() {
		sitelinkgroupview.startEditing();
	}, false );

	addToQueue( $queue, function() {
		sitelinkgroupview.stopEditing( true );
	} );

	addToQueue( $queue, function() {
		sitelinkgroupview.stopEditing( true );
	}, false );

	addToQueue( $queue, function() {
		sitelinkgroupview.stopEditing();
	}, false );

	addToQueue( $queue, function() {
		sitelinkgroupview.startEditing();
	} );

	addToQueue( $queue, function() {
		// Mock adding a new item:
		var sitelinklistview = sitelinkgroupview.$sitelinklistview.data( 'sitelinklistview' ),
			listview = sitelinklistview.$listview.data( 'listview' ),
			lia = listview.listItemAdapter(),
			$sitelinkview = listview.addItem(
				new wb.datamodel.SiteLink( 'aawiki', 'aawiki-page' )
			);
		lia.liInstance( $sitelinkview ).startEditing();
		sitelinkgroupview.stopEditing();
	} );

	$queue.dequeue( 'tests' );
} );

QUnit.test( 'setError()', 1, function( assert ) {
	var $sitelinkgroupview = createSitelinkgroupview( {
			value: { group: 'group1', siteLinks: [] }
		} ),
		sitelinkgroupview = $sitelinkgroupview.data( 'sitelinkgroupview' );

	$sitelinkgroupview
	.addClass( 'wb-error' )
	.on( 'sitelinkgroupviewtoggleerror', function( event, error ) {
		assert.ok(
			true,
			'Triggered toggleerror event.'
		);
	} );

	sitelinkgroupview.setError();
} );

QUnit.test( 'value()', function( assert ) {
	var siteLink = new wikibase.datamodel.SiteLink( 'enwiki', 'Main Page' ),
		value = { group: 'group1', siteLinks: [siteLink] },
		$sitelinkgroupview = createSitelinkgroupview( {
			value: value
		} ),
		sitelinkgroupview = $sitelinkgroupview.data( 'sitelinkgroupview' );

	assert.deepEqual(
		sitelinkgroupview.value(),
		value,
		'Retrieved initial value.'
	);

	var siteLinks = [
		new wikibase.datamodel.SiteLink( 'dewiki', '1234' ),
		new wikibase.datamodel.SiteLink( 'enwiki', '5678' )
	];

	value = { group: 'group2', siteLinks: siteLinks };

	sitelinkgroupview.value( value );

	assert.deepEqual(
		sitelinkgroupview.value(),
		value,
		'Set and retrieved new value.'
	);
} );

}( jQuery, wikibase, QUnit ) );
