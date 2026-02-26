/**
 * Chiffres en Lettres - Main Application Logic
 */

let state = { expr: '', val: 0, lang: 'fr', cur: 'DZD', mode: 'currency', tpl: 'none' };

// --- DOM Elements ---
const inputDisplay = document.getElementById('input-display');
const mainDisplay = document.getElementById('main-display');
const textResult = document.getElementById('text-result');
const currencySelect = document.getElementById('currency-select');
const installModal = document.getElementById('install-prompt');
const installBtn = document.getElementById('btn-install');
const iosHelp = document.getElementById('ios-help');

// --- Safer Math Evaluation ---
function evaluateExpression(expr) {
    try {
        // Sanitize and normalize
        let clean = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '.');
        // Arabic-Indic digits to Latin digits
        clean = clean.replace(/[\u0660-\u0669]/g, d => d.charCodeAt(0) - 0x0660);
        clean = clean.replace(/[\u06F0-\u06F9]/g, d => d.charCodeAt(0) - 0x06F0);

        // Final regex validation for safety
        if (/[^0-9\+\-\*\/\.\(\)\s\%]/.test(clean)) return 0;

        // Strip trailing operators
        clean = clean.replace(/[+\-*/%\\.]+$/g, '');
        if (!clean) return 0;

        // Using Function constructor as a slightly safer alternative to eval, 
        // but still with strict sanitization above.
        const res = new Function(`return ${clean}`)();
        return isFinite(res) ? res : 0;
    } catch (e) {
        return 0;
    }
}

// --- UI Updates ---
function update() {
    try {
        state.cur = currencySelect.value;
        const res = evaluateExpression(state.expr);
        state.val = Math.round(res * 100) / 100;

        inputDisplay.value = state.expr;

        // Format main display
        const formattedVal = state.val.toLocaleString(state.lang === 'fr' ? 'fr-FR' : state.lang === 'en' ? 'en-US' : 'ar-EG');
        const symbolSpan = state.mode === 'currency' ? ` <span style="font-size:0.6em;color:#4ade80">${config.currencies[state.cur].sym}</span>` : '';
        mainDisplay.innerHTML = formattedVal + symbolSpan;

        // Generate text result
        let txt = "";
        const intP = Math.floor(state.val), decP = Math.round((state.val - intP) * 100);
        const cv = state.lang === 'fr' ? cFr : state.lang === 'en' ? cEn : cAr;
        const iTxt = intP === 0 ? config.lang[state.lang].zero : cv(intP);

        if (state.mode === 'number') {
            txt = iTxt + (decP > 0 ? ` ${config.lang[state.lang].pt} ${cv(decP)}` : '');
        } else {
            const sep = config.lang[state.lang].and;
            // En français: "un million DE dinars" (préposition 'de' si multiple exact de million/milliard)
            const needsDe = state.lang === 'fr' && intP >= 1e6 && intP % 1e6 === 0;
            const curSep = needsDe ? ' de ' : ' ';
            txt = `${iTxt}${curSep}${getCurName(intP, state.cur, false, state.lang)}`;
            if (decP > 0) txt += ` ${sep} ${cv(decP)} ${getCurName(decP, state.cur, true, state.lang)}`;
        }

        let finalTxt = txt.charAt(0).toUpperCase() + txt.slice(1);
        if (state.tpl !== 'none') {
            finalTxt = config.lang[state.lang].tpl[state.tpl] + finalTxt;
        }
        textResult.textContent = finalTxt;

        // RTL/LTR support
        const isAr = state.lang === 'ar';
        document.body.dir = isAr ? 'rtl' : 'ltr';
        document.body.classList.toggle('font-arabic', isAr);

        // Update template button labels
        document.querySelectorAll('.btn-template').forEach(b => {
            const t = b.getAttribute('data-tpl');
            if (t === 'none') b.textContent = isAr ? "لا شيء" : "Aucun";
            if (t === 'check') b.textContent = isAr ? "شيك" : "Chèque";
            if (t === 'invoice') b.textContent = isAr ? "فاتورة" : "Facture";
            if (t === 'contract') b.textContent = isAr ? "عقد" : "Contrat";
        });
    } catch (e) {
        console.error(e);
    }
}

