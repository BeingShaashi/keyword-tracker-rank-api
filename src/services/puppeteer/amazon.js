const config = require("../../config");

exports.getRanking = async ({ keyword, productId }) => {
  const browser = global.browser;
  if (!browser) return null;

  let result;

  let page;
  try {
    page = await this.openPopup();

    await page.setDefaultNavigationTimeout(0);

    await this.openAmazon(page);
    await this.searchAmazon(page, keyword);

    result = await loopOverToGetRank({
      page,
      keyword,
      productId,
      limit: config.amazon.pageLimit,
    });

    console.log({ result });
  } catch (error) {
    debug("Erorr getting rank: ", error);
  }

  if (page) {
    setTimeout(() => {
      page.close().catch((e) => debug("Error closing page: ", e.message));
    }, 5000);
  }

  return result;
};

exports.openAmazon = async (page) => {
  page.goto(config.amazon.url);
  await page.waitForSelector("#twotabsearchtextbox");
  await page.waitForSelector("#nav-search-submit-text");

  debug(`amazon website opened`);
};

exports.openPopup = async () => {
  var browser;

  browser = global.browser;
  var pages = await browser.pages();

  let windowId =
    "id-" + Date.now() + parseInt(Math.random() * 10000).toString();
  let customUrl = `${config.publicUrl.protocol}//${config.publicUrl.hostname}${config.publicUrl.pathname}?id=${windowId}`;

  await pages[0].evaluate(
    ({ customUrl, windowId }) => {
      let newWin = window.open(customUrl, windowId, "width=1200,height=800");
      console.log({ newWin });
      return newWin;
    },
    { customUrl, windowId }
  );

  await sleep(1000);

  var pages = await browser.pages();

  console.log("Existing pages ", pages.length);

  let targets = browser.targets();

  const target = targets.find(
    (x) => x._targetInfo.url && x._targetInfo.url.match(windowId)
  );

  const page = await target.page();
  return page;
};

exports.searchAmazon = async (page, searchText) => {
  await page.type("input#twotabsearchtextbox", searchText, { delay: 20 });
  await page.click("#nav-search-submit-text");

  await page.waitForSelector('[data-component-type="s-search-results"]');

  console.log("search component loaded");
};

const getSearchResults = async (page) => {
  const attrs = await page.$$eval(
    '[data-component-type="s-search-result"]',
    (el) =>
      el.map((x) => ({
        "data-asin": x.getAttribute("data-asin"),
        "data-index": x.getAttribute("data-index"),
      }))
  );

  return attrs;
};

const paginateNext = async (page) => {
  await page.waitForSelector('[cel_widget_id="MAIN-PAGINATION"]');

  const success = await page.$eval(
    '[cel_widget_id="MAIN-PAGINATION"]',
    (el) => {
      if (!el) {
        console.log(
          'Selector not found for pagination: cel_widget_id="MAIN-PAGINATION"'
        );
        return false;
      }
      console.log("Pagination component found", el);

      let nextBtn = el.querySelector("li.a-last");
      let nextBtnLink = nextBtn && nextBtn.firstElementChild;
      console.log("Next btn link: ", nextBtnLink);

      if (nextBtnLink) {
        nextBtnLink.click();
        return true;
      }
    }
  );

  return success;
};

const loopOverToGetRank = async ({ page, keyword, productId, limit }) => {
  var rank = 0;

  let i;
  for (i = 1; i <= limit; ++i) {
    await page.waitForSelector('[data-component-type="s-search-results"]');
    await page.waitForSelector('[cel_widget_id="MAIN-PAGINATION"]');

    const searchResults = await getSearchResults(page);
    debug({ searchResults, keyword, productId, pageCount: i });

    const matchIndex = searchResults.findIndex(
      (x) => x && x["data-asin"] === productId
    );

    if (matchIndex > -1) {
      let match = searchResults[matchIndex];
      let currentRank =
        !match["data-index"] || isNaN(match["data-index"])
          ? matchIndex
          : parseInt(match["data-index"]);

      rank += currentRank;

      let result = {
        rank,
        pageCount: i,
        productId,
        keyword,
        found: true,
        pageLimit: limit,
      };
      return result;
    } else {
      let success = await paginateNext(page).catch((e) => {
        debug(e);
        return false;
      });

      if (!success) {
        debug("next button not found, breaking loop");
        break;
      } else {
        await sleep(500);
      }
    }
  }

  return {
    productId,
    keyword,
    found: false,
    pageLimit: limit,
    pageCount: i,
    rank,
  };
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
