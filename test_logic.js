/**
 * test_logic.js - Suite de tests complète pour Convertisseur Pro
 * Lancer avec: node test_logic.js
 */
const { cFr, cEn, cAr, config, getCurName } = require('./locales.js');

let passed = 0, failed = 0;

function test(desc, got, expected) {
    if (got === expected) {
        console.log(`✅ OK: ${desc} => ${got}`);
        passed++;
    } else {
        console.error(`❌ FAIL: ${desc}`);
        console.error(`   Got:      ${got}`);
        console.error(`   Expected: ${expected}`);
        failed++;
    }
}

// Convertisseur intégré (miroir de update() dans app.js)
function convert(value, lang, cur, mode = 'currency') {
    const intP = Math.floor(value), decP = Math.round((value - intP) * 100);
    const cv = lang === 'fr' ? cFr : lang === 'en' ? cEn : cAr;
    const iTxt = intP === 0 ? config.lang[lang].zero : cv(intP);
    let txt = '';
    if (mode === 'number') {
        txt = iTxt + (decP > 0 ? ` ${config.lang[lang].pt} ${cv(decP)}` : '');
    } else {
        // Règle grammaticale: "un million DE dinars" si multiple exact de million/milliard
        const needsDe = lang === 'fr' && intP >= 1e6 && intP % 1e6 === 0;
        const curSep = needsDe ? ' de ' : ' ';
        txt = iTxt + curSep + getCurName(intP, cur, false, lang);
        if (decP > 0) txt += ` ${config.lang[lang].and} ${cv(decP)} ${getCurName(decP, cur, true, lang)}`;
    }
    return txt.charAt(0).toUpperCase() + txt.slice(1);
}

// ===== cFr - Français =====
console.log('\n=== cFr: Nombres de base ===');
test('cFr(1)', cFr(1), 'un');
test('cFr(10)', cFr(10), 'dix');
test('cFr(11)', cFr(11), 'onze');
test('cFr(16)', cFr(16), 'seize');
test('cFr(17)', cFr(17), 'dix-sept');
test('cFr(20)', cFr(20), 'vingt');
test('cFr(21)', cFr(21), 'vingt et un');
test('cFr(22)', cFr(22), 'vingt-deux');
test('cFr(40)', cFr(40), 'quarante');
test('cFr(60)', cFr(60), 'soixante');
test('cFr(70)', cFr(70), 'soixante-dix');
test('cFr(71)', cFr(71), 'soixante et onze');
test('cFr(72)', cFr(72), 'soixante-douze');
test('cFr(79)', cFr(79), 'soixante-dix-neuf');
test('cFr(80)', cFr(80), 'quatre-vingts');        // BUG CORRIGÉ ✓
test('cFr(81)', cFr(81), 'quatre-vingt-un');
test('cFr(90)', cFr(90), 'quatre-vingt-dix');
test('cFr(91)', cFr(91), 'quatre-vingt-onze');
test('cFr(99)', cFr(99), 'quatre-vingt-dix-neuf');
test('cFr(100)', cFr(100), 'cent');
test('cFr(101)', cFr(101), 'cent un');
test('cFr(180)', cFr(180), 'cent quatre-vingts');  // BUG CORRIGÉ ✓
test('cFr(200)', cFr(200), 'deux cents');
test('cFr(201)', cFr(201), 'deux cent un');
test('cFr(280)', cFr(280), 'deux cent quatre-vingts'); // BUG CORRIGÉ ✓
test('cFr(1000)', cFr(1000), 'mille');
test('cFr(1001)', cFr(1001), 'mille un');
test('cFr(1080)', cFr(1080), 'mille quatre-vingts'); // BUG CORRIGÉ ✓
test('cFr(2000)', cFr(2000), 'deux mille');
test('cFr(1000000)', cFr(1000000), 'un million');
test('cFr(2000000)', cFr(2000000), 'deux millions');
test('cFr(1000000000)', cFr(1000000000), 'un milliard');

