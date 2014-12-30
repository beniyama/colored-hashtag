(function () {
  "use strict";

  if (!localStorage.trello_token) {
    Trello.authorize({
      type: "popup",
      name: "Colored Stories for Trello",
      expiration: "never",
      success: function () {
        startDecoration();
      }
    });
  } else {
    startDecoration();
  }
})();

function startDecoration() {
  'use strict';
  var pathName = window.location.pathname;
  var match = pathName.match(new RegExp("/b/([a-zA-Z0-9]+)/"));
  if (!match) {
    return;
  }
  var boardId = match[1];
  var board = Trello.get(
    "/boards/" + boardId + "/cards",
    {token: localStorage.trello_token},
    function (cards) {
      var storyCardMap = [];

      $.each(cards, function (ix, card) {
        if (card.name) {
          var storyIds = card.name.match(/#[0-9]+/g);
          if (storyIds) {
            $.each(storyIds, function (iy, storyId) {
              if (!storyCardMap[storyId]) {
                storyCardMap[storyId] = [];
              }
              storyCardMap[storyId].push(card.idShort);
            });
          }
        }
      });

      var colors = randomColor({luminosity: 'light', count: Object.keys(storyCardMap).length});
      var index = 0;
      for (var storyId in storyCardMap) {
        var cardIds = storyCardMap[storyId];

        console.log(cardIds);

        for (var i = 0; i < cardIds.length; i++) {
          $(".list-card-details:has(.list-card-title > .card-short-id:contains(" + cardIds[i] + " ))").css('background', colors[index]);

          console.log($(".list-card-details:has(.list-card-title > .card-short-id:contains(" + cardIds[i] + " ))"));
        }
        index++;
      }


      console.log(storyCardMap);
      console.log(colors);
    }
  );
}