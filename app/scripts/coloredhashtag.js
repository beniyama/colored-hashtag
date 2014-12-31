/*global $:false, chrome:false */

var ColoredHashtags = {
  MAX_RETRY_NUM: 5,
  colors: [
    "rgba(207, 0, 15, 0.3)",
    "rgba(31, 58, 147, 0.3)",
    "rgba(247, 202, 24, 0.3)",
    "rgba(25, 181, 254, 0.3)",
    "rgba(38, 166, 91, 0.3)",
    "rgba(226, 106, 106, 0.3)",
    "rgba(232, 126, 4, 0.3)",
    "rgba(102, 51, 153, 0.3)",
    "rgba(27, 188, 155, 0.3)",
    "rgba(68, 108, 179, 0.3)"
  ],
  hashtagNotExistCount: null,
  intervalTimer: null,
  observer: null,

  reset: function () {
    "use strict";

    this.hashtagNotExistCount = 0;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }
};

(function () {
  "use strict";

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "onUpdated") {
      init();
    }
  });
})();

function init() {
  "use strict";

  // Reset global object properties
  ColoredHashtags.reset();

  // Monitor card title modification events to avoid frequent updates
  var config = {childList: true, subtree: true};
  ColoredHashtags.observer = new MutationObserver(function (mutations) {
    $.each(mutations, function (index, mutation) {
      var $target = $(mutation.target);
      if ($target.hasClass('list-card-title')) {
        updateCards();
      }
    });
  });
  ColoredHashtags.observer.observe(document.body, config);

  // Execute updateCards until the first colored
  ColoredHashtags.intervalTimer = setInterval(function () {
    if (ColoredHashtags.hashtagNotExistCount >= ColoredHashtags.MAX_RETRY_NUM || $('.list-card-details.colored').length > 0) {
      clearInterval(ColoredHashtags.intervalTimer);
    } else {
      if (!updateCards()) {
        ColoredHashtags.hashtagNotExistCount++;
      }
    }
  }, 2000);
}


function updateCards() {
  "use strict";

  var hashtagColorMap = [];
  var colorIdx = 0;
  var hashtagExists = false;

  $('.list-card-details > .list-card-title:first-child').each(function () {
    var innerSpan = $(this).clone().children('span');
    var shortId = innerSpan.text();
    var cardTitle = innerSpan.remove().end().text();

    var $card = $(".list-card-details:has(.list-card-title > .card-short-id:contains(" + shortId + "))");
    var hashTags = cardTitle.match(/#[\w-]+/g);
    if (hashTags) {
      $.each(hashTags, function (idx, hashTag) {
        if (!hashtagColorMap[hashTag]) {
          hashtagColorMap[hashTag] = ColoredHashtags.colors[colorIdx % ColoredHashtags.colors.length];
          colorIdx++;
        }
        $card.css('background-color', hashtagColorMap[hashTag]).addClass('colored');
      });
      hashtagExists = true;
    } else {
      $card.css('background-color', '');
    }
  });
  return hashtagExists;
}
