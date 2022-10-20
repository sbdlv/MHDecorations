const puppeteer = require('puppeteer');
const fs = require('fs');
const LANGS = require('../data/langs.json');

(async () => {
    const browser = await puppeteer.launch();

    async function scrapData(lang, page) {
        const res = await page.goto(`https://mhrise.kiranico.com/${lang === 'en' ? '' : lang + '/'}data/decorations`);

        if (res.status() != 200) {
            throw new Error(`Invalid response code, with lang: ${lang}'. Got: ${res.status()}`);
        }

        return await page.$$eval('tr', rows => {
            return rows.map(row => {
                const fields = row.getElementsByTagName("td");
                return {
                    id: fields[0].firstElementChild.href.match(/[0-9]+/)[0],
                    name: fields[0].innerText,
                    ability: fields[1].innerText,
                    desc: fields[2].innerText,
                    level: fields[0].innerText.match(/[０-９]+|[0-9]+/).pop(),
                    skill_level: fields[1].innerText.match(/[０-９]+|[0-9]+/).pop(),
                };
            })
        })
    }

    async function processLang(lang, page) {
        try {
            console.log(`Scrapping for lang: ${lang}...`);
            const jewels = await scrapData(lang, page);
            fs.writeFileSync(`../data/jewels.${lang}.json`, JSON.stringify(jewels), { flag: 'w+' })
            console.log(`Scrapping ended for lang: ${lang}!`);
            page.close();
        } catch (error) {
            console.error(error);
        }
    }

    const promises = [];

    for (const lang of LANGS) {
        promises.push(processLang(lang.code, await browser.newPage()))
    }

    await Promise.all(promises);

    console.log(`All scrapping ended. Good hunt!`);

    await browser.close();
})();