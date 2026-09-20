<?php
/**
 * AVDRAGSKOLLEN (ROT / grön teknik), FluentSnippets snippet 2/3, typ "Functions (PHP)". Kör: Frontend & Backend. Paket 1.0.0.
 * ---------------------------------------------------------------------------------------------------------------------
 * Install all THREE snippets in FluentSnippets, then drop the shortcode into a Bricks Shortcode element:
 *   1. CSS -> dist/styles.css (Frontend, wp_head)   2. PHP -> this file (Frontend & Backend)   3. JS -> dist/engine.js (Frontend, wp_footer)
 * Registers [ampy_avdragskollen mode="rot|gt" heading="..." heading_level="2|3"] and RETURNS the markup (never echo).
 *   mode           rot (default) or gt. One mode per instance; the ROT page uses mode="rot", the grön teknik page mode="gt".
 *   heading        default "Räkna ut ditt ROT-avdrag" / "Räkna ut ditt grön teknik-avdrag"; heading="" omits the heading.
 *   heading_level  2 (default) or 3 (sidebar placement). Same look either way (.ampy-h2 sets everything).
 * Several instances on one page are fine: every id, for, aria-* and radio name is prefixed per instance (ak1-, ak2-, ...).
 * No data injection (nothing is dynamic), no REST route (nothing is submitted), no webhook, no tracking, no nonce.
 * Auto-built by produktion/_build/paketera.mjs from kalkylator/v1/index.html (section verbatim, sha256 f1b86b898a7c).
 * Rebuild, never hand-edit.
 * ---------------------------------------------------------------------------------------------------------------------
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( ! function_exists( 'ampy_avdragskollen_markup' ) ) {
	/**
	 * kalkylator/v1/index.html: the <section> byte for byte. Two placeholders: {{MODE}} (the section's data-mode) and
	 * {{NAMN}} (the eyebrow's <span class="rk__ihop">ROT-avdrag</span>). Nowdoc: nothing inside is interpreted by PHP.
	 */
	function ampy_avdragskollen_markup() {
		return <<<'AMPY_AK_MARKUP'
  <section class="ampy-card rk" id="avdragskollen" aria-labelledby="rk-rubrik" data-mode="{{MODE}}">

    <form class="rk__fragor" id="rk-form" novalidate autocomplete="off">
      <fieldset class="rk__fraga rk__fraga--ager">
        <legend class="rk__etikett">Äger du din bostad?</legend>
        <p class="rk__under" id="rk-under-1">Villa, radhus eller lägenhet. Helt eller delvis.</p>
        <div class="ampy-segment rk__segment" data-q="ager">
          <label><input type="radio" name="ager" value="ja" checked aria-describedby="rk-under-1"><span>Ja</span></label>
          <label><input type="radio" name="ager" value="nej" aria-describedby="rk-under-1"><span>Nej</span></label>
        </div>
      </fieldset>

      <fieldset class="rk__fraga rk__fraga--aldre">
        <legend class="rk__etikett">Är bostaden äldre än fem år?</legend>
        <div class="ampy-segment rk__segment" data-q="aldre">
          <label><input type="radio" name="aldre" value="ja" checked><span>Ja</span></label>
          <label><input type="radio" name="aldre" value="nej"><span>Nej</span></label>
        </div>
      </fieldset>

      <!-- Åldern styr både 18-årsgränsen (67 kap. 11 §) och skatten: den som fyllt 66 vid årets ingång har förhöjt
           grundavdrag och ett annat jobbskatteavdrag (63 kap. 3 a §, 67 kap. 8 §). Frågas därför, gissas inte ur inkomsttypen. -->
      <fieldset class="rk__fraga rk__fraga--alder">
        <legend class="rk__etikett">Hur gammal är du?</legend>
        <p class="rk__under" id="rk-under-alder">Fyllde du 66 i år, välj 18 till 65.</p>
        <div class="ampy-segment rk__segment rk__segment--tre" data-q="alder">
          <label><input type="radio" name="alder-1" value="u18" aria-describedby="rk-under-alder"><span>Under 18</span></label>
          <label><input type="radio" name="alder-1" value="18-65" checked aria-describedby="rk-under-alder"><span>18 till 65</span></label>
          <label><input type="radio" name="alder-1" value="66+" aria-describedby="rk-under-alder"><span>Över 65</span></label>
        </div>
      </fieldset>

      <!-- Personerna i hushållet. Person 1 är den som svarar; fler personer läggs till ur mallen nedan och antas
           bo i bostaden och uppfylla frågorna ovan (ägarbeslut 2026-09-14). -->
      <div class="rk__personer" id="rk-personer" data-antal="1">
        <div class="rk__person" data-person="1">
          <div class="rk__personhuvud">
            <p class="ampy-eyebrow rk__personetikett" id="rk-person-etikett-1">Person 1</p>
          </div>
          <fieldset class="rk__fraga">
            <legend class="rk__etikett" id="rk-inkomst-etikett-1">Din inkomst förra året</legend>
            <div class="rk__inkomst">
              <div class="ampy-segment rk__segment" data-q="typ">
                <label><input type="radio" name="typ-1" value="lon" checked><span>Lön</span></label>
                <label><input type="radio" name="typ-1" value="pension"><span>Pension</span></label>
                <label><input type="radio" name="typ-1" value="bada"><span>Båda</span></label>
              </div>
              <div class="rk__belopp">
                <input class="ampy-input ampy-input--tabular rk__input" id="rk-inkomst-1" data-falt="inkomst" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" placeholder="300 000" aria-labelledby="rk-inkomst-etikett-1" aria-describedby="rk-enhet-1">
                <span class="rk__enhet" id="rk-enhet-1">kr</span>
              </div>
            </div>
          </fieldset>
          <!-- "Båda": lön i fältet ovanför, pensionen här (beskattas olika: pensionsavgift och jobbskatteavdrag bara på lön) -->
          <div class="rk__fraga rk__rad rk__fraga--pension">
            <label class="rk__etikett" for="rk-pension-1">Varav pension</label>
            <div class="rk__belopp rk__belopp--kort">
              <input class="ampy-input ampy-input--tabular rk__input" id="rk-pension-1" data-falt="pension" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" placeholder="0" aria-describedby="rk-enhet-pension-1">
              <span class="rk__enhet" id="rk-enhet-pension-1">kr</span>
            </div>
          </div>
          <div class="rk__fraga rk__rad rk__fraga--ranta">
            <label class="rk__etikett" for="rk-ranta-1">Låneräntor förra året</label>
            <div class="rk__belopp rk__belopp--kort">
              <input class="ampy-input ampy-input--tabular rk__input" id="rk-ranta-1" data-falt="ranta" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" placeholder="0" aria-describedby="rk-enhet-ranta-1">
              <span class="rk__enhet" id="rk-enhet-ranta-1">kr</span>
            </div>
          </div>
          <div class="rk__fraga rk__rad rk__fraga--anvant">
            <label class="rk__etikett" for="rk-anvant-1">ROT och RUT du redan använt i år</label>
            <div class="rk__belopp rk__belopp--kort">
              <input class="ampy-input ampy-input--tabular rk__input" id="rk-anvant-1" data-falt="anvant" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" placeholder="0" aria-describedby="rk-enhet-anvant-1 rk-under-anvant-1">
              <span class="rk__enhet" id="rk-enhet-anvant-1">kr</span>
            </div>
            <p class="rk__under rk__under--rad" id="rk-under-anvant-1">Själva avdraget, inte hela fakturan.</p>
          </div>
          <div class="rk__fraga rk__rad rk__fraga--gtanvant">
            <label class="rk__etikett" for="rk-gtanvant-1">Grön teknik du redan använt i år</label>
            <div class="rk__belopp rk__belopp--kort">
              <input class="ampy-input ampy-input--tabular rk__input" id="rk-gtanvant-1" data-falt="gtanvant" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" placeholder="0" aria-describedby="rk-enhet-gtanvant-1 rk-under-gtanvant-1">
              <span class="rk__enhet" id="rk-enhet-gtanvant-1">kr</span>
            </div>
            <p class="rk__under rk__under--rad" id="rk-under-gtanvant-1">Själva avdraget, inte hela fakturan.</p>
          </div>
        </div>
      </div>

      <div class="rk__lagg">
        <button type="button" class="ampy-link rk__lank" id="rk-lagg">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M8 2.5v11M2.5 8h11" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
          Lägg till en person
        </button>
        <p class="rk__under rk__under--lagg">Bara för den som också äger bostaden.</p>
      </div>

      <template id="rk-personmall">
        <div class="rk__person">
          <div class="rk__personhuvud">
            <p class="ampy-eyebrow rk__personetikett" id="rk-person-etikett-N">Person 2</p>
            <button type="button" class="ampy-link rk__lank rk__tabort">Ta bort</button>
          </div>
          <fieldset class="rk__fraga">
            <legend class="rk__etikett" id="rk-inkomst-etikett-N">Inkomst förra året</legend>
            <div class="rk__inkomst">
              <div class="ampy-segment rk__segment" data-q="typ">
                <label><input type="radio" name="typ-N" value="lon" checked><span>Lön</span></label>
                <label><input type="radio" name="typ-N" value="pension"><span>Pension</span></label>
                <label><input type="radio" name="typ-N" value="bada"><span>Båda</span></label>
              </div>
              <div class="rk__belopp">
                <input class="ampy-input ampy-input--tabular rk__input" id="rk-inkomst-N" data-falt="inkomst" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" placeholder="300 000" aria-labelledby="rk-person-etikett-N rk-inkomst-etikett-N" aria-describedby="rk-enhet-N">
                <span class="rk__enhet" id="rk-enhet-N">kr</span>
              </div>
            </div>
          </fieldset>
          <!-- "Båda": lön i fältet ovanför, pensionen här (beskattas olika: pensionsavgift och jobbskatteavdrag bara på lön) -->
          <div class="rk__fraga rk__rad rk__fraga--pension">
            <label class="rk__etikett" for="rk-pension-N">Varav pension</label>
            <div class="rk__belopp rk__belopp--kort">
              <input class="ampy-input ampy-input--tabular rk__input" id="rk-pension-N" data-falt="pension" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" placeholder="0" aria-describedby="rk-enhet-pension-N">
              <span class="rk__enhet" id="rk-enhet-pension-N">kr</span>
            </div>
          </div>
          <!-- div + radiogroup i stället för fieldset: fieldset kan inte vara flex-rad i Chrome (legend hamnar utanför) -->
          <div class="rk__fraga rk__rad rk__fraga--alder" role="radiogroup" aria-labelledby="rk-alder-etikett-N">
            <span class="rk__etikett" id="rk-alder-etikett-N">Ålder</span>
            <div class="ampy-segment rk__segment" data-q="alder">
              <label><input type="radio" name="alder-N" value="18-65" checked><span>18 till 65</span></label>
              <label><input type="radio" name="alder-N" value="66+"><span>Över 65</span></label>
            </div>
          </div>
          <div class="rk__fraga rk__rad rk__fraga--ranta">
            <label class="rk__etikett" for="rk-ranta-N">Låneräntor förra året</label>
            <div class="rk__belopp rk__belopp--kort">
              <input class="ampy-input ampy-input--tabular rk__input" id="rk-ranta-N" data-falt="ranta" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" placeholder="0" aria-describedby="rk-enhet-ranta-N">
              <span class="rk__enhet" id="rk-enhet-ranta-N">kr</span>
            </div>
          </div>
          <div class="rk__fraga rk__rad rk__fraga--anvant">
            <label class="rk__etikett" for="rk-anvant-N">ROT och RUT använt i år</label>
            <div class="rk__belopp rk__belopp--kort">
              <input class="ampy-input ampy-input--tabular rk__input" id="rk-anvant-N" data-falt="anvant" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" placeholder="0" aria-describedby="rk-enhet-anvant-N rk-under-anvant-N">
              <span class="rk__enhet" id="rk-enhet-anvant-N">kr</span>
            </div>
            <p class="rk__under rk__under--rad" id="rk-under-anvant-N">Själva avdraget, inte hela fakturan.</p>
          </div>
          <div class="rk__fraga rk__rad rk__fraga--gtanvant">
            <label class="rk__etikett" for="rk-gtanvant-N">Grön teknik använt i år</label>
            <div class="rk__belopp rk__belopp--kort">
              <input class="ampy-input ampy-input--tabular rk__input" id="rk-gtanvant-N" data-falt="gtanvant" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done" placeholder="0" aria-describedby="rk-enhet-gtanvant-N rk-under-gtanvant-N">
              <span class="rk__enhet" id="rk-enhet-gtanvant-N">kr</span>
            </div>
            <p class="rk__under rk__under--rad" id="rk-under-gtanvant-N">Själva avdraget, inte hela fakturan.</p>
          </div>
        </div>
      </template>
    </form>

    <div class="rk__panel">
      <div class="rk__resultat" id="rk-resultat" data-status="tak">
        <div class="rk__huvud">
          <p class="ampy-eyebrow rk__eyebrow" id="rk-eyebrow">Ditt tillgängliga {{NAMN}}</p>

          <div class="rk__talrad" id="rk-talrad" aria-live="polite" aria-atomic="true">
            <span class="rk__prefix" id="rk-prefix">upp till</span>
            <span class="rk__talpar"><span class="ampy-number rk__tal" id="rk-tal">50 000</span> <span class="rk__talenhet" id="rk-talenhet">kr</span></span>
          </div>
          <p class="rk__per" id="rk-per">Per person och år.</p>

          <div class="rk__stopp" id="rk-stopp" aria-live="polite" aria-atomic="true" hidden>
            <svg class="rk__x" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" focusable="false">
              <circle cx="22" cy="22" r="22"/>
              <g fill="none" stroke="#fff" stroke-width="1.75" stroke-linecap="round" transform="translate(10 10)">
                <path d="M5 5l14 14M19 5L5 19"/>
              </g>
            </svg>
            <p class="rk__stopptext" id="rk-stopptext"></p>
          </div>
          <p class="rk__fin" id="rk-fin">Uppskattning med snittkommunalskatt. Skatteverket kan landa på ett annat belopp.</p>
        </div>

        <p class="rk__not" id="rk-not" aria-live="polite" aria-atomic="true" hidden></p>
      </div>
    </div>

  </section>
AMPY_AK_MARKUP;
	}
}

