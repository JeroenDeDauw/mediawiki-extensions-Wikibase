<?php

namespace Wikibase\Test;

use LogicException;
use PHPUnit_Framework_TestCase;
use Title;
use Wikibase\DataModel\Entity\EntityId;
use Wikibase\DataModel\Entity\Item;
use Wikibase\DataModel\Entity\ItemId;
use Wikibase\DataModel\Entity\Property;
use Wikibase\DataModel\Entity\PropertyId;
use Wikibase\Lib\EntityIdLinkFormatter;

/**
 * @covers Wikibase\Lib\EntityIdLinkFormatter
 *
 * @group Wikibase
 * @group WikibaseLib
 * @group EntityIdFormatterTest
 *
 * @licence GNU GPL v2+
 * @author Daniel Kinzler
 */
class EntityIdLinkFormatterTest extends PHPUnit_Framework_TestCase {

	public function formatEntityIdProvider() {
		return array(
			'ItemId' => array(
				new ItemId( 'Q23' ),
				'[[ITEM-TEST--Q23|Q23]]'
			),
			'PropertyId' => array(
				new PropertyId( 'P23' ),
				'[[PROPERTY-TEST--P23|P23]]'
			),
		);
	}

	/**
	 * @dataProvider formatEntityIdProvider
	 */
	public function testFormatEntityId( EntityId $id, $expected ) {
		$formatter = $this->newEntityIdLinkFormatter();

		$actual = $formatter->formatEntityId( $id );
		$this->assertEquals( $expected, $actual );
	}

	public function getTitleForId( EntityId $entityId ) {
		switch ( $entityId->getEntityType() ) {
			case Item::ENTITY_TYPE:
				return Title::makeTitle( NS_MAIN, 'ITEM-TEST--' . $entityId->getSerialization() );
			case Property::ENTITY_TYPE:
				return Title::makeTitle( NS_MAIN, 'PROPERTY-TEST--' . $entityId->getSerialization() );
			default:
				throw new LogicException( "oops!" );
		}
	}

	private function newEntityIdLinkFormatter() {
		$titleLookup = $this->getMock( 'Wikibase\Lib\Store\EntityTitleLookup' );
		$titleLookup->expects( $this->any() )->method( 'getTitleForId' )
			->will( $this->returnCallback( array( $this, 'getTitleForId' ) ) );

		$formatter = new EntityIdLinkFormatter( $titleLookup );
		return $formatter;
	}

}
