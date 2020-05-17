let fs = require('fs');
let cd = require('chromedriver');
let swd = require('selenium-webdriver');
let driver = new swd.Builder().forBrowser('chrome').build(); //building a new driver
let path = require('path');
let celebs = process.argv[2];

//******************Module 1************************************************
async function twitterStats(celeb) {
    let stats = await driver.findElements(swd.By.css('div.col.d-flex.flex-column p'));
    let followers = stats[0];
    let following = stats[1];
    let tweets = stats[2];
    let likes = stats[3];
    let allStats = await Promise.all([followers, following, tweets, likes]);
    let Arrobj = allStats.map(function (val) {
        let ob = {};
        ob.followers = val[0];
        ob.following = val[1];
        ob.tweets = val[2];
        ob.likes = val[3];
        return ob;
    });
    await fs.promises.writeFile(path.join(celeb.path, 'stats1.json'), JSON.stringify(Arrobj));
}

//*******************Module 2***************************************************
async function fbStats(celeb) {
    let stats = await driver.findElements(swd.By.css('div.col.d-flex.flex-column p'));
    let likes = stats[0];
    let followers = stats[1];
    let allStats = await Promise.all([likes, followers]);
    let Arrobj = allStats.map(function (val) {
        let ob = {};
        ob.likes = val[0];
        ob.followers = val[1];
        return ob;
    });
    await fs.promises.writeFile(path.join(celeb.path, 'stats3.json'), JSON.stringify(Arrobj));
}

//***********************Module 3************************************************
async function ytStats(celeb) {
    let stats = await driver.findElements(swd.By.css('div.col.d-flex.flex-column p'));
    let subscribers = stats[0];
    let views = stats[1];
    let videos = stats[2];
    let allStats = await Promise.all([subscribers, views, videos]);
    let Arrobj = allStats.map(function (val) {
        let ob = {};
        ob.subscribers = val[0];
        ob.views = val[1];
        ob.videos = val[2];
        return ob;
    });
    await fs.promises.writeFile(path.join(celeb.path, 'stats4.json'), JSON.stringify(Arrobj));
}

//**********************Module 4**************************************************
async function instaStats(celeb) {
    let stats = await driver.findElements(swd.By.css('div.col.d-flex.flex-column p'));
    let followers = stats[0];
    let uploads = stats[1];
    let engagement = stats[2];
    let otherstats = await driver.findElements(swd.By.css('div.margin-bottom-6 div.row div.col .report-content-number'));
    let avglikes = otherstats[2];
    let avgcomments = otherstats[3];
    let allStats = await Promise.all([followers, uploads, engagement, avglikes, avgcomments]);
    let Arrobj = allStats.map(function (val) {
        let ob = {};
        ob.followers = val[0];
        ob.uploads = val[1];
        ob.engagement = val[2];
        ob.avglikes = val[3];
        ob.avgcomments = val[4];
        return ob;
    });
    await fs.promises.writeFile(path.join(celeb.path, 'stats2.json'), JSON.stringify(Arrobj));
    
}

//***********************Module 5***************************************************
async function getStats(celeb) {
    try {
        let dropdown = await driver.findElement(swd.By.css('button[data-toggle=dropdown]'));
        await dropdown.click();
        let options = await driver.findElements(swd.By.css('a.dropdown-item svg.svg-inline--fa'));
        let optionTexts = await Promise.all(options.map(function (o) {
            return o.getText();
        }));
        let i;
        for (i = 0; i < optionTexts.length; i++) {
            if (optionTexts[i].trim() === celeb.smp) {
                break;
            }
        }
        await options[i].click();
        let input = await driver.findElement(swd.By.css('input[type=text]'));
        let cn = celeb.celeb_id;
        let cnp = input.sendKeys(cn);
        await Promise.all([cnp]);
        let button = await driver.findElement(swd.By.css('button[type=submit]'));
        await button.click();
        switch (celeb.smp) {
            case 'Twitter':
                twitterStats(celeb);
                break;
            case 'Instagram':
                instaStats(celeb);
                break;
            case 'Facebook':
                fbStats(celeb);
                break;
            case 'YouTube':
                ytStats(celeb);
                break;
            default:
                console.log('Invalid Social Media Platform');
                break;
        }
    } catch (error) {
        console.log(error);
    }
}

//************************Start of Code*********************************************
async function start() {
    try {
        await driver.manage().setTimeouts({ implicit: 1000 });
        await driver.get('https://www.speakrj.com/audit/');
        let cfrp = await fs.promises.readFile(celebs, 'utf-8');
        let cel = JSON.parse(cfrp).celebrities;
        let l=cel.length;
        for (let i = 0; i < l; i++) {
            await getStats(cel[i]);
        }
        console.log('All Stats Fetched');
   
    }
    catch (error) {
        console.log(error);
    }
} start();
