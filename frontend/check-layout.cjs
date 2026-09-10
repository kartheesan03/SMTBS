const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'admin@smtbms.com');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await page.goto('http://localhost:3000/finance');
    await page.waitForSelector('h1');
    
    const layout = await page.evaluate(() => {
        const getElementInfo = (el) => {
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            const computed = window.getComputedStyle(el);
            return {
                tag: el.tagName,
                class: el.className,
                top: rect.top,
                height: rect.height,
                marginTop: computed.marginTop,
                paddingTop: computed.paddingTop,
                display: computed.display
            };
        };
        
        return {
            appLayout: getElementInfo(document.querySelector('.app-layout')),
            appMain: getElementInfo(document.querySelector('.app-main')),
            globalHeader: getElementInfo(document.querySelector('.bx-header')),
            appContent: getElementInfo(document.querySelector('.app-content')),
            pageContainer: getElementInfo(document.querySelector('.page-container')),
            h1: getElementInfo(document.querySelector('h1'))
        };
    });
    console.log(JSON.stringify(layout, null, 2));
    await browser.close();
})();
