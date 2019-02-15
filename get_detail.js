const {Builder, By, until} = require('selenium-webdriver');
const fs = require("fs");

let driver = null;
let films = [];
let film = {
    title : "",
    year : "",
    rating : "",
    overview : "",
    language : "",
    runtime : "",
    // genre : []
};

let xpaths = [
    "/html/body/div[1]/main/section/div[1]/div/div/section/div[2]/section/div[1]/span/a/h2", // title
    "/html/body/div[1]/main/section/div[1]/div/div/section/div[2]/section/div[1]/span/span", // year
    "/html/body/div[1]/main/section/div[1]/div/div/section/div[2]/section/ul/li[1]/div[1]/div/div/div/span", //rating
    "/html/body/div[1]/main/section/div[1]/div/div/section/div[2]/section/div[2]/div/p", // overview
    "/html/body/div[1]/main/section/div[2]/div[2]/div[2]/div/section/div[1]/div/section[1]/p[3]", // language
    "/html/body/div[1]/main/section/div[2]/div[2]/div[2]/div/section/div[1]/div/section[1]/p[4]", // runtime
    "/html/body/div[1]/main/section/div[2]/div[2]/div[2]/div/section/div[1]/div/section[1]/p[5]" // runtime
];

let css_genre = "section.genres ul li a";

let logger = fs.createWriteStream('data.csv', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})
let i = 1524;

let url = [
    "https://www.themoviedb.org/movie/19404",
    "https://www.themoviedb.org/movie/278"
];



(async function main() {

    let json = JSON.parse(fs.readFileSync('links.json', 'utf8'));

    driver = await new Builder().forBrowser('firefox').build();
    for(j = (i-1);j<json.length;j++) {
        await open(json[j].url);
    }

    logger.end();
    
})();

async function open(url) {
    try {
        await driver.get(url);
        await driver.wait(until.elementLocated(By.className("overview")));
        let el_title = await driver.findElement(By.xpath(xpaths[0]));
        let el_year = await driver.findElement(By.xpath(xpaths[1]));
        let el_rating = await driver.findElement(By.xpath(xpaths[2]));
        let el_overview = await driver.findElement(By.xpath(xpaths[3]));


        // Cek apakah ada original title
        let el_ori_title = await driver.findElement(By.xpath("/html/body/div[1]/main/section/div[2]/div[2]/div[2]/div/section/div[1]/div/section[1]/p[1]/strong"));
        let text_ori = await el_ori_title.getText();
        
        
        let el_language = await driver.findElement(By.xpath(xpaths[text_ori == "Original Title" ? 5 : 4]));
        let el_runtime = await driver.findElement(By.xpath(xpaths[text_ori == "Original Title" ? 6 : 5]));
        let el_genres = await driver.findElements(By.css(css_genre));
        let genres = [];
        el_genres.map(async function(el_genre) {
            genres.push(await el_genre.getText());
        })
        
        film = {
            title : await el_title.getText(),
            year : (await el_year.getText()).substring(1,5),
            rating : (await el_rating.getAttribute("class")).slice(-2),
            overview : await el_overview.getText(),
            language : (await el_language.getText()).substring(18,100),
            runtime : (await el_runtime.getText()).substring(8,18),
            genres : genres
        };

        await write(film);

        // console.log(film);
        
    }
    catch {
        // await driver.quit();
    }
    finally {
      // await driver.quit();
    }
}



async function write(object) {
    await logger.write(i + ";"); // append string to your file
    await logger.write(object.title + ";") // again
    await logger.write(object.year + ";")
    await logger.write(object.language + ";")
    await logger.write(object.rating + ";")
    await logger.write(object.overview + ";")
    await logger.write(object.runtime + ";")
    await logger.write(object.genres.join(",") + "\n")
    i++;
    // logger.write(obj) // again
}