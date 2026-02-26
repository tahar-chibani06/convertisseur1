const config = {
    currencies: {
        DZD: { sym: "DA", fr: { n: "dinar", p: "dinars", s: "centime", sp: "centimes" }, en: { n: "dinar", p: "dinars", s: "centime", sp: "centimes" }, ar: { s: "دينار", d: "ديناران", p: "دنانير", def: "دينار", ss: "سنتيم", sd: "سنتيمان", sp: "سنتيمات", sdef: "سنتيم" } },
        EUR: { sym: "€", fr: { n: "euro", p: "euros", s: "centime", sp: "centimes" }, en: { n: "euro", p: "euros", s: "cent", sp: "cents" }, ar: { s: "يورو", d: "يورو", p: "يورو", def: "يورو", ss: "سنت", sd: "سنتان", sp: "سنتات", sdef: "سنت" } },
        USD: { sym: "$", fr: { n: "dollar", p: "dollars", s: "cent", sp: "cents" }, en: { n: "dollar", p: "dollars", s: "cent", sp: "cents" }, ar: { s: "دولار", d: "دولاران", p: "دولارات", def: "دولار", ss: "سنت", sd: "سنتان", sp: "سنتات", sdef: "سنت" } }
    },
    lang: {
        fr: { and: "et", zero: "zéro", pt: "virgule", tpl: { check: "Payez contre ce chèque la somme de : ", invoice: "Arrêté la présente facture à la somme de : ", contract: "Le montant total s'élève à : " } },
        en: { and: "and", zero: "zero", pt: "point", tpl: { check: "Pay against this check the sum of: ", invoice: "Total invoice amount fixed at: ", contract: "The total amount is: " } },
        ar: { and: "و", zero: "صفر", pt: "فاصل", tpl: { check: "ادفعوا بموجب هذا الصك مبلغ : ", invoice: "توقفت الفاتورة عند مبلغ : ", contract: "المبلغ الإجمالي هو : " } }
    }
};

function cFr(n) {
    if (n === 0) return "";
    const u = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'],
        te = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'],
        ts = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    if (n < 10) return u[n];
    if (n < 20) return te[n - 10];
    if (n < 100) {
        const t = Math.floor(n / 10), r = n % 10;
        if (t === 7 || t === 9) {
            const o = t === 7 ? 60 : 80,
                p = t === 7 ? "soixante" : "quatre-vingt",
                c = (t === 7 && r === 1) ? " et " : "-";
            return p + c + cFr(n - o);
        }
        const tw = ts[t];
        if (r === 0) return t === 8 ? "quatre-vingts" : tw;
        if (r === 1 && t !== 8) return tw + " et un";
        return tw + "-" + u[r];
    }
    if (n < 1000) {
        if (n === 100) return "cent";
        const h = Math.floor(n / 100), r = n % 100,
            hw = (h > 1 && r === 0) ? "cents" : "cent",
            p = h === 1 ? "" : u[h] + " ";
        return p + hw + (r === 0 ? "" : " " + cFr(r));
    }
    const ch = [{ v: 1e9, l: "milliard" }, { v: 1e6, l: "million" }, { v: 1e3, l: "mille" }];
    for (let c of ch) {
        if (n >= c.v) {
            const q = Math.floor(n / c.v), r = n % c.v;
            let l = c.l;
            if (q > 1 && l !== "mille") l += "s";
            let p = (l === "mille" && q === 1) ? "" : cFr(q) + " ";
            return p + l + (r === 0 ? "" : " " + cFr(r));
        }
    }
    return "";
}

function cEn(n) {
    const u = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
        t = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if (n === 0) return "";
    if (n < 10) return u[n];
    if (n < 20) return ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'][n - 10];
    if (n < 100) return t[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + u[n % 10] : "");
    if (n < 1000) return u[Math.floor(n / 100)] + " hundred" + (n % 100 !== 0 ? " " + cEn(n % 100) : "");
    const ch = [{ v: 1e9, l: "billion" }, { v: 1e6, l: "million" }, { v: 1e3, l: "thousand" }];
    for (let c of ch) if (n >= c.v) return cEn(Math.floor(n / c.v)) + " " + c.l + (n % c.v !== 0 ? ", " + cEn(n % c.v) : "");
}

function cAr(n) {
    const u = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'],
        t = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    if (n === 0) return "";
    if (n < 10) return u[n];
    if (n < 20) return ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'][n - 10];
    if (n < 100) {
        const r = n % 10, d = Math.floor(n / 10);
        return r === 0 ? t[d] : u[r] + " و " + t[d];
    }
    if (n < 1000) {
        const h = Math.floor(n / 100), r = n % 100;
        let hw = h === 1 ? "مائة" : h === 2 ? "مائتان" : u[h] + "مائة";
        return r === 0 ? hw : hw + " و " + cAr(r);
    }
    const ch = [{ v: 1e9, l: "مليار", d: "ملياران", p: "مليارات" }, { v: 1e6, l: "مليون", d: "مليونان", p: "ملايين" }, { v: 1e3, l: "ألف", d: "ألفان", p: "آلاف" }];
    for (let c of ch) if (n >= c.v) {
        const q = Math.floor(n / c.v), r = n % c.v;
        let p = "";
        if (q === 1) p = c.l;
        else if (q === 2) p = c.d;
        else if (q >= 3 && q <= 10) p = cAr(q) + " " + c.p;
        else p = cAr(q) + " " + c.l;
        return r === 0 ? p : p + " و " + cAr(r);
    }
}

function getCurName(v, t, s, lang) {
    const c = config.currencies[t];
    if (lang === 'ar') {
        const a = c.ar;
        return s ? (v === 1 ? a.ss : v === 2 ? a.sd : v <= 10 ? a.sp : a.sdef) : (v === 1 ? a.s : v === 2 ? a.d : v <= 10 ? a.p : a.def)
    }
    const l = c[lang];
    // En français, zéro (v=0) prend le pluriel comme 2+
    return s ? (v <= 1 && v !== 0 ? l.s : l.sp) : (v <= 1 && v !== 0 ? l.n : l.p)
}

// Export for use in app.js
if (typeof module !== 'undefined') {
    module.exports = { config, cFr, cEn, cAr, getCurName };
}
