const {Builder, By, until} = require('selenium-webdriver');
const fs = require("fs");

let driver = null;
let links = [];

(async function main() {
  driver = await new Builder().forBrowser('firefox').build();
  openPage("https://www.themoviedb.org/movie/top-rated");
})();



async function openPage(target) {
  try {
    await driver.get(target);
    await driver.wait(until.elementLocated(By.className("pagination")));
    let elements = await driver.findElements(By.className("title"));
    
    var promises = elements.map(async function(el) {
      let link = {url: '', title: ''};
      link.title = await el.getText();
      link.url = await el.getAttribute("href");
      if(link.url!=null) links.push(link);
    });

    Promise.all(promises)
    .then(async function(){
      let next_btn = await driver.findElement(By.className("next_page"));
      let next_url = await next_btn.getAttribute("href");
      if(next_url != null) openPage(next_url);
      else {
        fs.writeFileSync('links.json', JSON.stringify(links, null, 4), function(err) {
          if(err) {
              return console.log(err);
          }

          console.log("The file was saved!");
        });
      }
    });

  }
  catch {
	  // await driver.quit();
  }
  finally {
    // await driver.quit();
  }
}