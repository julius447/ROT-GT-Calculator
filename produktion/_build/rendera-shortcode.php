<?php
/**
 * Byggtidsharness (ingen del av leveransen): renderar shortcoden UTAN WordPress så att paketera.mjs kan bevisa att
 * PHP:s utdata är byte-lika med preview-markupen som Node genererar. Stubbar bara det backend.php anropar.
 *   php rendera-shortcode.php '[{"mode":"rot"},{"mode":"gt"}]'   -> JSON-lista med en HTML-sträng per fall
 */
define( 'ABSPATH', __DIR__ . '/' );

function shortcode_atts( $pairs, $atts, $shortcode = '' ) {
	$atts = (array) $atts;
	$out  = array();
	foreach ( $pairs as $name => $default ) {
		$out[ $name ] = array_key_exists( $name, $atts ) ? $atts[ $name ] : $default;
	}
	return $out;
}
/* WordPress: esc_html/esc_attr = _wp_specialchars( $text, ENT_QUOTES ) utan dubbelkodning; för rubriker utan entiteter är det htmlspecialchars. */
function esc_html( $text ) { return htmlspecialchars( (string) $text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8', false ); }
function esc_attr( $text ) { return htmlspecialchars( (string) $text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8', false ); }
$GLOBALS['ampy_shortcodes'] = array();
function add_shortcode( $tag, $fn ) { $GLOBALS['ampy_shortcodes'][ $tag ] = $fn; }

require __DIR__ . '/../dist/backend.php';

$fall = json_decode( $argv[1] ?? '[{"mode":"rot"}]', true );
$ut   = array();
foreach ( $fall as $atts ) {
	$ut[] = call_user_func( $GLOBALS['ampy_shortcodes']['ampy_avdragskollen'], $atts );
}
echo json_encode( $ut, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
