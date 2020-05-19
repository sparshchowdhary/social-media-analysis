const fs = require('fs');
const cd = require('chromedriver');
const swd = require('selenium-webdriver');
const driver = new swd.Builder().forBrowser('chrome').build(); //building a new driver
const path = require('path');
const celebFile = process.argv[2];

//******************************* Module : 1 *********************************************************
async function twitterStats(celeb) {
  try {
    await driver.navigate().refresh();
    let stats = await driver.findElements(swd.By.css(".report-header-number"));
    let statsText = await Promise.all(stats.map(function (r) {
      return r.getAttribute("innerText");
    }));

    let followers = statsText[0];
    let following = statsText[1];
    let tweets = statsText[2];
    let likes = statsText[3];
    let allStats = [followers, following, tweets, likes];

    let ob = {};
    ob.followers = allStats[0];
    ob.following = allStats[1];
    ob.tweets = allStats[2];
    ob.likes = allStats[3];
    console.log(ob);
    await fs.promises.writeFile(path.join(celeb.path, 'stats1.json'), JSON.stringify(ob));
  } catch (error) {
    console.log(error);
  }
}

//******************* Module : 2 ***************************************************
async function fbStats(celeb) {
  try {
    await driver.navigate().refresh();
    let stats = await driver.findElements(swd.By.css(".report-header-number"));
    let statsText = await Promise.all(stats.map(function (r) {
      return r.getAttribute("innerText");
    }));

    let likes = statsText[0];
    let followers = statsText[1];
    let allStats = [likes, followers];

    let ob = {};
    ob.likes = allStats[0];
    ob.followers = allStats[1];
    console.log(ob);
    await fs.promises.writeFile(path.join(celeb.path, 'stats3.json'), JSON.stringify(ob));
  }
  catch (error) {
    console.log(error);
  }
}

//*********************** Module : 3 ************************************************
async function ytStats(celeb) {
  try {
    await driver.navigate().refresh();
    let stats = driver.findElements(swd.By.css(".report-header-number"));
    let statsText = await Promise.all(stats.map(function (r) {
      return r.getAttribute("innerText");
    }));

    let subscribers = statsText[0];
    let views = statsText[1];
    let videos = statsText[2];
    let allStats = [subscribers, views, videos];

    let ob = {};
    ob.subscribers = allStats[0];
    ob.views = allStats[1];
    ob.videos = allStats[2];
    console.log(ob);
    await fs.promises.writeFile(path.join(celeb.path, 'stats4.json'), JSON.stringify(ob));
  }
  catch (error) {
    console.log(error);
  }
}

//********************** Module : 4 **************************************************
async function instaStats(celeb) {
  try {
    await driver.navigate().refresh();
    let stats = driver.findElements(swd.By.css(".report-header-number"));
    let statsText = await Promise.all(stats.map(function (r) {
      return r.getAttribute("innerText");
    }));

    let followers = statsText[0];
    let uploads = statsText[1];
    let engagement = statsText[2];
    let otherstats = await driver.findElements(swd.By.css('div.margin-bottom-6 div.row div.col span'));
    let otherstatsText = await Promise.all(otherstats.map(function (os) {
      return os.getText();
    }));
    let avglikes = otherstatsText[2];
    let avgcomments = otherstatsText[3];

    let allStats = [followers, uploads, engagement, avglikes, avgcomments];
    let ob = {};
    ob.followers = allStats[0];
    ob.uploads = allStats[1];
    ob.engagement = allStats[2];
    ob.avglikes = allStats[3];
    ob.avgcomments = allStats[4];
    await fs.promises.writeFile(path.join(celeb.path, 'stats2.json'), JSON.stringify(ob));
  }
  catch (error) {
    console.log(error);
  }
}

//******************************** Module : 5 *****************************************************
async function analyser(celeb) {
  try {
    switch (celeb.smp) {
      case 'twitter':
        await twitterStats(celeb);
        break;
      case 'instagram':
        await instaStats(celeb);
        break;
      case 'facebook':
        await fbStats(celeb);
        break;
      case 'youtube':
        await ytStats(celeb);
        break;
      default:
        console.log('Invalid Social Media Platform');
        break;
    }
  } catch (error) {
    console.log(error);
  }
}

//****************************** Module : 6 *************************************************
async function getStats(celebrity) {
  await driver.wait(swd.until.elementLocated(swd.By.css('.navbar.navbar-main a img')));

  try {
    await driver.wait(swd.until.elementLocated(swd.By.css('div.index-search.aos-init.aos-animate button[data-toggle=dropdown]')));
    let dropdown = await driver.findElement(swd.By.css('div.index-search.aos-init.aos-animate button[data-toggle=dropdown]'));
    await dropdown.click();

    await driver.wait(swd.until.elementLocated(swd.By.css('div.dropdown-menu.show a.dropdown-item')));
    let options = await driver.findElements(swd.By.css('div.dropdown-menu.show a.dropdown-item'));
    let optionTexts = await Promise.all(options.map(function (o) {
      return o.getAttribute('data-source');
    }));
    let index = optionTexts.findIndex(e => e === celebrity.smp);
    await options[index].click();

    let input = await driver.findElement(swd.By.css('input[type=text]'));
    await input.sendKeys(celebrity.celeb_id);


    driver.wait(swd.until.elementLocated(swd.By.css('button[type=submit]')))
    let button = await driver.findElement(swd.By.css('button[type=submit]'));
    await button.click();
    await analyser(celebrity);
  }
  catch (error) {
    console.log(error);
  }
}

//**************************** Module : 7 **********************************************
const removeAds = async () => {
  const allIframes = await driver.findElements(swd.By.css("iframe")); //to handle pop ups and ads

  if (allIframes.length === 0) {
    console.log('no ads found');
    return;
  }

  console.log('ads found. removing....');
  await driver.executeScript(`
    var ads = document.getElementsByTagName("iframe"); 
    for(let index = 0; index < ads.length; index++)
      {
        ads[index].remove();
      }
  `);
  console.log('ads removed');
}

//******************************* Module : 8 **********************************************
const switchToTab = async (index) => {
  const tabs = await driver.getAllWindowHandles();
  await driver.switchTo().window(tabs[index]);
}

//****************************** Module : 9 ***********************************************
const openNewTab = async (url, index) => {
  await driver.executeScript(`window.open("${url}", "_blank");`);
}

//************************* Start of Code ************************************************
async function start() {
  const homepageUrl = "https://www.speakrj.com/audit/"
  try {
    await driver.manage().setTimeouts({ implicit: 5000 });
    await driver.manage().window().maximize(); //maximize window

    let celebsData = await fs.promises.readFile(celebFile, 'utf-8');
    const { celebrities } = JSON.parse(celebsData);

    for (let index = 0; index < celebrities.length; index++) {
      await openNewTab(homepageUrl);
    }

    for (let index = 0; index < celebrities.length; index++) {
      await switchToTab(index + 1);//to switching between tabs
      await getStats(celebrities[index]);
    }

    console.log('All Stats Fetched');
    await driver.quit();
  }
  catch (error) {
    console.log(error);
  }
} start();
