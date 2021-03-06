<?php

namespace Wikibase\Client\Tests\DataAccess\Scribunto;

use Parser;
use ParserOptions;
use Scribunto;
use Title;
use Wikibase\Client\DataAccess\Scribunto\Scribunto_LuaWikibaseEntityLibrary;
use Wikibase\Client\WikibaseClient;

/**
 * @covers Wikibase\Client\DataAccess\Scribunto\Scribunto_LuaWikibaseEntityLibrary
 *
 * @group WikibaseScribunto
 * @group WikibaseIntegration
 * @group WikibaseClient
 * @group Wikibase
 *
 * @licence GNU GPL v2+
 * @author Marius Hoch < hoo@online.de >
 */
class Scribunto_LuaWikibaseEntityLibraryTest extends Scribunto_LuaWikibaseLibraryTestCase {

	protected static $moduleName = 'LuaWikibaseEntityLibraryTests';

	protected function getTestModules() {
		return parent::getTestModules() + array(
			'LuaWikibaseEntityLibraryTests' => __DIR__ . '/LuaWikibaseEntityLibraryTests.lua',
		);
	}

	public function testConstructor() {
		$engine = Scribunto::newDefaultEngine( array() );
		$luaWikibaseLibrary = new Scribunto_LuaWikibaseEntityLibrary( $engine );
		$this->assertInstanceOf(
			'Wikibase\Client\DataAccess\Scribunto\Scribunto_LuaWikibaseEntityLibrary',
			$luaWikibaseLibrary
		);
	}

	public function testRegister() {
		$luaWikibaseLibrary = $this->newScribuntoLuaWikibaseLibrary();
		$package = $luaWikibaseLibrary->register();

		$this->assertInternalType( 'array', $package );
		$this->assertArrayHasKey( 'create', $package );
		$this->assertInstanceOf(
			'Scribunto_LuaStandaloneInterpreterFunction',
			$package['create']
		);
	}

	public function testGetGlobalSiteId() {
		$luaWikibaseLibrary = $this->newScribuntoLuaWikibaseLibrary();
		$expected = array(
			WikibaseClient::getDefaultInstance()->getSettings()->getSetting( 'siteGlobalID' )
		);
		$this->assertSame( $expected, $luaWikibaseLibrary->getGlobalSiteId() );
	}

	public function testFormatPropertyValues() {
		$luaWikibaseLibrary = $this->newScribuntoLuaWikibaseLibrary();
		$this->assertSame(
			array( '' ),
			$luaWikibaseLibrary->formatPropertyValues( 'Q1', 'P65536', array() )
		);
	}

	public function testFormatPropertyValues_noPropertyId() {
		$luaWikibaseLibrary = $this->newScribuntoLuaWikibaseLibrary();
		$this->assertSame(
			array( '' ),
			$luaWikibaseLibrary->formatPropertyValues( 'Q1', 'father', array() )
		);
	}

	public function testFormatPropertyValues_usage() {
		$luaWikibaseLibrary = $this->newScribuntoLuaWikibaseLibrary();

		$this->assertSame(
			array( 'Q885588' ),
			$luaWikibaseLibrary->formatPropertyValues( 'Q32488', 'P456', null )
		);

		$usages = $luaWikibaseLibrary->getUsageAccumulator()->getUsages();
		$this->assertArrayHasKey( 'Q885588#L.de', $usages );
		$this->assertArrayHasKey( 'Q885588#T', $usages );
	}

	private function newScribuntoLuaWikibaseLibrary() {
		$title =  Title::newFromText( 'Whatever' );
		$parser = new Parser();
		$parser->startExternalParse( $title, new ParserOptions(), Parser::OT_HTML );

		$engine = Scribunto::newDefaultEngine( array(
			'parser' => $parser,
			'title' => $title
		) );
		$engine->load();

		return new Scribunto_LuaWikibaseEntityLibrary( $engine );
	}

}
