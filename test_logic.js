const { cFr, cEn, cAr, config, getCurName } = require('./locales.js');

function testConversion(value, lang, currency, expected) {
    const intP = Math.floor(value);
    const decP = Math.round((value - intP) * 100);
    const cv = lang === 'fr' ? cFr : lang === 'en' ? cEn : cAr;

    let txt = "";
    const iTxt = intP === 0 ? config.lang[lang].zero : cv(intP);
    const sep = config.lang[lang].and;

    txt = `${iTxt} ${getCurName(intP, currency, false, lang)}`;
    if (decP > 0) txt += ` ${sep} ${cv(decP)} ${getCurName(decP, currency, true, lang)}`;

    const finalTxt = txt.charAt(0).toUpperCase() + txt.slice(1);

    if (finalTxt === expected) {
        console.log(`✅ Passed: ${value} ${currency} (${lang}) -> ${finalTxt}`);
    } else {
        console.error(`❌ Failed: ${value} ${currency} (${lang})`);
        console.error(`   Expected: ${expected}`);
        console.error(`   Got:      ${finalTxt}`);
    }
}

console.log("--- Running Tests for Convertisseur Pro ---");

// Test Cases
testConversion(125, 'fr', 'EUR', 'Cent vingt-cinq euros');
testConversion(125, 'en', 'EUR', 'One hundred twenty-five euros');
testConversion(1.50, 'fr', 'DZD', 'Un dinar et cinquante centimes');
testConversion(2000, 'fr', 'DZD', 'Deux mille dinars');
testConversion(10.25, 'en', 'USD', 'Ten dollars and twenty-five cents');

console.log("--- End of Tests ---");
