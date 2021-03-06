<?php

namespace Wikimedia\Purtle\Tests;

use Wikimedia\Purtle\N3Quoter;

/**
 * @covers Wikimedia\Purtle\N3Quoter
 *
 * @group Purtle
 *
 * @licence GNU GPL v2+
 * @author Daniel Kinzler
 */
class N3QuoterTest extends \PHPUnit_Framework_TestCase {

	public function provideEscapeIRI() {
		return array(
			array( 'http://acme.com/test.php?x=y&foo=bar#part', 'http://acme.com/test.php?x=y&foo=bar#part' ),
			array( 'http://acme.com/"evil stuff"', 'http://acme.com/%22evil%20stuff%22' ),
			array( 'http://acme.com/<wacky stuff>', 'http://acme.com/%3Cwacky%20stuff%3E' ),
			array( 'http://acme.com\\back\\slash', 'http://acme.com%5Cback%5Cslash' ),
			array( 'http://acme.com/~`!@#$%^&*()-_=+[]{}|:;\'",.<>/?', 'http://acme.com/~%60!@#$%%5E&*()-_=+[]%7B%7D%7C:;\'%22,.%3C%3E/?' ),
		);
	}

	/**
	 * @dataProvider provideEscapeIRI
	 */
	public function testEscapeIRI( $iri, $expected ) {
		$quoter = new N3Quoter();

		$this->assertEquals( $expected, $quoter->escapeIRI( $iri ) );
	}

	public function provideEscapeLiteral() {
		return array(
			array( "Hello World", 'Hello World' ),
			array( "Hello\nWorld", 'Hello\nWorld' ),
			array( "Hello\tWorld", 'Hello\tWorld' ),
			array( "Hällo Wörld", 'Hällo Wörld', false ),
			array( "Hällo Wörld", 'H\u00E4llo W\u00F6rld', true ),
		);
	}

	/**
	 * @dataProvider provideEscapeLiteral
	 */
	public function testEscapeLiteral( $literal, $expected, $escapeUnicode = false ) {
		$quoter = new N3Quoter();
		$quoter->setEscapeUnicode( $escapeUnicode );

		$this->assertEquals( $expected, $quoter->escapeLiteral( $literal ) );
	}

}