// --- Keypad Actions ---
function press(k) {
    if (navigator.vibrate) navigator.vibrate(20);

    if (k === 'C') {
        state.expr = '';
    } else if (k === 'DEL') {
        state.expr = state.expr.slice(0, -1);
    } else if (k === '=') {
        update();
        state.expr = state.mode === 'currency' ? state.val.toFixed(2) : String(state.val);
    } else {
        state.expr += k;
    }
    update();
}

// --- Event Handlers ---
function setLang(l, btn) {
    state.lang = l;
    document.querySelector('.btn-group .btn-lang[onclick*="setLang"].active')?.classList.remove('active');
    btn.classList.add('active');
    update();
}

function setMode(m, btn) {
    state.mode = m;
    currencySelect.style.display = m === 'currency' ? 'inline-block' : 'none';
    document.querySelectorAll('.btn-group .btn-lang').forEach(b => {
        if (b.textContent === 'DEV' || b.textContent === '123') b.classList.remove('active');
    });
    btn.classList.add('active');
    update();
}

function setTemplate(t, btn) {
    state.tpl = t;
    document.querySelectorAll('.btn-template').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    update();
}

function copyResult(type) {
    let txt = textResult.textContent;
    navigator.clipboard.writeText(txt).then(() => {
        alert(state.lang === 'ar' ? "تم النسخ!" : "Copié !");
    });
}

// --- Initialization & Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for keys
    document.querySelectorAll('.key').forEach(btn => {
        const val = btn.getAttribute('data-val');
        btn.addEventListener('click', () => press(val));
    });

    // Language buttons
    document.querySelectorAll('.btn-lang').forEach(btn => {
        const lang = btn.getAttribute('data-lang');
        if (lang) btn.addEventListener('click', (e) => setLang(lang, e.target));

        const mode = btn.getAttribute('data-mode');
        if (mode) btn.addEventListener('click', (e) => setMode(mode, e.target));
    });

    // Template buttons
    document.querySelectorAll('.btn-template').forEach(btn => {
        const tpl = btn.getAttribute('data-tpl');
        btn.addEventListener('click', (e) => setTemplate(tpl, e.target));
    });

    // Copy buttons
    document.querySelector('.btn-copy.txt').addEventListener('click', () => copyResult('text'));
    document.querySelector('.btn-copy.full').addEventListener('click', () => copyResult('full'));

    // Select change
    currencySelect.addEventListener('change', update);

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (/^[0-9]$/.test(key)) press(key);
        else if (key === '+') press('+');
        else if (key === '-') press('-');
        else if (key === '*') press('*');
        else if (key === '/') press('/');
        else if (key === '.' || key === ',') press('.');
        else if (key === '(') press('(');
        else if (key === ')') press(')');
        else if (key === '%') press('%');
        else if (key === 'Backspace') press('DEL');
        else if (key === 'Enter' || key === '=') press('=');
        else if (key === 'Escape' || key.toLowerCase() === 'c') press('C');
    });

    // PWA Install
    let deferredPrompt;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (!isStandalone) {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            setTimeout(() => installModal.classList.add('show'), 2000);
        });

        if (isIOS) {
            setTimeout(() => {
                const installBtn = document.getElementById('btn-install');
                const iosHelp = document.getElementById('ios-help');
                if (installBtn) installBtn.style.display = 'none';
                if (iosHelp) iosHelp.style.display = 'block';
                installModal.classList.add('show');
            }, 2000);
        }
    }

    if (installBtn) {
        installBtn.addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') installModal.classList.remove('show');
                    deferredPrompt = null;
                });
            }
        });
    }

    const closeBtn = document.querySelector('.close-install');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => installModal.classList.remove('show'));
    }

    window.closeInstall = () => installModal.classList.remove('show');

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(reg => { reg.update(); });
    }

    update();

    // --- Splash Screen ---
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        // Fermer le splash après 2.5s
        const hideSplash = () => {
            splashScreen.classList.add('hide');
            // Retirer du DOM après la transition
            setTimeout(() => splashScreen.remove(), 750);
        };
        // Auto-dismiss
        setTimeout(hideSplash, 2500);
        // Clic pour passer directement
        splashScreen.addEventListener('click', hideSplash);
    }
});
