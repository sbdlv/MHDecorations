require('dotenv').config()
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// OUTPUT PATH
const DECORATIONS_DATA_OUTPUT_PATH = process.env.DECORATIONS_DATA_OUTPUT_PATH || '../spa/src/assets/decorations/';

if (process.env.LANG_CODES == undefined) {
    console.error('No LANG_CODES specified at the env file');
    return -1;
}

const LANG_CODES = process.env.LANG_CODES.split(',');

// Get lang arguments
const inputLangCodes = process.argv.slice(2);

let processLangs;

if (inputLangCodes.length) {
    processLangs = LANG_CODES.filter(langCode => inputLangCodes.includes(langCode));
} else {
    processLangs = LANG_CODES;
}

console.log(`Processing lang codes:`, processLangs.toString());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });

    async function scrapData(lang, page) {
        const res = await page.goto(`https://mhrise.kiranico.com/${lang === 'en' ? '' : lang + '/'}data/decorations`);

        if (res.status() != 200) {
            throw new Error(`Invalid response code, with lang: ${lang}'. Got: ${res.status()}`);
        }

        return await page.$$eval('tr', rows => {
            return rows.map(row => {
                const fields = row.getElementsByTagName("td");
                return {
                    id: parseInt(fields[0].firstElementChild.href.split('/').pop()),
                    name: fields[0].innerText,
                    ability: fields[1].innerText,
                    desc: fields[2].innerText,
                    level: parseInt(
                        fields[0].innerText
                            .match(/[０-９]+|[0-9]+/).pop()
                            .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
                    ),
                    skill_level: parseInt(fields[1].innerText.match(/[０-９]+|[0-9]+/).pop()),
                };
            })
        })
    }

    async function processLang(lang, page) {
        try {
            console.log(`Scrapping for lang: ${lang}...`);
            const decorations = await scrapData(lang, page);
            fs.writeFileSync(path.join(DECORATIONS_DATA_OUTPUT_PATH, `decorations.${lang}.json`), JSON.stringify(decorations), { flag: 'w+' })
            console.log(`Scrapping ended for lang: ${lang}!`);
            page.close();
        } catch (error) {
            console.error(error);
        }
    }

    await Promise.all(processLangs.map(async langCode => processLang(langCode, await browser.newPage())));

    console.log(`All scrapping ended. Good hunt!`);

    await browser.close();
})();