<?php

namespace Wikibase\Test;

use Diff\Comparer\ComparableComparer;
use Diff\Differ\OrderedListDiffer;
use Diff\DiffOp\Diff\Diff;
use Diff\DiffOp\DiffOpAdd;
use Diff\DiffOp\DiffOpChange;
use Diff\DiffOp\DiffOpRemove;
use Wikibase\DataModel\Reference;
use Wikibase\DataModel\ReferenceList;
use Wikibase\DataModel\Snak\PropertyNoValueSnak;
use Wikibase\DataModel\Snak\SnakList;
use Wikibase\DataModel\Statement\Statement;
use Wikibase\Repo\Diff\ClaimDiffer;
use Wikibase\Repo\Diff\ClaimDifference;

/**
 * @covers Wikibase\Repo\Diff\ClaimDiffer
 *
 * @group Wikibase
 * @group WikibaseRepo
 * @group WikibaseClaim
 *
 * @licence GNU GPL v2+
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 */
class ClaimDifferTest extends \MediaWikiTestCase {

	public function diffClaimsProvider() {
		$argLists = array();

		$noValueForP42 = new Statement( new PropertyNoValueSnak( 42 ) );
		$noValueForP43 = new Statement( new PropertyNoValueSnak( 43 ) );

		$argLists[] = array(
			$noValueForP42,
			$noValueForP42,
			new ClaimDifference()
		);

		$argLists[] = array(
			$noValueForP42,
			$noValueForP43,
			new ClaimDifference( new DiffOpChange( new PropertyNoValueSnak( 42 ), new PropertyNoValueSnak( 43 ) ) )
		);

		$qualifiers = new SnakList( array( new PropertyNoValueSnak( 1 ) ) );
		$withQualifiers = clone $noValueForP42;
		$withQualifiers->setQualifiers( $qualifiers );

		$argLists[] = array(
			$noValueForP42,
			$withQualifiers,
			new ClaimDifference(
				null,
				new Diff( array(
					new DiffOpAdd( new PropertyNoValueSnak( 1 ) )
				), false )
			)
		);

		$references = new ReferenceList( array( new Reference( array( new PropertyNoValueSnak( 2 ) ) ) ) );
		$withReferences = clone $noValueForP42;
		$withReferences->setReferences( $references );

		$argLists[] = array(
			$noValueForP42,
			$withReferences,
			new ClaimDifference(
				null,
				null,
				new Diff( array(
					new DiffOpAdd( new Reference( array( new PropertyNoValueSnak( 2 ) ) ) )
				), false )
			)
		);

		$argLists[] = array(
			$withQualifiers,
			$withReferences,
			new ClaimDifference(
				null,
				new Diff( array(
					new DiffOpRemove( new PropertyNoValueSnak( 1 ) )
				), false ),
				new Diff( array(
					new DiffOpAdd( new Reference( array( new PropertyNoValueSnak( 2 ) ) ) )
				), false )
			)
		);

		$noValueForP42Preferred = clone $noValueForP42;
		$noValueForP42Preferred->setRank( Statement::RANK_PREFERRED );

		$argLists[] = array(
			$noValueForP42,
			$noValueForP42Preferred,
			new ClaimDifference(
				null,
				null,
				null,
				new DiffOpChange( Statement::RANK_NORMAL, Statement::RANK_PREFERRED )
			)
		);

		return $argLists;
	}

	/**
	 * @dataProvider diffClaimsProvider
	 */
	public function testDiffClaims( Statement $oldStatement, Statement $newStatement, ClaimDifference $expected ) {
		$differ = new ClaimDiffer( new OrderedListDiffer( new ComparableComparer() ) );
		$actual = $differ->diffClaims( $oldStatement, $newStatement );

		$this->assertTrue( $expected->equals( $actual ) );
		// Additional fail-safe checks to guard against an ArrayObject bug in PHP 5.3, that returned
		// true when using == to compare two ArrayObject instances with differing content.
		$this->assertEquals(
			$expected->getQualifierChanges()->getArrayCopy(),
			$actual->getQualifierChanges()->getArrayCopy()
		);
		$this->assertEquals(
			$expected->getReferenceChanges()->getArrayCopy(),
			$actual->getReferenceChanges()->getArrayCopy()
		);
	}

}