if ( ! function_exists( 'ampy_avdragskollen_prefix' ) ) {
	/** Prefixes every id / for / name / aria-labelledby / aria-describedby token with the instance id (also inside <template>). */
	function ampy_avdragskollen_prefix( $html, $uid ) {
		return preg_replace_callback(
			'/\b(id|for|name|aria-labelledby|aria-describedby)="([^"]*)"/',
			function ( $m ) use ( $uid ) {
				$out = array();
				foreach ( preg_split( '/\s+/', trim( $m[2] ) ) as $t ) {
					if ( '' !== $t ) { $out[] = $uid . '-' . $t; }
				}
				return $m[1] . '="' . implode( ' ', $out ) . '"';
			},
			$html
		);
	}
}

if ( ! function_exists( 'ampy_avdragskollen_shortcode' ) ) {
	function ampy_avdragskollen_shortcode( $atts = array() ) {
		static $instans = 0;
		$instans++;
		$a     = shortcode_atts( array( 'mode' => 'rot', 'heading' => null, 'heading_level' => '2' ), $atts, 'ampy_avdragskollen' );
		$mode  = ( 'gt' === strtolower( trim( (string) $a['mode'] ) ) ) ? 'gt' : 'rot';
		$namn  = '<span class="rk__ihop">' . ( 'gt' === $mode ? 'grön teknik-avdrag' : 'ROT-avdrag' ) . '</span>';   // same DOM as index.html + app.js skriv() (rk__ihop keeps the word on one line)
		$nivaa = ( '3' === (string) $a['heading_level'] ) ? 'h3' : 'h2';
		$uid   = 'ak' . $instans;                                   // id prefix per instance: ak1-rk-inkomst-1, ak2-rk-inkomst-1 ...

		$html = ampy_avdragskollen_prefix( ampy_avdragskollen_markup(), $uid );
		$html = str_replace( array( '{{MODE}}', '{{NAMN}}' ), array( $mode, $namn ), $html );

		// The heading: default per mode (index.html line 15 / app.js), own text via heading="...", none via heading="".
		if ( null === $a['heading'] ) {
			$rubrik = 'Räkna ut ditt ' . $namn;
		} else {
			$rubrik = esc_html( trim( (string) $a['heading'] ) );
		}
		if ( '' === $rubrik ) {
			// no heading: the section still gets a name (aria-labelledby would point at nothing)
			$html        = str_replace( 'aria-labelledby="' . $uid . '-rk-rubrik"', 'aria-label="' . esc_attr( 'Räkna ut ditt ' . ( 'gt' === $mode ? 'grön teknik-avdrag' : 'ROT-avdrag' ) ) . '"', $html );
			$rubrik_html = '';
		} else {
			$rubrik_html = '  <' . $nivaa . ' class="ampy-h2 rk__rubrik" id="' . $uid . '-rk-rubrik">' . $rubrik . '</' . $nivaa . '>' . "\n";
		}

		return '<div class="ampy-avdragskollen-outer"><div class="ampy-avdragskollen" lang="sv" data-mode="' . $mode . '">' . "\n"
			. $rubrik_html
			. $html . "\n"
			. '  <noscript><p class="rk__under">Kalkylatorn räknar i din webbläsare och behöver JavaScript.</p></noscript>' . "\n"
			. '</div></div>';
	}
	add_shortcode( 'ampy_avdragskollen', 'ampy_avdragskollen_shortcode' );
}
