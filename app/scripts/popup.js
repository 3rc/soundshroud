if(window.location.toString().indexOf("soundcloud.com") > -1) {

  permahideList = [];
  permahideTitles = [];
  permahideStored = [];
  //get list of hidden songs from Chrome storage area
  chrome.storage.sync.get('permahideStored', function(result) {
    permahideStored = result.permahideStored;
    if(permahideStored.length != 0) {
      permahideList = permahideStored;
    }
    console.log("Loaded " + permahideStored.length + " song(s) from permahide list");
  });
  chrome.storage.sync.get('permahideTitlesStored', function(result) {
    permahideTitlesStored = result.permahideTitlesStored;
    if(permahideStored.length != 0) {
      permahideTitles = permahideTitlesStored;
    }
  });

  //Sets variables to default to re-initialize functionality
  function resetBarStatus() {
    streamBar = false;
    removeReposts = false;
    repostsShown = false;
    repostsInit = false;
    loadedSize = 0;
    permahideMode = false;
    songsToSkip = [];
    songsToSkip.push(permahideTitles)
  }
  resetBarStatus();

  var permahideTooltip = "<div class='permahide-tooltip'>Click on any sound to \n add to your hidden list</div>"

  //Check the URL of SC page to determine appropriate function bar
  function checkSCPage() {
    if(window.location.toString().indexOf("/stream") > -1) {
      addStreamBar()
      mainStream = $(".stream");
    }
    else {
      $(".soundshroud-bar").remove();
      $(".permahide-tooltip").remove();
      resetBarStatus();
    }
  }

  //checks every 3 seconds if the URL has changed
  setInterval(function() {
    checkSCPage()
  }, 3000);

  //checks every 3 seconds if reposts need to be removed
  setInterval(function() {
    checkStreamSize()
  }, 3000)

  //Adds the Stream Bar for removing reposts, etc.
  function addStreamBar() {
    if(window.streamBar == false) {
      resetBarStatus();
      $("header").append("<div class='soundshroud-bar'><h2 id='soundshroud'>SoundShroud v1.0</h2>" + "<div class='soundshroud-functions'>" +
        "<label>Remove Reposts: <input type='checkbox' class='ios-switch' id='remove-reposts'><div class='switch'></div></label>" + 
        "<label>Perma-Hide: <input type='checkbox' class='ios-switch' id='permahide'><div class='switch'></div></label>" +
        // "<label><input type='checkbox' class='ios-switch' id='filter-comments'><div class='switch'></div>Filter Comments</label>" +
        "</div><p><button id='reset-permahide'>Reset Hidden List</button> <button id='hide-bar'>Hide This Bar</button></p></div>");
      $("#remove-reposts").click(function() {
        if(removeReposts == false && repostsShown == false) {
          removeReposts = true
          killReposts(mainStream)
          console.log("Remove reposts active")
        }
        else {
          removeReposts = false
          console.log("Remove reposts inactive")
        }
      });
      $("#hide-bar").click(function() {
        $(".soundshroud-bar").remove();
      });
      $("#permahide").click(function() {
        togglePermahide()
      });
      $("#reset-permahide").click(function() {
        chrome.storage.sync.clear()
        permahideList = [];
      })
      window.streamBar = true;
      window.removeReposts = false
    }
    else if(streamBar == true) {
      $(".soundshroud-bar").show()
    }
  }

  //Checks number of sounds in the stream 
  function checkStreamSize() {
    var currentSize = $(".soundList__item").length
    if(currentSize !== loadedSize) {
      killPermahide(mainStream)
      if(permahideMode == true) {
        if(currentSize >= loadedSize) {
          $("#permahide").trigger("click")
        }
      }
      if(removeReposts == true) {
        killReposts(mainStream)
      }
      loadedSize = currentSize
    }
  }

  //Removes selected hidden tracks from the stream
  function killPermahide() {
    for(i = 0; permahideList.length > i; i++) {
      $("a[href='" + permahideList[i] +"']").parent().parent().parent().remove()
    }
  }

  //Removes reposts from the stream
  function killReposts() {
    if(repostsInit == false) {
      $(".l-content").append("<div class='stream-reposts hidden'></div>")
    }
    repostsInit = true;
    $(".stream-reposts").append($(".sound__header:contains('Reposted')").parent().parent().parent());

    var reposts = $(".stream-reposts").find(".soundTitle__title");

    for( i = 0; i < reposts.length; i++) {
      songsToSkip.push(reposts[i].innerText)
    }
    songsToSkip = _.uniq(songsToSkip)

    $(".stream-reposts").remove()
    $(".l-content").append("<div class='stream-reposts hidden'></div>")

  }

  //Adds the selected track to local DB to be permanently ignored, and remote DB for stat counting.
  function togglePermahide() {
    if(permahideMode == true) {
      permahideMode = false
      $(".permahide-tooltip").remove()
      $(".soundList__item").removeClass("hide-overlay")
    }
    else {
      $(".soundList__item").click(function(e) {
        if(permahideMode == true) {
          var songUrl = $(this).find(".soundTitle__title").attr("href")
          var songTitle = $(this).find(".soundTitle__title").children("span").text()
          console.log("Added to permahide list: " + songTitle)
          permahideList.push(songUrl)
          permahideTitles.push(songTitle)
          songsToSkip.push(songTitle)
          chrome.storage.sync.set({'permahideStored': permahideList}, function() {})
          chrome.storage.sync.set({'permahideTitlesStored': permahideTitles}, function() {})
          e.preventDefault()
          $(this).remove()
        }
      })
      permahideMode = true
      $("body").append(permahideTooltip)
      $(".soundList__item").addClass("hide-overlay")
    }

  }

  //Checks the currently playing sound against the removed sounds
  setInterval(function() {
    var nowPlaying = $("a.playbackTitle__link").text();
    if(nowPlaying != "") {
      songsToSkip = _.uniq(songsToSkip);
      for( i = 0; i < songsToSkip.length; i++ ) {
        if(songsToSkip[i].indexOf(nowPlaying) > -1) {
          $(".skipControl__next").trigger("click")
        }
      }
    }
  }, 800)

}