// ===== cEn - Anglais =====
console.log('\n=== cEn: Nombres de base ===');
test('cEn(1)', cEn(1), 'one');
test('cEn(11)', cEn(11), 'eleven');
test('cEn(20)', cEn(20), 'twenty');
test('cEn(21)', cEn(21), 'twenty-one');
test('cEn(100)', cEn(100), 'one hundred');
test('cEn(125)', cEn(125), 'one hundred twenty-five');
test('cEn(1000)', cEn(1000), 'one thousand');
test('cEn(1000000)', cEn(1000000), 'one million');

// ===== cAr - Arabe =====
console.log('\n=== cAr: Nombres de base ===');
test('cAr(1)', cAr(1), 'واحد');
test('cAr(2)', cAr(2), 'اثنان');
test('cAr(10)', cAr(10), 'عشرة');
test('cAr(11)', cAr(11), 'أحد عشر');
test('cAr(21)', cAr(21), 'واحد و عشرون');
test('cAr(100)', cAr(100), 'مائة');
test('cAr(200)', cAr(200), 'مائتان');
test('cAr(1000)', cAr(1000), 'ألف');
test('cAr(2000)', cAr(2000), 'ألفان');

// ===== getCurName =====
console.log('\n=== getCurName: Accords devise ===');
test('DZD fr 0 (pluriel)', getCurName(0, 'DZD', false, 'fr'), 'dinars');  // BUG CORRIGÉ ✓
test('DZD fr 1 (sing)', getCurName(1, 'DZD', false, 'fr'), 'dinar');
test('DZD fr 2 (plur)', getCurName(2, 'DZD', false, 'fr'), 'dinars');
test('DZD fr sub 1', getCurName(1, 'DZD', true, 'fr'), 'centime');
test('DZD fr sub 2', getCurName(2, 'DZD', true, 'fr'), 'centimes');
test('EUR en 1', getCurName(1, 'EUR', false, 'en'), 'euro');
test('EUR en 2', getCurName(2, 'EUR', false, 'en'), 'euros');
test('USD ar 1', getCurName(1, 'USD', false, 'ar'), 'دولار');
test('USD ar 2', getCurName(2, 'USD', false, 'ar'), 'دولاران');
test('USD ar 5', getCurName(5, 'USD', false, 'ar'), 'دولارات');
test('USD ar 11', getCurName(11, 'USD', false, 'ar'), 'دولار');

// ===== Intégration complète =====
console.log('\n=== Intégration: mode currency ===');
test('0 DZD fr', convert(0, 'fr', 'DZD'), 'Zéro dinars');                // BUG CORRIGÉ ✓
test('1 DZD fr', convert(1, 'fr', 'DZD'), 'Un dinar');
test('1.50 DZD fr', convert(1.5, 'fr', 'DZD'), 'Un dinar et cinquante centimes');
test('125 EUR fr', convert(125, 'fr', 'EUR'), 'Cent vingt-cinq euros');
test('2000 DZD fr', convert(2000, 'fr', 'DZD'), 'Deux mille dinars');
test('1000000 DZD fr', convert(1000000, 'fr', 'DZD'), 'Un million de dinars');  // BUG CORRIGÉ ✓
test('2000000 USD fr', convert(2000000, 'fr', 'USD'), 'Deux millions de dollars');
test('1000000000 EUR fr', convert(1000000000, 'fr', 'EUR'), 'Un milliard de euros');
test('125 EUR en', convert(125, 'en', 'EUR'), 'One hundred twenty-five euros');
test('10.25 USD en', convert(10.25, 'en', 'USD'), 'Ten dollars and twenty-five cents');

console.log('\n=== Intégration: mode number ===');
test('125 number fr', convert(125, 'fr', 'DZD', 'number'), 'Cent vingt-cinq');
test('1.5 number fr', convert(1.5, 'fr', 'DZD', 'number'), 'Un virgule cinquante');
test('125 number en', convert(125, 'en', 'DZD', 'number'), 'One hundred twenty-five');

// ===== Résumé =====
console.log('\n═══════════════════════════════════');
console.log(`Total: ${passed + failed} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
if (failed > 0) process.exit(1);
