function initNotifications() {
  fetchNotificationsCount(),
    markNotificationsAsRead(),
    initReactions(),
    listenForNotificationsBellClick(),
    initPagination(),
    initLoadMoreButton();
}
function markNotificationsAsRead() {
  setTimeout(function() {
    if (document.getElementById("notifications-container")) {
      var e,
        t = window.location.pathname.split("/"),
        n = parseInt(t[t.length - 1].replace(/[^0-9]/g, ""), 10);
      (e = window.XMLHttpRequest
        ? new XMLHttpRequest()
        : new ActiveXObject(
            "Microsoft.XMLHTTP"
          )).onreadystatechange = function() {};
      var o = document.querySelector("meta[name='csrf-token']").content;
      Number.isInteger(n)
        ? e.open("Post", "/notifications/reads?org_id=" + n, !0)
        : e.open("Post", "/notifications/reads", !0),
        e.setRequestHeader("X-CSRF-Token", o),
        e.send();
    }
  }, 450);
}
function fetchNotificationsCount() {
  null == document.getElementById("notifications-container") &&
    checkUserLoggedIn() &&
    instantClick &&
    (InstantClick.removeExpiredKeys("force"),
    setTimeout(function() {
      InstantClick.preload(
        document.getElementById("notifications-link").href,
        "force"
      );
    }, 30));
}
function initReactions() {
  setTimeout(function() {
    if (document.getElementById("notifications-container")) {
      for (
        var e = document.getElementsByClassName("reaction-button"), t = 0;
        t < e.length;
        t++
      ) {
        e[t].onclick = function(e) {
          function t(e) {
            "create" === e.result
              ? n.classList.add("reacted")
              : n.classList.remove("reacted");
          }
          e.preventDefault(), sendHapticMessage("medium");
          var n = this;
          n.classList.add("reacted");
          var o = new FormData();
          o.append("reactable_type", n.dataset.reactableType),
            o.append("category", n.dataset.category),
            o.append("reactable_id", n.dataset.reactableId),
            getCsrfToken()
              .then(sendFetch("reaction-creation", o))
              .then(function(e) {
                200 === e.status && e.json().then(t);
              });
        };
      }
      for (
        e = document.getElementsByClassName("toggle-reply-form"), t = 0;
        t < e.length;
        t++
      ) {
        e[t].onclick = function(e) {
          e.preventDefault();
          var t = this;
          document
            .getElementById("comment-form-for-" + t.dataset.reactableId)
            .classList.add("showing"),
            (t.innerHTML = ""),
            setTimeout(function() {
              document
                .getElementById("comment-textarea-for-" + t.dataset.reactableId)
                .focus();
            }, 30);
        };
      }
    }
  }, 180);
}
function listenForNotificationsBellClick() {
  setTimeout(function() {
    document.getElementById("notifications-link").onclick = function() {
      document
        .getElementById("notifications-number")
        .classList.remove("showing");
    };
  }, 180);
}
function initPagination() {
  const e = document.getElementsByClassName("notifications-paginator");
  if (e && e.length > 0) {
    const t = e[e.length - 1];
    t &&
      window
        .fetch(t.dataset.paginationPath, {
          method: "GET",
          credentials: "same-origin"
        })
        .then(function(e) {
          200 === e.status &&
            e.text().then(function(e) {
              const n = e.trim();
              if (n) {
                const e = document.getElementById("articles-list"),
                  o = document.createElement("div");
                (o.innerHTML = n), t.remove(), e.append(o), initReactions();
              } else {
                const e = document.getElementById("load-more-button");
                e && (e.style.display = "none"), t.remove();
              }
            });
        });
  }
}
function initLoadMoreButton() {
  const e = document.getElementById("load-more-button");
  e && e.addEventListener("click", initPagination);
}
function fetchNext(e, t, n) {
  var o = JSON.parse(e.dataset.params),
    i = Object.keys(o)
      .map(function(e) {
        return encodeURIComponent(e) + "=" + encodeURIComponent(o[e]);
      })
      .join("&");
  if (!(i.indexOf("q=") > -1)) {
    var r = (
      t +
      "?page=" +
      nextPage +
      "&" +
      i +
      "&signature=" +
      parseInt(Date.now() / 4e5, 10)
    ).replace("&&", "&");
    window
      .fetch(r)
      .then(function(e) {
        e.json().then(function(e) {
          (nextPage += 1),
            n(e),
            0 === e.length &&
              ((document.getElementById("loading-articles").style.display =
                "none"),
              (done = !0));
        });
      })
      ["catch"](function(e) {
        console.log(e);
      });
  }
}
function insertNext(e, t) {
  return function(n) {
    document.getElementById(e.listId || "sublist");
    var o = "";
    n.forEach(function(n) {
      if (!document.getElementById((e.elId || "element") + "-" + n.id)) {
        var i = t(n);
        o += i;
      }
    });
    document.documentElement.scrollHeight, document.body.scrollTop;
    var i = document.createElement("div");
    i.innerHTML = o;
    var r = document.getElementsByClassName("single-article");
    insertAfter(i, r[r.length - 1]), nextPage > 0 && (fetching = !1);
  };
}
function buildFollowsHTML(e) {
  return (
    '<div id="follows-' +
    e.id +
    '" class="single-article">\n  <a href="' +
    e.path +
    '" class="block-link">\n    <h2>\n      <img alt="' +
    e.username +
    ' profile image" src="' +
    e.profile_image +
    '" />\n        ' +
    e.name +
    '\n      <span class="dashboard-username">@' +
    e.username +
    "</span>\n    </h2>\n  </a>\n</div>"
  );
}
function buildTagsHTML(e) {
  var t = "";
  return (
    e.points < 0 &&
      -1 === negativeFollow &&
      ((t += "<h2>Negative Tags (anti-follows)</h2>"), (negativeFollow = 0)),
    t +
      '<div id="follows-' +
      e.id +
      '" class="single-article" style="border-color:' +
      e.color +
      ";box-shadow: 3px 3px 0px " +
      e.color +
      '">\n   <h2>\n     <a href="/t/' +
      e.name +
      '">\n       ' +
      e.name +
      '\n     </a>\n     <form class="edit_follow" id="edit_follow_' +
      e.id +
      '" action="/follows/' +
      e.id +
      '" accept-charset="UTF-8" method="post">\n       <input name="utf8" type="hidden" value="\u2713">\n       <input type="hidden" name="_method" value="patch">\n       <input type="hidden" name="authenticity_token" value="' +
      e.token +
      '">\n       <label for="follow_points">Follow Weight:</label>\n       <input step="any" required="required" type="number" value="' +
      e.points +
      '" name="follow[points]" id="follow_points">\n       <input type="submit" name="commit" value="Submit">\n     </form>\n   </h2>\n</div>'
  );
}
function fetchNextFollowingPage(e) {
  var t = JSON.parse(e.dataset.params).action;
  t.includes("users")
    ? fetchNext(
        e,
        "/api/followings/users",
        insertNext({ elId: "follows" }, buildFollowsHTML)
      )
    : t.includes("podcasts")
    ? fetchNext(
        e,
        "/api/followings/podcasts",
        insertNext({ elId: "follows" }, buildFollowsHTML)
      )
    : t.includes("organizations")
    ? fetchNext(
        e,
        "/api/followings/organizations",
        insertNext({ elId: "follows" }, buildFollowsHTML)
      )
    : fetchNext(
        e,
        "/api/followings/tags",
        insertNext({ elId: "follows" }, buildTagsHTML)
      );
}
function fetchNextFollowersPage(e) {
  JSON.parse(e.dataset.params).which.includes("organization")
    ? fetchNext(
        e,
        "/api/followers/organizations",
        insertNext({ elId: "follows" }, buildFollowsHTML)
      )
    : fetchNext(
        e,
        "/api/followers/users",
        insertNext({ elId: "follows" }, buildFollowsHTML)
      );
}
function buildVideoArticleHTML(e) {
  return (
    '<a class="single-video-article single-article" href="' +
    e.path +
    '" id="video-article-' +
    e.id +
    '">\n  <div class="video-image" style="background-image: url(' +
    e.cloudinary_video_url +
    ')">\n     <span class="video-timestamp">' +
    e.video_duration_in_minutes +
    "</span>\n   </div>\n   <p><strong>" +
    e.title +
    "</strong></p>\n  <p>" +
    e.user.name +
    "</p>\n</a>"
  );
}
function insertVideos(e) {
  document.getElementById("subvideos");
  var t = "";
  e.forEach(function(e) {
    if (!document.getElementById("video-article-" + e.id)) {
      var n = buildVideoArticleHTML(e);
      t += n;
    }
  });
  document.documentElement.scrollHeight, document.body.scrollTop;
  var n = document.createElement("div");
  (n.innerHTML = t), (n.className += "video-collection");
  var o = document.getElementsByClassName("single-article");
  insertAfter(n, o[o.length - 1]), nextPage > 0 && (fetching = !1);
}
function fetchNextVideoPage(e) {
  fetchNext(e, "/api/videos", insertVideos);
}
function insertArticles(e) {
  document.getElementById("substories");
  var t = "",
    n = document.getElementById("home-articles-object");
  n && (n.outerHTML = ""),
    e.forEach(function(e) {
      var n = document.getElementById("article-link-" + e.id);
      if (
        n &&
        n.parentElement &&
        n.parentElement.classList.contains("single-article-small-pic") &&
        !document.getElementById("video-player-" + e.id)
      )
        n.parentElement.outerHTML = buildArticleHTML(e);
      else if (!n) {
        var o = buildArticleHTML(e);
        (t += o), initializeReadingListIcons();
      }
    });
  document.documentElement.scrollHeight, document.body.scrollTop;
  var o = document.createElement("div");
  o.innerHTML = t;
  var i = document.getElementsByClassName("single-article");
  insertAfter(o, i[i.length - 1]), nextPage > 0 && (fetching = !1);
}
function fetchNextPodcastPage(e) {
  fetchNext(e, "/api/podcast_episodes", insertArticles);
}
function algoliaPaginate(e) {
  var t = [];
  e && e.length > 0 && t.push(e);
  var n,
    o = {
      hitsPerPage: 15,
      page: nextPage,
      attributesToHighlight: [],
      tagFilters: t
    },
    i = document.getElementById("index-container");
  "base-feed" === i.dataset.feed
    ? (n = client.initIndex("ordered_articles_production"))
    : "latest" === i.dataset.feed
    ? (n = client.initIndex("ordered_articles_by_published_at_production"))
    : ((o.filters = "published_at_int > " + i.dataset.articlesSince),
      (n = client.initIndex(
        "ordered_articles_by_positive_reactions_count_production"
      ))),
    n.search("*", o).then(function(e) {
      (nextPage += 1), insertArticles(e.hits);
      const t = new CustomEvent("checkBlockedContent");
      window.dispatchEvent(t),
        0 === e.hits.length &&
          ((document.getElementById("loading-articles").style.display = "none"),
          (done = !0));
    });
}
function fetchNextPageIfNearBottom() {
  var e = document.getElementById("index-container");
  if (e && !document.getElementById("query-wrapper")) {
    var t,
      n,
      o = e.dataset.which;
    "podcast-episodes" === o
      ? ((n = "articles-list"),
        (t = function() {
          fetchNextPodcastPage(e);
        }))
      : "videos" === o
      ? ((n = "video-collection"),
        (t = function() {
          fetchNextVideoPage(e);
        }))
      : "followers" === o
      ? ((n = "user-dashboard"),
        (t = function() {
          fetchNextFollowersPage(e);
        }))
      : "following" === o
      ? ((n = "user-dashboard"),
        (t = function() {
          fetchNextFollowingPage(e);
        }))
      : ((n = "articles-list"),
        (t = function() {
          algoliaPaginate(e.dataset.algoliaTag);
        }));
    var i = document.getElementById(n);
    !done &&
      !fetching &&
      window.scrollY > i.scrollHeight - 3700 &&
      ((fetching = !0), t());
  }
}
function checkIfNearBottomOfPage() {
  (client = algoliasearch(
    "YE5Y9R600C",
    "YWVlZGM3YWI4NDg3Mjk1MzJmMjcwNDVjMjIwN2ZmZTQ4YTkxOGE0YTkwMzhiZTQzNmM0ZGFmYTE3ZTI1ZDFhNXJlc3RyaWN0SW5kaWNlcz1zZWFyY2hhYmxlc19wcm9kdWN0aW9uJTJDVGFnX3Byb2R1Y3Rpb24lMkNvcmRlcmVkX2FydGljbGVzX3Byb2R1Y3Rpb24lMkNDbGFzc2lmaWVkTGlzdGluZ19wcm9kdWN0aW9uJTJDb3JkZXJlZF9hcnRpY2xlc19ieV9wdWJsaXNoZWRfYXRfcHJvZHVjdGlvbiUyQ29yZGVyZWRfYXJ0aWNsZXNfYnlfcG9zaXRpdmVfcmVhY3Rpb25zX2NvdW50X3Byb2R1Y3Rpb24lMkNvcmRlcmVkX2NvbW1lbnRzX3Byb2R1Y3Rpb24="
  )),
    document.getElementsByClassName("single-article").length < 2 ||
    window.location.search.indexOf("q=") > -1
      ? ((document.getElementById("loading-articles").style.display = "none"),
        (done = !0))
      : (document.getElementById("loading-articles").style.display = "block"),
    fetchNextPageIfNearBottom(),
    setInterval(function() {
      fetchNextPageIfNearBottom();
    }, 210);
}
function initScrolling() {
  document.getElementById("index-container") &&
    ((initScrolling.called = !0), checkIfNearBottomOfPage());
}
function initializeAdditionalContentBoxes() {
  var e = document.getElementById("additional-content-area");
  if (e) {
    var t = new Date()
        .getTime()
        .toString()
        .substring(0, 4),
      n = userData(),
      o = "include_sponsors";
    n && !n.display_sponsors && (o = "do_not_include_sponsors"),
      window
        .fetch(
          "/additional_content_boxes?article_id=" +
            e.dataset.articleId +
            "&signature=" +
            t +
            "&state=" +
            o,
          { method: "GET", credentials: "same-origin" }
        )
        .then(t => {
          200 === t.status &&
            t.text().then(t => {
              (e.innerHTML = t),
                initializeReadingListIcons(),
                initializeAllFollowButts(),
                initializeSponsorshipVisibility();
            });
        });
  }
}
function showChatModal(e) {
  (e.style.display = "block"), document.getElementById("new-message").focus();
}
function hideChatModal(e) {
  e.style.display = "none";
}
function toggleModal() {
  var e = document.querySelector(".modal");
  "none" === e.style.display ? showChatModal(e) : hideChatModal(e);
}
function initModal() {
  var e = document.querySelector(".modal");
  e.querySelector(".close-modal").addEventListener("click", toggleModal),
    e.querySelector(".overlay").addEventListener("click", toggleModal);
}
function handleChatButtonPress(e) {
  var t = document.getElementById("new-message").value,
    n = JSON.parse(e.dataset.info),
    o = new FormData();
  0 !== t.replace(/\s/g, "").length &&
    (o.append("user_id", n.id),
    o.append("message", t),
    o.append("controller", "chat_channels"),
    getCsrfToken()
      .then(sendFetch("chat-creation", o))
      .then(() => {
        window.location.href = `/connect/@${n.username}`;
      }));
}
function addButtonClickHandle(e, t, n) {
  var o = document.getElementById("user-connect-redirect"),
    i = document.getElementById("new-message-form");
  t.classList.add("showing"),
    "open" === n.showChat && "mutual" !== e
      ? (o.removeAttribute("href"),
        t.addEventListener("click", toggleModal),
        (t.style.display = "initial"),
        (o.style.display = "initial"),
        (i.onsubmit = () => (handleChatButtonPress(i), !1)))
      : "mutual" === e &&
        (t.removeEventListener("click", toggleModal),
        (t.style.display = "initial"),
        (o.style.display = "initial"));
}
function fetchButton(e, t) {
  var n;
  ((n = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject("Microsoft.XMLHTTP")).onreadystatechange = () => {
    n.readyState === XMLHttpRequest.DONE &&
      200 === n.status &&
      addButtonClickHandle(n.response, e, t);
  }),
    n.open("GET", "/follows/" + t.id + "?followable_type=" + t.className),
    n.send();
}
function initializeChatButton(e, t) {
  var n = userData();
  null !== n && n.id !== t.id && fetchButton(e, t);
}
function initializeAllChatButtons() {
  var e,
    t = document.getElementsByClassName("chat-action-button"),
    n = document.getElementById("new-message-form");
  if (n) {
    var o = JSON.parse(n.dataset.info);
    for (initModal(), e = 0; e < t.length; e += 1)
      initializeChatButton(t[e], o);
  }
}
function initializeAllFollowButts() {
  for (
    var e = document.getElementsByClassName("follow-action-button"), t = 0;
    t < e.length;
    t++
  )
    initializeFollowButt(e[t]);
}
function initializeFollowButt(e) {
  var t = userData(),
    n = JSON.parse(e.dataset.info);
  "logged-out" !==
  document.getElementsByTagName("body")[0].getAttribute("data-user-status")
    ? "Tag" === n.className && t
      ? handleTagButtAssignment(t, e, n)
      : "fetched" !== e.dataset.fetched && fetchButt(e, n)
    : addModalEventListener(e);
}
function addModalEventListener(e) {
  assignState(e, "login"),
    (e.onclick = function(e) {
      e.preventDefault(), showModal("follow-button");
    });
}
function fetchButt(e, t) {
  var n;
  (e.dataset.fetched = "fetched"),
    ((n = window.XMLHttpRequest
      ? new XMLHttpRequest()
      : new ActiveXObject(
          "Microsoft.XMLHTTP"
        )).onreadystatechange = function() {
      n.readyState === XMLHttpRequest.DONE &&
        200 === n.status &&
        addButtClickHandle(n.response, e);
    }),
    n.open("GET", "/follows/" + t.id + "?followable_type=" + t.className, !0),
    n.send();
}
function addButtClickHandle(e, t) {
  JSON.parse(t.dataset.info);
  assignInitialButtResponse(e, t),
    (t.onclick = function(e) {
      e.preventDefault(), handleOptimisticButtRender(t);
    });
}
function handleTagButtAssignment(e, t, n) {
  addButtClickHandle(
    -1 !==
      JSON.parse(e.followed_tags)
        .map(function(e) {
          return e.id;
        })
        .indexOf(n.id)
      ? "true"
      : "false",
    t
  ),
    (shouldNotFetch = !0);
}
function assignInitialButtResponse(e, t) {
  t.classList.add("showing"),
    assignState(
      t,
      "true" === e || "mutual" === e
        ? "unfollow"
        : "follow-back" === e
        ? "follow-back"
        : "false" === e
        ? "follow"
        : "self" === e
        ? "self"
        : "login"
    );
}
function handleOptimisticButtRender(e) {
  if ("self" === e.dataset.verb) window.location.href = "/settings";
  else if ("login" === e.dataset.verb) showModal("follow-button");
  else {
    try {
      var t = JSON.parse(e.dataset.info).id,
        n = e.dataset.verb;
      document.querySelectorAll(".follow-action-button").forEach(function(e) {
        try {
          if (e.dataset.info) {
            var o = JSON.parse(e.dataset.info).id;
            o && o === t && assignState(e, n);
          }
        } catch (i) {
          return;
        }
      });
    } catch (o) {
      return;
    }
    handleFollowButtPress(e);
  }
}
function handleFollowButtPress(e) {
  var t = JSON.parse(e.dataset.info),
    n = new FormData();
  n.append("followable_type", t.className),
    n.append("followable_id", t.id),
    n.append("verb", e.dataset.verb),
    getCsrfToken().then(sendFetch("follow-creation", n));
}
function assignState(e, t) {
  var n = JSON.parse(e.dataset.info).style;
  e.classList.add("showing"),
    "follow" === t || "follow-back" === t
      ? ((e.dataset.verb = "unfollow"),
        e.classList.remove("following-butt"),
        "follow-back" === t
          ? addFollowText(e, t)
          : "follow" === t && addFollowText(e, n))
      : "login" === t
      ? addFollowText(e, n)
      : "self" === t
      ? ((e.dataset.verb = "self"), (e.textContent = "EDIT PROFILE"))
      : ((e.dataset.verb = "follow"),
        addFollowingText(e, n),
        e.classList.add("following-butt"));
}
function addFollowText(e, t) {
  e.textContent =
    "small" === t ? "+" : "follow-back" === t ? "+ FOLLOW BACK" : "+ FOLLOW";
}
function addFollowingText(e, t) {
  e.textContent = "small" === t ? "\u2713" : "\u2713 FOLLOWING";
}
function initializeAllTagEditButtons() {
  var e = document.getElementById("tag-edit-button"),
    t = userData();
  t &&
    e &&
    t.moderator_for_tags.indexOf(e.dataset.tag) > -1 &&
    ((e.style.display = "inline-block"),
    (document.getElementById("tag-mod-button").style.display = "inline-block"));
}
function archivedPosts() {
  return document.getElementsByClassName("single-article-archived");
}
function showArchivedPosts() {
  for (var e = archivedPosts(), t = 0; t < e.length; t += 1)
    e[t].classList.remove("hidden");
}
function hideArchivedPosts() {
  for (var e = archivedPosts(), t = 0; t < e.length; t += 1)
    e[t].classList.add("hidden");
}
function toggleArchivedPosts(e) {
  var t = e.target;
  t.innerHTML.match(/Show/)
    ? ((t.innerHTML = "Hide Archived"), showArchivedPosts())
    : ((t.innerHTML = "Show Archived"), hideArchivedPosts());
}
function initializeArchivedPostFilter() {
  var e = document.getElementById("toggleArchivedLink");
  e && e.addEventListener("click", toggleArchivedPosts);
}
function initializeArticleDate() {
  addLocalizedDateTimeToElementsTitles(
    document.querySelectorAll(
      ".single-article time, article time, .single-other-article time"
    ),
    "datetime"
  );
}
function setReactionCount(e, t) {
  var n = document.getElementById("reaction-butt-" + e).classList,
    o = document.getElementById("reaction-number-" + e);
  t > 0
    ? (n.add("activated"), (o.textContent = t))
    : (n.remove("activated"), (o.textContent = "0"));
}
function showUserReaction(e, t) {
  document
    .getElementById("reaction-butt-" + e)
    .classList.add("user-activated", t);
}
function hideUserReaction(e) {
  document
    .getElementById("reaction-butt-" + e)
    .classList.remove("user-activated", "user-animated");
}
function hasUserReacted(e) {
  return document
    .getElementById("reaction-butt-" + e)
    .classList.contains("user-activated");
}
function getNumReactions(e) {
  var t = document.getElementById("reaction-number-" + e).textContent;
  return "" === t ? 0 : parseInt(t, 10);
}
function reactToArticle(e, t) {
  function n() {
    var e = getNumReactions(t);
    hasUserReacted(t)
      ? (hideUserReaction(t), setReactionCount(t, e - 1))
      : (showUserReaction(t, "user-animated"), setReactionCount(t, e + 1));
  }
  function o() {
    var n = new FormData();
    return (
      n.append("reactable_type", "Article"),
      n.append("reactable_id", e),
      n.append("category", t),
      n
    );
  }
  var i = document
    .getElementsByTagName("body")[0]
    .getAttribute("data-user-status");
  sendHapticMessage("medium"),
    "logged-out" !== i
      ? (n(),
        (document.getElementById("reaction-butt-" + t).disabled = !0),
        getCsrfToken()
          .then(sendFetch("reaction-creation", o()))
          .then(e =>
            200 === e.status
              ? e.json().then(() => {
                  document.getElementById("reaction-butt-" + t).disabled = !1;
                })
              : (n(),
                (document.getElementById("reaction-butt-" + t).disabled = !1),
                undefined)
          )
          ["catch"](() => {
            n(), (document.getElementById("reaction-butt-" + t).disabled = !1);
          }))
      : showModal("react-to-article");
}
function setCollectionFunctionality() {
  if (document.getElementById("collection-link-inbetween"))
    for (
      var e = document.getElementsByClassName("collection-link-inbetween"),
        t = e.length,
        n = 0;
      n < e.length;
      n += 1
    )
      e[n].onclick = n => {
        n.preventDefault();
        for (
          var o = document.getElementsByClassName("collection-link-hidden"),
            i = o.length,
            r = 0;
          r < i;
          r += 1
        )
          o[0].classList.remove("collection-link-hidden");
        for (var a = 0; a < t; a += 1)
          e[0].className = "collection-link-hidden";
      };
}
function requestReactionCounts(e) {
  var t;
  ((t = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject("Microsoft.XMLHTTP")).onreadystatechange = () => {
    if (t.readyState === XMLHttpRequest.DONE) {
      var e = JSON.parse(t.response);
      e.article_reaction_counts.forEach(e => {
        setReactionCount(e.category, e.count);
      }),
        e.reactions.forEach(e => {
          document.getElementById("reaction-butt-" + e.category) &&
            showUserReaction(e.category, "not-user-animated");
        });
    }
  }),
    t.open("GET", "/reactions?article_id=" + e, !0),
    t.send();
}
function jumpToComments() {
  document.getElementById("jump-to-comments").onclick = e => {
    e.preventDefault(),
      document
        .getElementById("comments")
        .scrollIntoView({ behavior: "instant", block: "start" });
  };
}
function initializeArticleReactions() {
  setCollectionFunctionality(),
    setTimeout(() => {
      var e;
      document.getElementById("article-body") &&
        ((e = document.getElementById("article-body").dataset.articleId),
        document.getElementById("article-reaction-actions") &&
          requestReactionCounts(e));
      for (
        var t = document.getElementsByClassName("article-reaction-butt"), n = 0;
        n < t.length;
        n += 1
      )
        t[n].onclick = function() {
          reactToArticle(e, this.dataset.category);
        };
      document.getElementById("jump-to-comments") && jumpToComments();
    }, 3);
}
function initializeBaseTracking() {
  var e = 0,
    t = !1,
    n = setInterval(function() {
      var o, i, r, a, s, c, l;
      t ||
        ((o = window),
        (i = document),
        (r = "script"),
        (a = "//www.google-analytics.com/analytics.js"),
        (s = "ga"),
        (o.GoogleAnalyticsObject = s),
        (o[s] =
          o[s] ||
          function() {
            (o[s].q = o[s].q || []).push(arguments);
          }),
        (o[s].l = 1 * new Date()),
        (c = i.createElement(r)),
        (l = i.getElementsByTagName(r)[0]),
        (c.async = 1),
        (c.src = a),
        l.parentNode.insertBefore(c, l)),
        (t = !0),
        e++,
        window.ga &&
          ga.create &&
          (ga("create", "UA-71991109-1", "auto"),
          ga("set", "anonymizeIp", !0),
          ga("send", "pageview", location.pathname + location.search),
          clearInterval(n),
          logImpressions()),
        e > 85 && (clearInterval(n), fallbackActivityRecording());
    }, 25);
  eventListening(), trackCustomImpressions();
}
function fallbackActivityRecording() {
  var e = document.querySelector("meta[name='csrf-token']");
  if (e) {
    var t = e.getAttribute("content"),
      n = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      ),
      o = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      ),
      i = window.screen.availWidth,
      r = window.screen.availHeight,
      a = {
        path: location.pathname + location.search,
        user_language: navigator.language,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        viewport_size: o + "x" + n,
        screen_resolution: r + "x" + i,
        document_title: document.title,
        document_encoding: document.characterSet,
        document_path: location.pathname + location.search
      };
    window.fetch("/fallback_activity_recorder", {
      method: "POST",
      headers: { Accept: "application/json", "X-CSRF-Token": t },
      body: JSON.stringify(a),
      credentials: "same-origin"
    });
  }
}
function eventListening() {
  var e = document.getElementById("cta-comment-register-now-link");
  e &&
    (e.onclick = function() {
      ga("send", "event", "click", "register-now-click", null, null);
    });
}
function logImpressions() {
  var e = document.getElementById("featured-story-marker");
  if (e) {
    var t = e.dataset.featuredArticle;
    ga("send", "event", "view", "featured-feed-impression", t, null);
  }
}
function trackCustomImpressions() {
  setTimeout(function() {
    var e = document.getElementById("article-body"),
      t = document.querySelector("meta[name='csrf-token']"),
      n = /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i.test(
        navigator.userAgent
      ),
      o = window.innerWidth > 1250,
      i = document.getElementById("article-show-primary-sticky-nav"),
      r = document.getElementById("html-variant-article-show-sidebar");
    if (r && e && t && !n && o) {
      var a = {
          html_variant_id: r.dataset.variantId,
          article_id: e.dataset.articleId
        },
        s = t.getAttribute("content");
      trackHTMLVariantTrial(a, s);
      for (var c = i.querySelectorAll("a,button"), l = 0; l < c.length; l++)
        c[l].addEventListener("click", function() {
          trackHtmlVariantSuccess(a, s);
        });
    }
    var d = document.getElementById("html-variant-article-show-below-article");
    if (d && e && t && !n && o) {
      (a = {
        html_variant_id: d.dataset.variantId,
        article_id: e.dataset.articleId
      }),
        (s = t.getAttribute("content"));
      trackHTMLVariantTrial(a, s);
      for (c = d.querySelectorAll("a,button"), l = 0; l < c.length; l++)
        c[l].addEventListener("click", function() {
          trackHtmlVariantSuccess(a, s);
        });
    }
    if (e && t && !n) {
      var u = Math.floor(10 * Math.random());
      if (!checkUserLoggedIn() && 1 != u) return;
      (a = {
        article_id: e.dataset.articleId,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      }),
        (s = t.getAttribute("content"));
      trackPageView(a, s);
      var m = 0,
        f = setInterval(function() {
          m++;
          var e = document.getElementById("article-body");
          e && checkUserLoggedIn()
            ? trackFifteenSecondsOnPage(e.dataset.articleId, s)
            : clearInterval(f),
            m > 118 && clearInterval(f);
        }, 15e3);
    }
    var p = document.getElementById("sponsorship-arbitrary-display-widget");
    p &&
      t &&
      !n &&
      o &&
      checkUserLoggedIn() &&
      (trackAdImpression((s = t.getAttribute("content")), p),
      p.removeEventListener("click", trackAdClick, !1),
      p.addEventListener("click", function() {
        trackAdClick(s, p);
      }));
  }, 1800);
}
function trackHTMLVariantTrial(e, t) {
  1 === Math.floor(10 * Math.random()) &&
    window.fetch("/html_variant_trials", {
      method: "POST",
      headers: { "X-CSRF-Token": t, "Content-Type": "application/json" },
      body: JSON.stringify(e),
      credentials: "same-origin"
    });
}
function trackHtmlVariantSuccess(e, t) {
  window.fetch("/html_variant_successes", {
    method: "POST",
    headers: { "X-CSRF-Token": t, "Content-Type": "application/json" },
    body: JSON.stringify(e),
    credentials: "same-origin"
  });
}
function trackPageView(e, t) {
  window.fetch("/page_views", {
    method: "POST",
    headers: { "X-CSRF-Token": t, "Content-Type": "application/json" },
    body: JSON.stringify(e),
    credentials: "same-origin"
  });
}
function trackFifteenSecondsOnPage(e, t) {
  window.fetch("/page_views/" + e, {
    method: "PATCH",
    headers: { "X-CSRF-Token": t, "Content-Type": "application/json" },
    credentials: "same-origin"
  });
}
function trackAdImpression(e, t) {
  var n = {
    display_ad_event: {
      display_ad_id: t.dataset.id,
      context_type: "home",
      category: "impression"
    }
  };
  window.fetch("/display_ad_events", {
    method: "POST",
    headers: { "X-CSRF-Token": e, "Content-Type": "application/json" },
    body: JSON.stringify(n),
    credentials: "same-origin"
  });
}
function trackAdClick(e, t) {
  if (!adClicked) {
    var n = {
      display_ad_event: {
        display_ad_id: t.dataset.id,
        context_type: "home",
        category: "click"
      }
    };
    window.fetch("/display_ad_events", {
      method: "POST",
      headers: { "X-CSRF-Token": e, "Content-Type": "application/json" },
      body: JSON.stringify(n),
      credentials: "same-origin"
    });
  }
  adClicked = !0;
}
function initializeUserProfileContent(e) {
  (document.getElementById("sidebar-profile-pic").innerHTML =
    '<img alt="' +
    e.username +
    '" class="sidebar-profile-pic-img" src="' +
    e.profile_image_90 +
    '" />'),
    (document.getElementById("sidebar-profile-name").innerHTML = filterXSS(
      e.name
    )),
    (document.getElementById("sidebar-profile-username").innerHTML =
      "@" + e.username),
    (document.getElementById("sidebar-profile-snapshot-inner").href =
      "/" + e.username);
}
function initializeUserSidebar(e) {
  if (!document.getElementById("sidebar-nav")) return;
  initializeUserProfileContent(e);
  let t = JSON.parse(e.followed_tags);
  const n =
    0 === t.length ? "Follow tags to improve your feed" : "Other Popular Tags";
  (document.getElementById("tag-separator").innerHTML = n),
    t.sort(
      (e, t) =>
        t.points - e.points ||
        t.hotness_score - e.hotness_score ||
        e.name.localeCompare(t.name)
    );
  let o = "";
  t.forEach(e => {
    var t = document.getElementById("default-sidebar-element-" + e.name);
    (o +=
      e.points > 0
        ? '<div class="sidebar-nav-element" id="sidebar-element-' +
          e.name +
          '"><a class="sidebar-nav-link" href="/t/' +
          e.name +
          '"><span class="sidebar-nav-tag-text">#' +
          e.name +
          "</span></a></div>"
        : ""),
      t && t.remove();
  }),
    (document.getElementById("sidebar-nav-followed-tags").innerHTML = o),
    document
      .getElementById("sidebar-nav-default-tags")
      .classList.add("showing");
}
function addRelevantButtonsToArticle(e) {
  var t = document.getElementById("article-show-container");
  if (t)
    if (parseInt(t.dataset.authorId, 10) === e.id) {
      let n = [`<a href="${t.dataset.path}/edit" rel="nofollow">EDIT</a>`];
      !0 === JSON.parse(t.dataset.published) &&
        n.push(`<a href="${t.dataset.path}/manage" rel="nofollow">MANAGE</a>`),
        e.pro &&
          n.push(`<a href="${t.dataset.path}/stats" rel="nofollow">STATS</a>`),
        (document.getElementById("action-space").innerHTML = n.join(""));
    } else
      e.trusted &&
        (document.getElementById("action-space").innerHTML =
          '<a href="' +
          t.dataset.path +
          '/mod" rel="nofollow">MODERATE <span class="post-word">POST</span></a>');
}
function addRelevantButtonsToComments(e) {
  if (document.getElementById("comments-container")) {
    var t = document.getElementsByClassName("comment-actions");
    for (let n = 0; n < t.length; n += 1) {
      let o = t[n];
      const { action: i, commentableUserId: r, userId: a } = o.dataset;
      parseInt(a, 10) === e.id && (o.style.display = "inline-block"),
        "hide-button" === i && parseInt(r, 10) === e.id
          ? (o.style.display = "inline-block")
          : "hide-button" === i &&
            parseInt(r, 10) !== e.id &&
            (o.style.display = "none");
    }
    if (e.trusted) {
      var n = document.getElementsByClassName("mod-actions");
      for (let e = 0; e < n.length; e += 1) {
        let t = n[e];
        (t.className = "mod-actions"), (t.style.display = "inline-block");
      }
    }
  }
}
function initializeBaseUserData() {
  const e = userData(),
    t =
      '<a href="/' +
      e.username +
      '" id="first-nav-link"><div class="option prime-option">@' +
      e.username +
      "</div></a>";
  (document.getElementById("user-profile-link-placeholder").innerHTML = t),
    (document.getElementById("nav-profile-image").src = e.profile_image_90),
    initializeUserSidebar(e),
    addRelevantButtonsToArticle(e),
    addRelevantButtonsToComments(e);
}
function removeExistingCSRF() {
  var e = document.querySelector("meta[name='csrf-token']"),
    t = document.querySelector("meta[name='csrf-param']");
  e && t && (e.parentNode.removeChild(e), t.parentNode.removeChild(t));
}
function fetchBaseData() {
  var e;
  ((e = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject("Microsoft.XMLHTTP")).onreadystatechange = () => {
    if (e.readyState === XMLHttpRequest.DONE) {
      var t = JSON.parse(e.responseText);
      t.token && removeExistingCSRF();
      var n = document.createElement("meta");
      (n.name = "csrf-param"),
        (n.content = t.param),
        document.getElementsByTagName("head")[0].appendChild(n);
      var o = document.createElement("meta");
      (o.name = "csrf-token"),
        (o.content = t.token),
        document.getElementsByTagName("head")[0].appendChild(o),
        (document.getElementsByTagName("body")[0].dataset.loaded = "true"),
        checkUserLoggedIn() &&
          ((document.getElementsByTagName("body")[0].dataset.user = t.user),
          browserStoreCache("set", t.user),
          setTimeout(() => {
            "function" == typeof ga &&
              ga("set", "userId", JSON.parse(t.user).id);
          }, 400));
    }
  }),
    e.open("GET", "/async_info/base_data", !0),
    e.send();
}
function initializeBodyData() {
  fetchBaseData();
}
function initializeCommentDate() {
  addLocalizedDateTimeToElementsTitles(
    document.querySelectorAll(".comment-date time"),
    "datetime"
  );
}
function initializeCommentDropdown() {
  function e() {
    return (
      /iPhone|CriOS|iPad/i.test(navigator.userAgent) ||
      "DEV-Native-ios" === navigator.userAgent
    );
  }
  function t(e) {
    return t => t.classList.remove(e);
  }
  function n(e) {
    return Array.from(document.getElementsByClassName(e));
  }
  function o() {
    const { activeElement: e } = document,
      t = "clipboard-copy" === e.localName ? e.querySelector("input") : e;
    t.focus(), t.setSelectionRange(0, t.value.length), (f.hidden = !1);
  }
  function i() {
    f && (f.hidden = !0);
  }
  function r() {
    const e = document.getElementById("article-copy-link-input");
    e.setSelectionRange(0, e.value.length), document.execCommand("copy"), o();
  }
  function a(e) {
    return !(
      e.target.matches(".dropdown-icon") ||
      e.target.matches(".dropbtn") ||
      e.target.matches("clipboard-copy") ||
      e.target.matches("clipboard-copy input") ||
      e.target.matches("clipboard-copy img") ||
      e.target.parentElement.classList.contains("dropdown-link-row")
    );
  }
  function s() {
    document.removeEventListener("click", d);
  }
  function c() {
    if (e()) {
      const e = document.getElementsByTagName("clipboard-copy")[0];
      e && e.removeEventListener("click", r);
    } else document.removeEventListener("clipboard-copy", o);
  }
  function l() {
    n("showing").forEach(t("showing"));
  }
  function d(e) {
    a(e) && (l(), i(), s());
  }
  function u(t) {
    var n = t.target.parentElement.parentElement.getElementsByClassName(
      "dropdown-content"
    )[0];
    if (n.classList.contains("showing"))
      n.classList.remove("showing"), s(), c(), i();
    else if ((l(), n.classList.add("showing"), e())) {
      const e = document.getElementsByTagName("clipboard-copy")[0];
      document.addEventListener("click", d),
        e && e.addEventListener("click", r);
    } else
      document.addEventListener("click", d),
        document.addEventListener("clipboard-copy", o);
  }
  function m(e) {
    e.addEventListener("click", u);
  }
  const f = document.getElementById("article-copy-link-announcer");
  setTimeout(function() {
    n("dropbtn").forEach(m);
  }, 100);
}
function getAndShowPreview(e, t) {
  function n(n) {
    e.classList.toggle("preview-toggle"),
      t.classList.toggle("preview-loading"),
      t.classList.toggle("preview-toggle"),
      (e.innerHTML = n.processed_html);
  }
  const o = JSON.stringify({ comment: { body_markdown: t.value } });
  getCsrfToken()
    .then(sendFetch("comment-preview", o))
    .then(e => e.json())
    .then(n)
    ["catch"](e => {
      console.log("error!"), console.log(e);
    });
}
function handleCommentPreview(e) {
  e.preventDefault();
  const { form: t } = e.target,
    n = t.querySelector("textarea");
  if ("" !== n.value) {
    const e = t.querySelector(".comment-preview-div"),
      o = t.querySelector(".comment-action-preview");
    o.innerHTML.indexOf("PREVIEW") > -1
      ? (n.classList.toggle("preview-loading"),
        getAndShowPreview(e, n),
        (o.innerHTML = "MARKDOWN"))
      : (e.classList.toggle("preview-toggle"),
        n.classList.toggle("preview-toggle"),
        (o.innerHTML = "PREVIEW"));
  }
}
function initializeCommentPreview() {
  const e = document.getElementById("preview-button");
  e && e.addEventListener("click", handleCommentPreview);
}
function initializeCommentsPage() {
  if (document.getElementById("comments-container")) {
    toggleCodeOfConduct();
    var e = document.getElementById("comments-container").dataset.commentableId,
      t = document.getElementById("comments-container").dataset.commentableType;
    commentableIdList = e.split(",");
    (function() {
      for (var e = 0; e < commentableIdList.length; e++)
        !(function(e) {
          var n;
          ((n = window.XMLHttpRequest
            ? new XMLHttpRequest()
            : new ActiveXObject(
                "Microsoft.XMLHTTP"
              )).onreadystatechange = function() {
            if (n.readyState === XMLHttpRequest.DONE) {
              for (
                var e = JSON.parse(n.response),
                  t = e.reactions,
                  o = document.getElementsByClassName("single-comment-node"),
                  i = e.positive_reaction_counts,
                  r = 0;
                r < t.length;
                r++
              ) {
                (a = document.getElementById(
                  "button-for-comment-" + t[r].reactable_id
                )) && a.classList.add("reacted");
              }
              for (r = 0; r < i.length; r++) {
                var a;
                (a = document.getElementById(
                  "button-for-comment-" + i[r].id
                )) &&
                  i[r].count > 0 &&
                  (document.getElementById("reactions-count-" + i[r].id)
                    ? (document.getElementById(
                        "reactions-count-" + i[r].id
                      ).innerHTML = i[r].count)
                    : (a.innerHTML =
                        a.innerHTML +
                        "<span class='reactions-count' id='reactions-count-" +
                        i[r].id +
                        "'>" +
                        i[r].count +
                        "</span>"));
              }
              for (r = 0; r < o.length; r++)
                if (o[r].dataset.commentAuthorId == e.current_user.id) {
                  o[r].dataset.currentUserComment = "true";
                  var s = o[r].children[0].children[2].children[0],
                    c = document.getElementById(
                      "button-for-comment-" + o[r].dataset.commentId
                    );
                  s &&
                    c &&
                    ((s.className = "current-user-actions"),
                    (s.style.display = "inline-block"),
                    document
                      .getElementById(
                        "button-for-comment-" + o[r].dataset.commentId
                      )
                      .classList.add("reacted"));
                }
            }
          }),
            n.open(
              "GET",
              "/reactions?commentable_id=" +
                commentableIdList[e] +
                "&commentable_type=" +
                t,
              !0
            ),
            n.send();
        })(e);
    })();
    for (
      var n = document.getElementsByClassName("reaction-button"), o = 0;
      o < n.length;
      o++
    ) {
      n[o].onclick = function(e) {
        function t(e) {
          var t = n.children[2];
          "create" === e.result
            ? (n.classList.add("reacted"),
              t && (t.innerHTML = parseInt(t.innerHTML) + 1))
            : (n.classList.remove("reacted"),
              t && (t.innerHTML = parseInt(t.innerHTML) - 1));
        }
        var n = this;
        if (
          (e.preventDefault(),
          sendHapticMessage("medium"),
          "logged-out" !==
            document
              .getElementsByTagName("body")[0]
              .getAttribute("data-user-status"))
        ) {
          n.classList.add("reacted"), (n.disabled = !0);
          var o = new FormData();
          o.append("reactable_type", "Comment"),
            o.append("reactable_id", n.dataset.commentId),
            getCsrfToken()
              .then(sendFetch("reaction-creation", o))
              .then(function(e) {
                (n.disabled = !1), 200 === e.status && e.json().then(t);
              });
        } else showModal("react-to-comment");
      };
    }
    var i = document.getElementsByClassName("toggle-reply-form");
    for (o = 0; o < i.length; o++) {
      i[o].onclick = function(n) {
        if (
          (n.preventDefault(), n.target.classList.contains("thread-indication"))
        )
          return !1;
        if (
          "logged-out" !=
          document
            .getElementsByTagName("body")[0]
            .getAttribute("data-user-status")
        ) {
          var o = n.target.parentNode,
            i = o.dataset.commentId;
          document.getElementById(
            "button-for-comment-" + o.dataset.commentId
          ).style.zIndex = "5";
          var r = setInterval(function() {
            document.querySelector("meta[name='csrf-token']") &&
              (clearInterval(r),
              (o.innerHTML = buildCommentFormHTML(e, t, i)),
              setTimeout(function() {
                o.getElementsByTagName("textarea")[0].focus();
              }, 30));
          }, 1);
          return !1;
        }
        showModal("reply-to-comment");
      };
    }
    var r = document.getElementsByClassName("edit-butt");
    for (o = 0; o < r.length; o++) {
      r[o].onclick = function() {};
    }
    document.getElementById("new_comment") &&
      (document.getElementById("new_comment").onsubmit = handleCommentSubmit);
  }
  listenForDetailsToggle();
}
function toggleCodeOfConduct() {
  var e = userData();
  if (e) {
    var t = e.checked_code_of_conduct,
      n = e.number_of_comments,
      o = document.getElementById("toggle-code-of-conduct-checkbox");
    o &&
      !t &&
      n < 1 &&
      (o.innerHTML =
        '<input type="checkbox" name="checked_code_of_conduct" class="checkbox" required/>                                  <label for="checked_code_of_conduct"/>I\'ve read the <a href="https://dev.to/code-of-conduct">code of conduct</a></label>');
  }
}
function replaceActionButts(e) {
  var t = "",
    n = e.getElementsByClassName("actions")[0];
  "true" == e.dataset.currentUserComment &&
    (t =
      '<a data-no-instant href="' +
      e.parentNode.parentNode.dataset.path +
      '/delete_confirm" class="edit-butt">DELETE</a>                            <a href="' +
      e.parentNode.parentNode.dataset.path +
      '/edit">EDIT</a>'),
    (n.innerHTML =
      '<span class="current-user-actions">' +
      t +
      '</span><a href="#" class="toggle-reply-form">REPLY</a>');
}
function warmNewCommentsArea() {
  var e = "/stories/warm_comments" + window.location.pathname;
  window.fetch(e);
}
function handleCommentSubmit(e) {
  e.preventDefault();
  var t = e.target;
  t.classList.add("submitting");
  var n = document.getElementById("comment-node-" + e.target.dataset.commentId),
    o = JSON.stringify({
      comment: {
        body_markdown: t.getElementsByTagName("textarea")[0].value,
        commentable_id: t.querySelector("#comment_commentable_id").value,
        commentable_type: t.querySelector("#comment_commentable_type").value,
        parent_id: t.querySelector("#comment_parent_id")
          ? t.querySelector("#comment_parent_id").value
          : null
      }
    });
  return (
    getCsrfToken()
      .then(sendFetch("comment-creation", o))
      .then(function(e) {
        return (
          200 === e.status &&
            e.json().then(function(e) {
              var o = document.createElement("div");
              if ("comment already exists" == e.status) return !1;
              if ("errors" == e.status)
                return (
                  alert("There was a problem submitting this comment."), !1
                );
              o.innerHTML = buildCommentHTML(e);
              var i = document.getElementsByTagName("body")[0],
                r = JSON.parse(i.getAttribute("data-user"));
              (r.checked_code_of_conduct = !0),
                (i.dataset.user = JSON.stringify(r));
              var a = t.getElementsByClassName("code-of-conduct")[0];
              a && (a.innerHTML = "");
              var s = document.getElementById("new_comment");
              if (n) {
                replaceActionButts(n),
                  e.depth > 2 &&
                    (n.getElementsByClassName(
                      "toggle-reply-form"
                    )[0].innerHTML = "");
                var c = n.getElementsByClassName("inner-comment")[0];
                c.parentNode.insertBefore(o, c.nextSibling);
              } else if (s) {
                (s = document.getElementById("new_comment")).classList.remove(
                  "submitting"
                );
                const t = document.getElementById("text-area");
                (t.classList = ""), (t.value = e.comment_template || "");
                var l = document.getElementById("preview-div");
                l.classList.add("preview-toggle"), (l.innerHTML = "");
                var d = document.getElementById("comment-trees-container");
                d.insertBefore(o, d.firstChild);
              } else if (document.getElementById("notifications-container")) {
                var u = document.createElement("span");
                (u.innerHTML =
                  '<div class="reply-sent-notice">Reply sent \u2014 <a href="' +
                  e.url +
                  '">Check it out</a></div>'),
                  t.replaceWith(u);
              } else window.location.replace(e.url);
              warmNewCommentsArea(),
                initializeCommentsPage(),
                initializeCommentDate(),
                initializeCommentDropdown();
            }),
          !1
        );
      }),
    !1
  );
}
function handleFocus(e) {
  var t = document
      .getElementsByTagName("body")[0]
      .getAttribute("data-user-status"),
    n = e.target;
  "logged-out" == t
    ? (e.preventDefault(),
      showModal("reply-to-comment"),
      n.blur(),
      setTimeout(function() {
        n.blur(), showModal("reply-to-comment");
      }, 100))
    : handleSizeChange(e);
}
function handleBlur() {
  setTimeout(function() {
    var e = document.getElementById("text-area");
    0 == e.value.length && (e.className = "");
  }, 100);
}
function handleKeyUp(e) {
  handleSizeChange(e);
}
function handleSubmit(e) {
  var t = userData();
  if (t && t.number_of_comments >= 1 && "" !== e.target.value.trim()) {
    var n =
      e.target.parentElement.parentElement.id || e.target.parentElement.id;
    document
      .querySelector("#" + n + ' input[type="submit"].comment-action-button')
      .click();
  }
}
function handleBoldAndItalic(e) {
  var t = e.target,
    n = t.value.substring(t.selectionStart, t.selectionEnd),
    o = t.selectionStart,
    i = e.keyCode === KEY_CODE_B ? "**" : "_";
  replaceSelectedText(t, `${i}${n}${i}`);
  var r = o + i.length;
  t.setSelectionRange(r, r + n.length);
}
function handleLink(e) {
  var t = e.target,
    n = t.value.substring(t.selectionStart, t.selectionEnd),
    o = t.selectionStart;
  replaceSelectedText(t, `[${n}](url)`);
  var i = o + n.length + 3,
    r = i + 3;
  t.setSelectionRange(i, r);
}
function replaceSelectedText(e, t) {
  document.execCommand("insertText", !1, t) ||
    ("function" == typeof e.setRangeText && e.setRangeText(t));
}
function handleKeyDown(e) {
  if (e.ctrlKey || e.metaKey)
    switch (e.keyCode) {
      case KEY_CODE_B:
      case KEY_CODE_I:
        e.preventDefault(), handleBoldAndItalic(e);
        break;
      case KEY_CODE_K:
        e.preventDefault(), handleLink(e);
        break;
      case ENTER_KEY_CODE:
        e.preventDefault(), handleSubmit(e);
    }
}
function handleSizeChange(e) {
  var t = e.target.value.split(/\r*\n/).length;
  document.getElementById("text-area").className =
    t > 11 ? "embiggened-max" : t > 6 ? "embiggened-more" : "embiggened";
}
function validateField(e) {
  document.getElementById("text-area") &&
    "" == document.getElementById("text-area").value && e.preventDefault();
}
function generateUploadFormdata(e) {
  var t = document.querySelector("meta[name='csrf-token']").content,
    n = new FormData();
  return n.append("authenticity_token", t), n.append("image", e[0]), n;
}
function handleImageUpload(e, t) {
  document.getElementById("comments-container").dataset.commentableId;
  e.preventDefault(),
    document.getElementById("image-upload-" + t).click(),
    (document.getElementById("image-upload-" + t).onchange = function() {
      document.getElementById("image-upload-" + t).files.length > 0 &&
        ((document.getElementById("image-upload-file-label-" + t).style.color =
          "#888888"),
        (document.getElementById("image-upload-file-label-" + t).innerHTML =
          "Uploading..."),
        (document.getElementById("image-upload-submit-" + t).value =
          "uploading"),
        setTimeout(function() {
          document
            .getElementById("image-upload-submit-" + t)
            .click(function() {});
        }, 50));
    }),
    (document.getElementById("image-upload-submit-" + t).onclick = function(e) {
      e.preventDefault();
      var n = document.getElementById("image-upload-" + t).files;
      n.length > 0 &&
        getCsrfToken()
          .then(sendFetch("image-upload", generateUploadFormdata(n)))
          .then(function(e) {
            200 === e.status
              ? e.json().then(function(e) {
                  var n = document.getElementById("uploaded-image-" + t),
                    o =
                      (document.getElementById("image-upload-button-" + t),
                      document.getElementById("image-upload-file-label-" + t));
                  (o.style.display = "none"),
                    (n.value = e.links[0]),
                    n.classList.add("showing"),
                    n.select();
                  var i = "Uploaded! Paste into editor";
                  (o.innerHTML = i),
                    (o.style.color = "#00c673"),
                    (o.style.position = "relative"),
                    (o.style.top = "5px");
                })
              : e.json().then(function(e) {
                  var n = e.error || "Invalid file!";
                  (document.getElementById(
                    "image-upload-file-label-" + t
                  ).innerHTML = n),
                    (document.getElementById(
                      "image-upload-file-label-" + t
                    ).style.color = "#e05252"),
                    (document.getElementById(
                      "image-upload-submit-" + t
                    ).style.display = "none");
                });
          })
          ["catch"](function() {});
    });
}
function listenForDetailsToggle() {
  for (
    var e = document.getElementsByTagName("DETAILS"), t = 0;
    t < e.length;
    t++
  )
    e[t].addEventListener("toggle", e => {
      var t = e.target,
        n = t.getElementsByTagName("SPAN")[0],
        o = t.getElementsByClassName("comment-username"),
        i = "";
      o.length > 1 && (i = " + " + (o.length - 1) + " replies");
      var r = o[0].textContent + i;
      t.open ? (n.innerHTML = "&nbsp;") : (n.innerHTML = r),
        t.getElementsByTagName("SUMMARY")[0].blur();
    });
}
function initializeCreditsPage() {
  localizeTimeElements(document.querySelectorAll(".ledger time"), {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
function initializeDashboardSort() {
  document.getElementById("dashhboard_sort") &&
    document.getElementById("dashhboard_sort").addEventListener("change", e => {
      window.location = "/dashboard?sort=" + e.target.value;
    });
}
function initializeDrawerSliders() {
  initializeSwipeGestures.called ||
    ((swipeState = "middle"), initializeSwipeGestures()),
    document.getElementById("on-page-nav-controls") &&
      (document.getElementById("sidebar-bg-left") &&
        (document.getElementById("sidebar-bg-left").onclick = function() {
          (swipeState = "middle"), slideSidebar("left", "outOfView");
        }),
      document.getElementById("sidebar-bg-right") &&
        (document.getElementById("sidebar-bg-right").onclick = function() {
          (swipeState = "middle"), slideSidebar("right", "outOfView");
        }),
      document.getElementById("on-page-nav-butt-left") &&
        (document.getElementById("on-page-nav-butt-left").onclick = function() {
          (swipeState = "left"), slideSidebar("left", "intoView");
        }),
      document.getElementById("on-page-nav-butt-right") &&
        (document.getElementById(
          "on-page-nav-butt-right"
        ).onclick = function() {
          (swipeState = "right"), slideSidebar("right", "intoView");
        }),
      InstantClick.on("change", function() {
        document.getElementsByTagName("body")[0].classList.remove("modal-open"),
          slideSidebar("right", "outOfView"),
          slideSidebar("left", "outOfView");
      }),
      listenForNarrowMenuClick());
}
function listenForNarrowMenuClick() {
  for (
    var e = document.getElementsByClassName("narrow-nav-menu"),
      t = document.getElementById("narrow-feed-butt"),
      n = 0;
    n < e.length;
    n++
  )
    document.getElementById("narrow-nav-menu").classList.remove("showing");
  t &&
    (t.onclick = function() {
      document.getElementById("narrow-nav-menu").classList.add("showing");
    });
  for (n = 0; n < e.length; n++)
    e[n].onclick = function() {
      document.getElementById("narrow-nav-menu").classList.remove("showing");
    };
}
function getFormValues(e) {
  for (
    var t = e.action.match(/\/(\d+)$/)[1],
      n = e.querySelectorAll("input"),
      o = { id: t, article: {} },
      i = 0;
    i < n.length;
    i += 1
  ) {
    var r = n[i],
      a = r.getAttribute("name"),
      s = r.getAttribute("value");
    if (a.match(/\[(.*)\]/)) {
      var c = a.match(/\[(.*)\]$/)[1];
      o.article[c] = s;
    } else o[a] = s;
  }
  return o;
}
function toggleArchived(e, t) {
  "true" === t
    ? e.classList.add("single-article-archived", "hidden")
    : e.classList.remove("single-article-archived");
}
function toggleNotifications(e, t) {
  "Mute Notifications" === t
    ? e.setAttribute("value", "Receive Notifications")
    : e.setAttribute("value", "Mute Notifications");
}
function onXhrSuccess(e, t, n) {
  if (n.article.archived) toggleArchived(t, n.article.archived);
  else {
    var o = e.querySelector('input[type="submit"]');
    toggleNotifications(o, o.getAttribute("value"));
  }
  t.querySelector("ul.ellipsis-menu").classList.add("hidden");
}
function handleFormSubmit(e) {
  e.preventDefault(), e.stopPropagation();
  var t = e.target,
    n = getFormValues(t),
    o = JSON.stringify(n),
    i = new FormData(t).get("_method") || "post",
    r = new XMLHttpRequest();
  r.open(i.toUpperCase(), t.action),
    r.setRequestHeader("Content-Type", "application/json"),
    r.send(o),
    (r.onload = function() {
      var e = t.closest("div.single-article");
      if (200 === r.status) {
        onXhrSuccess(t, e, n);
        var o =
          "Mute Notifications" === n.commit
            ? "Notifications Muted"
            : "Notifications Restored";
        e.querySelector(".dashboard-meta-details").innerHTML = o;
      } else
        e.querySelector(".dashboard-meta-details").innerHTML =
          "Failed to update article.";
    });
}
function initializeFormSubmit() {
  for (
    var e = document.querySelectorAll("ul.ellipsis-menu > li > form"), t = 0;
    t < e.length;
    t += 1
  )
    e[t].addEventListener("submit", handleFormSubmit);
}
function getMenu(e) {
  return e.closest("div.ellipsis-menu").querySelector("ul.ellipsis-menu");
}
function hideIfNotAlreadyHidden(e) {
  e.classList.contains("hidden") || e.classList.add("hidden");
}
function hideAllEllipsisMenusExcept(e) {
  for (
    var t = document.querySelectorAll("ul.ellipsis-menu"), n = 0;
    n < t.length;
    n += 1
  )
    t[n] !== e && hideIfNotAlreadyHidden(t[n]);
}
function hideEllipsisMenus(e) {
  if (!e.target.closest("div.ellipsis-menu"))
    for (
      var t = document.querySelectorAll("ul.ellipsis-menu"), n = 0;
      n < t.length;
      n += 1
    )
      hideIfNotAlreadyHidden(t[n]);
}
function toggleEllipsisMenu(e) {
  var t = getMenu(e.target);
  hideAllEllipsisMenusExcept(t),
    t.classList.contains("hidden")
      ? t.classList.remove("hidden")
      : t.classList.add("hidden");
}
function initializeEllipsisMenuToggle() {
  for (
    var e = document.getElementsByClassName("ellipsis-menu-btn"), t = 0;
    t < e.length;
    t += 1
  )
    e[t].addEventListener("click", toggleEllipsisMenu);
  const n = document.getElementsByTagName("body")[0];
  n && n.addEventListener("click", hideEllipsisMenus);
}
function initializeEllipsisMenu() {
  initializeEllipsisMenuToggle(), initializeFormSubmit();
}
function initializeFetchFollowedArticles() {
  insertPodcasts(),
    document.getElementById("featured-story-marker") &&
      checkUserLoggedIn() &&
      algoliaFollowedArticles(),
    insertTimes();
}
function insertArticle(e, t, n) {
  if (e) {
    var o = document.createElement("DIV");
    e.cached_user && (e.user = e.cached_user.table),
      e.cached_organization && (e.organization = e.cached_organization.table),
      (o.innerHTML = buildArticleHTML(e)),
      t.insertBefore(o, n),
      initializeReadingListIcons();
  }
}
function insertInitialArticles(e) {
  var t = document.getElementById("home-articles-object");
  t &&
    ((t.innerHTML = ""),
    insertNewArticles(e),
    insertTopArticles(e),
    (t.outerHTML = ""));
}
function insertNewArticles(e) {
  var t = document.getElementById("new-articles-object"),
    n = JSON.parse(t.dataset.articles),
    o = document.getElementById("article-index-hidden-div");
  o &&
    (n.forEach(function(t) {
      var n = 0,
        o = findOne([t.user_id], e.followed_user_ids || []),
        i = findOne([t.organization_id], e.followed_organization_ids || []),
        r = intersect_arrays(e.followed_tag_names, t.cached_tag_list_array),
        a = 1,
        s = Math.abs(t.experience_level_rating - e.experience_level || 5),
        c = findOne(
          [t.language || "en"],
          e.preferred_languages_array || ["en"]
        );
      JSON.parse(e.followed_tags).map(function(e) {
        r.includes(e.name) && (a += e.points);
      }),
        (n = n + 2 * a + t.positive_reactions_count),
        (o || t.user_id === e.id) && (n += 16),
        i && (n += 16),
        c ? (n += 1) : (n -= 10);
      var l = Math.random();
      l < 0.3 ? (n += 3) : l < 0.6 && (n += 6), (n -= s / 2), (t.points = n);
    }),
    n
      .sort(function(e, t) {
        return t.points - e.points;
      })
      .forEach(function(e) {
        var t = o.parentNode;
        e.points > 12 &&
          !document.getElementById("article-link-" + e.id) &&
          insertArticle(e, t, o);
      }));
}
function insertTopArticles(e) {
  var t = document.getElementById("home-articles-object"),
    n = JSON.parse(t.dataset.articles),
    o = document.getElementById("article-index-hidden-div");
  o &&
    (n.forEach(function(t) {
      var n = 0,
        o = findOne([t.user_id], e.followed_user_ids || []),
        i = findOne([t.organization_id], e.followed_organization_ids || []),
        r = intersect_arrays(e.followed_tag_names, t.cached_tag_list_array),
        a = 1,
        s = Math.abs(t.experience_level_rating - e.experience_level || 5),
        c = findOne(
          [t.language || "en"],
          e.preferred_languages_array || ["en"]
        );
      JSON.parse(e.followed_tags).map(function(e) {
        r.includes(e.name) && (a += e.points);
      }),
        (n += a),
        o && (n += 1),
        i && (n += 1);
      var l = Math.random();
      l < 0.3 ? (n += 3) : l < 0.6 && (n += 6),
        c ? (n += 1) : (n -= 10),
        (n -= s / 2),
        (t.points = n);
    }),
    n
      .sort(function(e, t) {
        return t.points - e.points;
      })
      .forEach(function(e) {
        var t = o.parentNode;
        e.points > 0 &&
          !document.getElementById("article-link-" + e.id) &&
          insertArticle(e, t, o);
      }));
}
function algoliaFollowedArticles() {
  var e = userData();
  if (e && e.followed_tag_names && e.followed_tag_names.length > 0) {
    insertInitialArticles(e);
    const r = new CustomEvent("checkBlockedContent");
    window.dispatchEvent(r);
    var t = [];
    e.followed_user_ids &&
      (t = e.followed_user_ids.map(function(e) {
        return "user_" + e;
      }));
    var n = algoliasearch(
        "YE5Y9R600C",
        "YWVlZGM3YWI4NDg3Mjk1MzJmMjcwNDVjMjIwN2ZmZTQ4YTkxOGE0YTkwMzhiZTQzNmM0ZGFmYTE3ZTI1ZDFhNXJlc3RyaWN0SW5kaWNlcz1zZWFyY2hhYmxlc19wcm9kdWN0aW9uJTJDVGFnX3Byb2R1Y3Rpb24lMkNvcmRlcmVkX2FydGljbGVzX3Byb2R1Y3Rpb24lMkNDbGFzc2lmaWVkTGlzdGluZ19wcm9kdWN0aW9uJTJDb3JkZXJlZF9hcnRpY2xlc19ieV9wdWJsaXNoZWRfYXRfcHJvZHVjdGlvbiUyQ29yZGVyZWRfYXJ0aWNsZXNfYnlfcG9zaXRpdmVfcmVhY3Rpb25zX2NvdW50X3Byb2R1Y3Rpb24lMkNvcmRlcmVkX2NvbW1lbnRzX3Byb2R1Y3Rpb24="
      ),
      o =
        (n.initIndex("ordered_articles_production"),
        {
          hitsPerPage: 20,
          page: "0",
          attributesToHighlight: [],
          tagFilters: [e.followed_tag_names.concat(t)]
        }),
      i = document.getElementById("index-container");
    "base-feed" === i.dataset.feed
      ? (articlesIndex = n.initIndex("ordered_articles_production"))
      : "latest" === i.dataset.feed
      ? (articlesIndex = n.initIndex(
          "ordered_articles_by_published_at_production"
        ))
      : ((o.filters = "published_at_int > " + i.dataset.articlesSince),
        (articlesIndex = n.initIndex(
          "ordered_articles_by_positive_reactions_count_production"
        ))),
      articlesIndex.search("*", o).then(function(e) {
        var t = document.getElementById("article-index-hidden-div");
        if (t) {
          var n = t.parentNode;
          e.hits.forEach(function(e) {
            document.getElementById("article-link-" + e.id) ||
              insertArticle(e, n, t);
          });
        }
        var o = document.getElementById("home-articles-object");
        o && (o.outerHTML = "");
      });
  }
}
function insertPodcasts() {
  var e = document.getElementById("followed-podcasts"),
    t = document.getElementById("article-index-podcast-div");
  if (e && t) {
    var n = userData();
    if (n && n.followed_podcast_ids && n.followed_podcast_ids.length > 0) {
      var o = JSON.parse(e.dataset.episodes),
        i = "",
        r = 0;
      o.forEach(function(e) {
        n.followed_podcast_ids.indexOf(e.podcast.id) > -1 &&
          ((r += 1),
          (i =
            i +
            '<a class="individual-podcast-link" href="/' +
            e.podcast.slug +
            "/" +
            e.slug +
            '"><strong>' +
            e.podcast.title +
            "</strong> " +
            e.title +
            "</a>"));
      }),
        r > 0 &&
          (t.innerHTML =
            '<div class="single-article single-article-podcast-div"><h3><a href="/pod">Today\'s Podcasts</a></h3>' +
            i +
            "</div>");
    }
  }
}
function findOne(e, t) {
  return t.some(function(t) {
    return e.indexOf(t) >= 0;
  });
}
function intersect_arrays(e, t) {
  for (
    var n = e.concat().sort(), o = t.concat().sort(), i = [], r = 0, a = 0;
    r < e.length && a < t.length;

  )
    n[r] === o[a] ? (i.push(n[r]), r++, a++) : n[r] < o[a] ? r++ : a++;
  return i;
}
function insertTimes() {
  for (
    var e = document.getElementsByClassName(
        "time-ago-indicator-initial-placeholder"
      ),
      t = 0;
    t < e.length;
    t++
  ) {
    var n = e[0];
    n.outerHTML = timeAgo(n.dataset.seconds);
  }
}
function initializeFooterMod() {
  var e = document.getElementById("footer-container"),
    t = document.getElementById("page-content");
  e &&
  t &&
  t.className.indexOf("stories-show") > -1 &&
  !document.getElementById("IS_CENTERED_PAGE")
    ? document
        .getElementById("footer-container")
        .classList.remove("centered-footer")
    : e &&
      document
        .getElementById("footer-container")
        .classList.add("centered-footer");
}
function initializeLocalStorageRender() {
  try {
    var e = browserStoreCache("get");
    e &&
      ((document.getElementsByTagName("body")[0].dataset.user = e),
      initializeBaseUserData(),
      initializeReadingListIcons(),
      initializeAllFollowButts(),
      initializeSponsorshipVisibility());
  } catch (t) {
    browserStoreCache("remove");
  }
}
function initializePWAFunctionality() {
  if (
    (window.matchMedia("(display-mode: standalone)").matches ||
      window.frameElement) &&
    (document
      .getElementById("pwa-nav-buttons")
      .classList.add("pwa-nav-buttons--showing"),
    (document.getElementById("app-back-button").onclick = e => {
      e.preventDefault(), window.history.back();
    }),
    (document.getElementById("app-forward-button").onclick = e => {
      e.preventDefault(), window.history.forward();
    }),
    (document.getElementById("app-refresh-button").onclick = e => {
      e.preventDefault(), window.location.reload();
    }),
    !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|DEV-Native-ios/i.test(
      navigator.userAgent
    ))
  )
    for (
      var e = window.location.protocol + "//" + window.location.host,
        t = document.getElementsByTagName("a"),
        n = 0,
        o = t.length;
      n < o;
      n++
    ) {
      var i = t[n];
      0 === i.href.indexOf(e + "/") ||
        0 === i.href.indexOf("/") ||
        (i.setAttribute("target", "_blank"),
        i.setAttribute("rel", "noopener noreferrer"));
    }
}
function initializePodcastPlayback() {
  function e(e) {
    return document.getElementById(e);
  }
  function t(e) {
    return document.getElementsByClassName(e);
  }
  function n() {
    return e("audio") && !e("audio").paused;
  }
  function o() {
    return e(`record-${window.activeEpisode}`);
  }
  function i(t) {
    n() &&
      o() &&
      (e(`record-${window.activeEpisode}`).classList.add("playing"),
      f(t || "playing"));
  }
  function r() {
    window.activeEpisode &&
      e(`record-${window.activeEpisode}`) &&
      (e(`record-${window.activeEpisode}`).classList.remove("playing"),
      (window.activeEpisode = undefined));
  }
  function a() {
    var e = t("record-wrapper"),
      n = t("podcastliquidtag__record");
    return e.length > 0 ? e : n;
  }
  function s(t) {
    (e("barPlayPause").onclick = function() {
      w(t);
    }),
      (e("mutebutt").onclick = function() {
        _(t);
      }),
      (e("volbutt").onclick = function() {
        _(t);
      }),
      (e("bufferwrapper").onclick = function(e) {
        T(e, t);
      }),
      (e("volumeslider").value = 100 * t.volume),
      (e("volumeslider").onchange = function(e) {
        t.volume = e.target.value / 100;
      }),
      (e("speed").onclick = function() {
        m(t);
      }),
      (e("closebutt").onclick = function() {
        I(t);
      });
  }
  function c(t) {
    return -1 !== e("audiocontent").innerHTML.indexOf(`${t}`);
  }
  function l(e) {
    return function(t) {
      E(t, e);
    };
  }
  function d(t) {
    e("audiocontent").innerHTML = e(`hidden-audio-${t}`).innerHTML;
    var n = e("audio");
    n.addEventListener("timeupdate", l(n), !1), n.load(), w(n), s(n);
  }
  function u() {
    var t = a();
    Array.prototype.forEach.call(t, function(t) {
      var n = t.getAttribute("data-episode");
      t.getAttribute("data-podcast");
      t.onclick = function() {
        if (c(n)) {
          var t = e("audio");
          t && w(t);
        } else r(), d(n);
      };
    });
  }
  function m(t) {
    var n = e("speed"),
      o = parseFloat(n.getAttribute("data-speed"));
    2 == o
      ? (n.setAttribute("data-speed", 0.5),
        (n.innerHTML = "0.5x"),
        (t.playbackRate = 0.5))
      : (n.setAttribute("data-speed", o + 0.5),
        (n.innerHTML = o + 0.5 + "x"),
        (t.playbackRate = o + 0.5));
  }
  function f(t) {
    e(`status-message-${window.activeEpisode}`)
      ? (e(`status-message-${window.activeEpisode}`).innerHTML = t)
      : "loading" === t &&
        document.querySelector(".status-message") &&
        (document.querySelector(".status-message").innerHTML = t);
  }
  function p() {
    var e =
      "You are currently playing a podcast. Are you sure you want to leave?";
    (window.onclick = function(t) {
      "A" !== t.target.tagName ||
        t.target.href.includes("https://dev.to") ||
        t.ctrlKey ||
        t.metaKey ||
        (t.preventDefault(),
        window.confirm(e) && (window.location = t.target.href));
    }),
      (window.onbeforeunload = function() {
        return e;
      });
  }
  function h() {
    e("barPlayPause").classList.add("playing"),
      e("progressBar").classList.add("playing"),
      e("animated-bars").classList.add("playing");
  }
  function g(e) {
    e.play()
      .then(
        function() {
          i(), h(), p();
        },
        function() {}
      )
      ["catch"](function() {
        e.play(),
          setTimeout(function() {
            i("loading"), h(), p();
          }, 300);
      });
  }
  function y() {
    window.onbeforeunload = function() {
      return null;
    };
  }
  function v() {
    e("barPlayPause").classList.remove("playing"),
      e("animated-bars").classList.remove("playing");
  }
  function b(e) {
    e.pause(), r(), v(), y();
  }
  function w(e) {
    f("loading"),
      (window.activeEpisode = e.getAttribute("data-episode")),
      (window.activePodcast = e.getAttribute("data-podcast")),
      e.paused
        ? (ga(
            "send",
            "event",
            "click",
            "play podcast",
            `${window.activePodcast} ${window.activeEpisode}`,
            null
          ),
          g(e))
        : (ga(
            "send",
            "event",
            "click",
            "pause podcast",
            `${window.activePodcast} ${window.activeEpisode}`,
            null
          ),
          b(e));
  }
  function _(t) {
    e("mutebutt").classList.add(t.muted ? "hidden" : "showing"),
      e("volumeindicator").classList.add(t.muted ? "showing" : "hidden"),
      e("mutebutt").classList.remove(t.muted ? "showing" : "hidden"),
      e("volumeindicator").classList.remove(t.muted ? "hidden" : "showing"),
      (t.muted = !t.muted);
  }
  function E(t, n) {
    var o = e("progress"),
      i = e("buffer"),
      r = e("time"),
      a = 0,
      s = 0;
    n.currentTime > 0 &&
      ((a = Math.floor((100 / n.duration) * n.currentTime)),
      (s = (n.buffered.end(n.buffered.length - 1) / n.duration) * 100)),
      (o.style.width = a + "%"),
      (i.style.width = s + "%"),
      (r.innerHTML = k(n.currentTime) + " / " + k(n.duration));
  }
  function T(t, n) {
    var o = e("progress");
    if (t.clientX > 128) {
      var i = (t.clientX - 128) / (window.innerWidth - 133),
        r = n.duration;
      (n.currentTime = r * i),
        (time.innerHTML = k(n.currentTime) + " / " + k(n.duration)),
        (o.style.width = 100 * i + "%");
    }
  }
  function k(e) {
    var t = Math.floor(e),
      n = Math.floor(t / 60);
    return (
      (n = n >= 10 ? n : "0" + n) +
      ":" +
      (t = (t = Math.floor(t % 60)) >= 10 ? t : "0" + t)
    );
  }
  function I(t) {
    event.stopPropagation(),
      t.removeEventListener("timeupdate", l, !1),
      (e("audiocontent").innerHTML = ""),
      r(),
      y();
  }
  i(), u();
}
function initializeReadingListIcons() {
  setReadingListButtonsState(),
    addReadingListCountToHomePage(),
    addHoverEffectToReadingListButtons();
}
function setReadingListButtonsState() {
  var e = document.getElementsByClassName("bookmark-button");
  Array.from(e).forEach(highlightButton);
}
function highlightButton(e) {
  var t = userData(),
    n = parseInt(e.dataset.reactableId, 10);
  t && t.reading_list_ids.indexOf(n) > -1
    ? e.classList.add("selected")
    : e.classList.remove("selected"),
    e.addEventListener("click", reactToReadingListButtonClick);
}
function addReadingListCountToHomePage() {
  var e,
    t = userData();
  t &&
    document.getElementById("reading-list-count") &&
    ((e = t.reading_list_ids.length > 0 ? t.reading_list_ids.length : "empty"),
    (document.getElementById("reading-list-count").innerHTML = "(" + e + ")"),
    (document.getElementById("reading-list-count").dataset.count =
      t.reading_list_ids.length));
}
function reactToReadingListButtonClick(e) {
  var t;
  e.preventDefault(),
    sendHapticMessage("medium"),
    "logged-out" !==
    document.getElementsByTagName("body")[0].getAttribute("data-user-status")
      ? (renderOptimisticResult((t = properButtonFromEvent(e))),
        getCsrfToken()
          .then(sendFetch("reaction-creation", buttonFormData(t)))
          .then(function(e) {
            if (200 === e.status)
              return e.json().then(function(e) {
                renderButtonState(t, e), renderNewSidebarCount(t, e);
              });
          })
          ["catch"](function() {}))
      : showModal("add-to-readinglist-from-index");
}
function renderButtonState(e, t) {
  "create" === t.result
    ? (e.classList.add("selected"), addHoverEffectToReadingListButtons(e))
    : e.classList.remove("selected");
}
function renderNewSidebarCount(e, t) {
  var n,
    o = document.getElementById("reading-list-count").dataset.count;
  (o = parseInt(o, 10)),
    "create" === t.result ? (n = o + 1) : 0 !== o && (n = o - 1),
    (document.getElementById("reading-list-count").dataset.count = n),
    (document.getElementById("reading-list-count").innerHTML = "(" + n + ")");
}
function buttonFormData(e) {
  var t = new FormData();
  return (
    t.append("reactable_type", "Article"),
    t.append("reactable_id", e.dataset.reactableId),
    t.append("category", "readinglist"),
    t
  );
}
function renderOptimisticResult(e) {
  renderButtonState(e, { result: "create" });
}
function properButtonFromEvent(e) {
  return "BUTTON" === e.target.tagName ? e.target : e.target.parentElement;
}
function addHoverEffectToReadingListButtons() {
  var e = document.getElementsByClassName("articles-list");
  Array.from(e).forEach(function(e) {
    e.addEventListener(
      "mouseover",
      readingListButtonMouseHandler.bind("UNSAVE")
    ),
      e.addEventListener(
        "mouseout",
        readingListButtonMouseHandler.bind("SAVED")
      );
  });
}
function isReadingListButtonHoverTarget(e) {
  var t = e.classList;
  return (
    ("BUTTON" === e.tagName &&
      t.contains("bookmark-button") &&
      t.contains("selected")) ||
    ("SPAN" === e.tagName && t.contains("bm-success"))
  );
}
function readingListButtonMouseHandler(e) {
  var t = e.target;
  if (isReadingListButtonHoverTarget(t)) {
    e.preventDefault();
    var n = this;
    ("BUTTON" === t.tagName
      ? t.getElementsByClassName("bm-success")[0]
      : t
    ).innerHTML = n;
  }
}
function initializeSettings() {
  const e = document.getElementById("settings-org-secret");
  e &&
    e.addEventListener("click", e => {
      e.target.select();
    });
  let t = document.getElementById("rss-fetch-time");
  if (t) {
    var n = t.getAttribute("datetime"),
      o = {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
      };
    t.textContent = timestampToLocalDateTime(n, navigator.language, o);
  }
  const i = document.getElementById("new_pro_membership");
  i &&
    i.addEventListener(
      "submit",
      e => (
        e.preventDefault(),
        !!window.confirm("Are you sure?") && (e.target.submit(), !0)
      )
    );
}
function listenForSponsorClick() {
  setTimeout(() => {
    if (window.ga)
      for (
        var e = document.getElementsByClassName("partner-link"), t = 0;
        t < e.length;
        t++
      )
        e[t].onclick = sponsorClickHandler;
  }, 400);
}
function initializeSponsorshipVisibility() {
  var e =
      document.getElementById("sponsorship-widget") ||
      document.getElementById("partner-content-display"),
    t = userData();
  e &&
    setTimeout(() => {
      window.ga &&
        0 === document.querySelectorAll("[data-partner-seen]").length &&
        (ga(
          "send",
          "event",
          "view",
          "sponsor displayed on page",
          e.dataset.details,
          null
        ),
        (e.dataset.partnerSeen = "true"));
    }, 400),
    e && t && t.display_sponsors
      ? (e.classList.add("showing"), listenForSponsorClick())
      : e && t
      ? e.classList.remove("showing")
      : e && (e.classList.add("showing"), listenForSponsorClick());
}
function initializeStylesheetAppend() {
  if (!document.getElementById("main-head-stylesheet")) {
    var e = document.createElement("link");
    (e.type = "text/css"),
      (e.id = "main-head-stylesheet"),
      (e.rel = "stylesheet"),
      (e.href =
        "https://practicaldev-herokuapp-com.freetls.fastly.net/assets/minimal-f54c9ce1dbeb213dcd2e6b34df49108fd0d9d09987096639b631ba3cd47a2aa9.css"),
      document.getElementsByTagName("head")[0].appendChild(e);
  }
}
function initializeSwipeGestures() {
  (initializeSwipeGestures.called = !0),
    (swipeState = "middle"),
    setTimeout(function() {
      !(function(e) {
        var t = function(e, t) {
            var n = document.createEvent("CustomEvent");
            return (
              n.initCustomEvent(t, !0, !0, e.target),
              e.target.dispatchEvent(n),
              (n = null),
              !1
            );
          },
          n = !0,
          o = { x: 0, y: 0 },
          i = { x: 0, y: 0 },
          r = {
            touchstart: function(e) {
              o = {
                x: e.touches[0].pageX,
                y: e.touches[0].pageY,
                scrollY: window.scrollY
              };
            },
            touchmove: function(e) {
              (n = !1),
                (i = {
                  x: e.touches[0].pageX,
                  y: e.touches[0].pageY,
                  scrollY: window.scrollY
                });
            },
            touchend: function(e) {
              if (n) t(e, "fc");
              else {
                var r = i.x - o.x,
                  a = Math.abs(r),
                  s = i.y - o.y,
                  c = Math.abs(s),
                  l = Math.abs(o.scrollY - i.scrollY);
                if (Math.max(a, c) > 15)
                  t(
                    e,
                    a / 2 > c && l < 5
                      ? r < 0
                        ? "swl"
                        : "swr"
                      : s < 0
                      ? "swu"
                      : "swd"
                  );
              }
              n = !0;
            },
            touchcancel: function() {
              n = !1;
            }
          };
        for (var a in r) e.addEventListener(a, r[a], !1);
      })(document);
      document.body.addEventListener("swl", handleSwipeLeft, !1),
        document.body.addEventListener("swr", handleSwipeRight, !1);
    }, 50);
}
function handleSwipeLeft() {
  document.getElementById("on-page-nav-controls") &&
    ("middle" == swipeState
      ? ((swipeState = "right"), slideSidebar("right", "intoView"))
      : ((swipeState = "middle"), slideSidebar("left", "outOfView")));
}
function handleSwipeRight() {
  document.getElementById("on-page-nav-controls") &&
    ("middle" == swipeState
      ? ((swipeState = "left"), slideSidebar("left", "intoView"))
      : ((swipeState = "middle"), slideSidebar("right", "outOfView")));
}
function formatDateTime(e, t) {
  return new Intl.DateTimeFormat("en-US", e).format(t);
}
function convertUtcTime(e) {
  return formatDateTime(
    { hour: "numeric", minute: "numeric", timeZoneName: "short" },
    new Date(e)
  );
}
function convertUtcDate(e) {
  return formatDateTime({ month: "short", day: "numeric" }, new Date(e));
}
function convertCalEvent(e) {
  return formatDateTime(
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    },
    new Date(e)
  );
}
function updateLocalDateTime(e, t, n) {
  for (var o, i = 0; i < e.length; i += 1)
    (o = t(n(e[i]))), (e[i].innerHTML = o);
}
function initializeTimeFixer() {
  var e = document.getElementsByClassName("utc-time"),
    t = document.getElementsByClassName("utc-date"),
    n = document.getElementsByClassName("utc");
  n &&
    (updateLocalDateTime(e, convertUtcTime, e => e.dataset.datetime),
    updateLocalDateTime(t, convertUtcDate, e => e.dataset.datetime),
    updateLocalDateTime(n, convertCalEvent, e => e.innerHTML));
}
function getById(e) {
  return document.getElementById(e);
}
function getClassList(e) {
  return getById(e).classList;
}
function blur(e, t) {
  setTimeout(() => {
    document.activeElement !== getById(t) &&
      getClassList("navbar-menu-wrapper").remove("showing");
  }, 10);
}
function removeShowingMenu() {
  getClassList("navbar-menu-wrapper").remove("showing"),
    setTimeout(() => {
      getClassList("navbar-menu-wrapper").remove("showing");
    }, 5),
    setTimeout(() => {
      getClassList("navbar-menu-wrapper").remove("showing");
    }, 150);
}
function toggleMenu() {
  getClassList("navbar-menu-wrapper").toggle("showing");
}
function initializeTouchDevice() {
  var e = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|DEV-Native-ios/i.test(
    navigator.userAgent
  );
  "DEV-Native-ios" === navigator.userAgent &&
    document
      .getElementsByTagName("body")[0]
      .classList.add("dev-ios-native-body"),
    setTimeout(() => {
      removeShowingMenu(),
        e
          ? getById("navigation-butt").addEventListener("click", toggleMenu)
          : (getClassList("navbar-menu-wrapper").add("desktop"),
            getById("navigation-butt").addEventListener("focus", () =>
              getClassList("navbar-menu-wrapper").add("showing")
            ),
            getById("last-nav-link").addEventListener("blur", e =>
              blur(e, "second-last-nav-link")
            ),
            getById("navigation-butt").addEventListener("blur", e =>
              blur(e, "first-nav-link")
            )),
        getById("menubg").addEventListener("click", () =>
          getClassList("navbar-menu-wrapper").remove("showing")
        );
    }, 10);
}
function initializeUserProfilePage() {
  const e = document.getElementsByClassName("profile-dropdown")[0];
  if (e) {
    const t = userData();
    if (t && t.username === e.dataset.username) e.hidden = !0;
    else {
      e.hidden = !1;
      const t = document.getElementById("user-profile-dropdown");
      if (t) {
        const e = document.getElementById("user-profile-dropdownmenu");
        t.addEventListener("click", () => {
          e.classList.toggle("showing");
        });
      }
    }
  }
}
function browserStoreCache(e, t) {
  try {
    switch (e) {
      case "set":
        localStorage.setItem("current_user", t),
          localStorage.setItem(
            "config_body_class",
            JSON.parse(t).config_body_class
          );
        break;
      case "remove":
        localStorage.removeItem("current_user");
        break;
      default:
        return localStorage.getItem("current_user");
    }
  } catch (n) {
    navigator.cookieEnabled && browserStoreCache("remove");
  }
  return undefined;
}
function buildArticleHTML(e) {
  if (e && "podcast_episodes" == e.type_of)
    return (
      '<div class="single-article single-article-small-pic single-article-single-podcast">      <div class="small-pic">       <a href="/' +
      e.podcast.slug +
      '" class="small-pic-link-wrapper">         <img src="' +
      e.podcast.image_url +
      '" alt="' +
      e.podcast.title +
      ' image">       </a>       </div>       <a href="' +
      e.path +
      '" class="small-pic-link-wrapper index-article-link" id="article-link-' +
      e.id +
      '">        <div class="content">         <h3><span class="tag-identifier">podcast</span>' +
      e.title +
      '</h3>        </div>       </a>       <h4><a href="/' +
      e.podcast.slug +
      '">' +
      e.podcast.title +
      "</a></h4>       </div>"
    );
  if (e) {
    var t = document.getElementById("index-container"),
      n = "",
      o = e.tag_list || e.cached_tag_list_array;
    o &&
      o.forEach(function(e) {
        n =
          n +
          '<a href="/t/' +
          e +
          '"><span class="tag">#' +
          e +
          "</span></a>\n";
      });
    var i = "";
    (e.comments_count || "0") > 0 &&
      "User" != e.class_name &&
      (i =
        '<div class="article-engagement-count comments-count"><a href="' +
        e.path +
        '#comments"><img src="https://practicaldev-herokuapp-com.freetls.fastly.net/assets/comments-bubble-9958d41b969a1620c614347d5ad3f270ab49582c1d9f82b617a6b4156d05dda0.png" alt="chat" /><span class="engagement-count-number">' +
        (e.comments_count || "0") +
        "</span></a></div>");
    var r = "";
    if (t) var a = JSON.parse(t.dataset.params).tag;
    e.flare_tag &&
      a != e.flare_tag.name &&
      (r =
        "<span class='tag-identifier' style='background:" +
        e.flare_tag.bg_color_hex +
        ";color:" +
        e.flare_tag.text_color_hex +
        "'>#" +
        e.flare_tag.name +
        "</span>"),
      "PodcastEpisode" == e.class_name &&
        (r = "<span class='tag-identifier'>podcast</span>"),
      "User" == e.class_name &&
        (r =
          "<span class='tag-identifier' style='background:#5874d9;color:white;'>person</span>");
    var s = e.positive_reactions_count || e.reactions_count,
      c = "";
    if ((s || "0") > 0 && "User" != e.class_name)
      c =
        '<div class="article-engagement-count reactions-count"><a href="' +
        e.path +
        '"><img src="https://practicaldev-herokuapp-com.freetls.fastly.net/assets/reactions-stack-ee166e138ca182a567f74c986b6f810f670f4d199aca9c550cc7e6f49f34bd33.png" alt="heart" /><span id="engagement-count-number-' +
        e.id +
        '" class="engagement-count-number">' +
        (s || "0") +
        "</span></a></div>";
    var l = e.user.profile_image_90,
      d = e.user.username,
      u = "";
    e.organization &&
      !document.getElementById("organization-article-index") &&
      (u =
        '<div class="article-organization-headline"><a class="org-headline-filler" href="/' +
        e.organization.slug +
        '"><span class="article-organization-headline-inner"><img alt="' +
        e.organization.name +
        ' logo" src="' +
        e.organization.profile_image_90 +
        '" loading="lazy">' +
        e.organization.name +
        "</span></a></div>");
    var m = "",
      f = "",
      p = "";
    if (e._snippetResult && e._snippetResult.body_text) {
      if ("none" != e._snippetResult.body_text.matchLevel) {
        var h = "";
        (g = e._snippetResult.body_text.value[0]).toLowerCase() !=
          g.toUpperCase() && (h = "\u2026"),
          (m = h + e._snippetResult.body_text.value + "\u2026");
      }
      if ("none" != e._snippetResult.comments_blob.matchLevel && "" === m) {
        var g;
        h = "";
        (g = e._snippetResult.comments_blob.value[0]).toLowerCase() !=
          g.toUpperCase() && (h = "\u2026"),
          (f =
            h +
            e._snippetResult.comments_blob.value +
            "\u2026 <i>(comments)</i>");
      }
      (m.length > 0 || f.length > 0) &&
        "Article" == e.class_name &&
        (p = '<div class="search-snippet"><span>' + m + f + "</span></div>");
    }
    var y = "";
    "Article" === e.class_name
      ? (y =
          '<button type="button" class="article-engagement-count engage-button bookmark-button" data-reactable-id="' +
          e.id +
          '">                      <span class="bm-initial">SAVE</span>                      <span class="bm-success">SAVED</span>                    </button>')
      : "User" === e.class_name &&
        (y =
          '<button type="button" style="width: 122px" class="article-engagement-count engage-button follow-action-button"                       data-info=\'{"id":' +
          e.id +
          ',"className":"User"}\' data-follow-action-button>                       &nbsp;                    </button>');
    var v = "";
    e.readable_publish_date &&
      (v = e.published_timestamp
        ? '\u30fb<time datetime="' +
          e.published_timestamp +
          '">' +
          e.readable_publish_date +
          "</time>"
        : "\u30fb<time>" + e.readable_publish_date + "</time>");
    var b = "";
    "Article" === e.class_name &&
      (b =
        '<a href="' +
        e.path +
        '" class="article-reading-time">' +
        ((e.reading_time || null) < 1 ? "1 min" : e.reading_time + " min") +
        " read</a>");
    var w = "";
    e.cloudinary_video_url &&
      (w =
        '<a href="' +
        e.path +
        '" class="single-article-video-preview" style="background-image:url(' +
        e.cloudinary_video_url +
        ')"><div class="single-article-video-duration"><img src="https://practicaldev-herokuapp-com.freetls.fastly.net/assets/video-camera-0c3050f8341db4d91f7d90272b61c637d9a2c7d42fdd00fc6ac9be048a935f71.svg" alt="video camera">' +
        e.video_duration_in_minutes +
        "</div></a>");
    var _ = "";
    return (
      e.published_at_int && (_ = timeAgo(e.published_at_int)),
      '<div class="single-article single-article-small-pic" data-content-user-id="' +
        e.user_id +
        '">      ' +
        w +
        "      " +
        u +
        '      <div class="small-pic">       <a href="/' +
        d +
        '" class="small-pic-link-wrapper">         <img src="' +
        l +
        '" alt="' +
        d +
        ' profile" loading="lazy">       </a>       </div>       <a href="' +
        e.path +
        '" class="small-pic-link-wrapper index-article-link" id="article-link-' +
        e.id +
        '">        <div class="content">         <h3>' +
        r +
        filterXSS(e.title) +
        "</h3>         " +
        p +
        '        </div>       </a>       <h4><a href="/' +
        e.user.username +
        '">' +
        filterXSS(e.user.name) +
        v +
        _ +
        '</a></h4>       <div class="tags">' +
        n +
        "</div>       " +
        i +
        c +
        b +
        "       " +
        y +
        "</div>"
    );
  }
}
function buildCommentFormHTML(e, t, n) {
  var o = document
      .querySelector("meta[name='csrf-token']")
      .getAttribute("content"),
    i = userData(),
    r = "";
  i &&
    !i.codeOfConduct &&
    i.commentCount < 1 &&
    (r =
      '<div class="code-of-conduct sub-comment-code-of-conduct" style="display:block" id="toggle-code-of-conduct-checkbox">                            <input class="checkbox" type="checkbox" name="checked_code_of_conduct" required />                            <label for="checked_code_of_conduct">I\'ve read the <a href="https://dev.to/code-of-conduct">code of conduct</a></label>                          </div>');
  var a = Math.floor(1991 * Math.random());
  return (
    '<form class="new_comment" onsubmit="handleCommentSubmit.bind(this)(event)" id="new-comment-' +
    n +
    '" action="/comments" accept-charset="UTF-8" method="post" data-comment-id="' +
    n +
    '">            <input name="utf8" type="hidden" value="&#x2713;" />            <input type="hidden" name="authenticity_token" value="' +
    o +
    '">            <input value="' +
    e +
    '" type="hidden" name="comment[commentable_id]" id="comment_commentable_id" />            <input value="' +
    t +
    '" type="hidden" name="comment[commentable_type]" id="comment_commentable_type" />            <input value="' +
    n +
    '" type="hidden" name="comment[parent_id]" id="comment_parent_id" />            <textarea id="textarea-for-' +
    n +
    '" class="embiggened" name="comment[body_markdown]" id="comment_body_markdown" required onkeydown="handleKeyDown.bind(this)(event)"></textarea>            ' +
    '<div class="preview-toggle comment-preview-div body"></div>' +
    "                " +
    r +
    '            <a href="/p/editor_guide" class="markdown-guide" target="_blank" title="Markdown Guide">              <img alt="markdown guide" class="icon-image" src="https://practicaldev-herokuapp-com.freetls.fastly.net/assets/info-77808966a58690cfaad3e8c7923a4d78d8fab5d87e1c3f73aef7670f290eb00c.svg" />            </a>            <div class="editor-image-upload">              <input type="file" id="image-upload-' +
    a +
    '"  name="file" accept="image/*" style="display:none">              <button title="Upload Image" class="image-upload-button" id="image-upload-button-' +
    a +
    '" onclick="handleImageUpload(event,' +
    a +
    ')">                <img alt="upload image" class="icon-image" src="https://practicaldev-herokuapp-com.freetls.fastly.net/assets/image-upload-82e70cf7bf38042009c533de1ad5806ab1c33a116c24bb1518886250e076c006.svg" />              </button>              <label  class="image-upload-file-label" id="image-upload-file-label-' +
    a +
    '"></label>              <input type="submit" id="image-upload-submit-' +
    a +
    '" value="Upload" style="display:none">              <input class="uploaded-image" id="uploaded-image-' +
    a +
    '" />            </div>            <div class="actions reply-actions">              <a href="#" class="cancel" onclick="cancel(event,this)">CANCEL</a>              ' +
    '<button id="preview-button" class="comment-action-button comment-action-preview" onclick="handleCommentPreview(event)">PREVIEW</button>' +
    '              <input type="submit" class="comment-action-button" name="commit" value="SUBMIT" />            </div>          </form>'
  );
}
function cancel(e, t) {
  e.preventDefault(),
    replaceActionButts(t.parentNode.parentNode.parentNode.parentNode),
    initializeCommentsPage();
}
function buildCommentHTML(e) {
  var t = "",
    n = "",
    o = "",
    i = "",
    r = "",
    a = "";
  return (
    (t = e.newly_created
      ? 0 == e.depth
        ? "root"
        : e.depth < 3
        ? "child"
        : "child flat-node"
      : "child flat-node"),
    e.user.twitter_username &&
      e.user.twitter_username.length > 0 &&
      (o =
        '<a href="http://twitter.com/' +
        e.user.twitter_username +
        '" rel="noopener noreferrer" target="_blank"><img class="icon-img" alt="twitter logo" src="https://practicaldev-herokuapp-com.freetls.fastly.net/assets/twitter-logo-42be7109de07f8c991a9832d432c9d12ec1a965b5c0004bca9f6aa829ae43209.svg" /></a>'),
    e.user.github_username &&
      e.user.github_username.length > 0 &&
      (n =
        '<a href="http://github.com/' +
        e.user.github_username +
        '" rel="noopener noreferrer" target="_blank"><img class="icon-img" alt="github logo" src="https://practicaldev-herokuapp-com.freetls.fastly.net/assets/github-logo-6a5bca60a4ebf959a6df7f08217acd07ac2bc285164fae041eacb8a148b1bab9.svg" /></a>'),
    e.newly_created && (i = "comment-created-via-fetch"),
    e.depth < 3 &&
      ((r = "<details open><summary><span>&nbsp;</span></summary>"),
      (a = "</details>")),
    "<style>" +
      e.css +
      "</style>          " +
      r +
      '          <div class="comment-hash-marker" id="' +
      e.id_code +
      '"></div>          <div id="comment-node-' +
      e.id +
      '" class="single-comment-node ' +
      t +
      " comment-deep-" +
      e.depth +
      '" "          data-comment-id="' +
      e.id +
      '" data-comment-author-id="' +
      e.user.id +
      '" data-current-user-comment="' +
      e.newly_created +
      '" data-content-user-id="' +
      e.user.id +
      '">          <div class="inner-comment ' +
      i +
      '">            <div class="details">              <a href="/' +
      e.user.username +
      '">                <img class="profile-pic" src="' +
      e.user.profile_pic +
      '" alt="' +
      e.user.username +
      '">                <span class="comment-username"><span class="comment-username-inner">' +
      e.user.name +
      "</span></span>              </a>                " +
      o +
      "                " +
      n +
      '              <div class="comment-date">                <a href="' +
      e.url +
      '">                  <time datetime="' +
      e.published_timestamp +
      '">                    ' +
      e.readable_publish_date +
      '                  </time>                </a>              </div>              <button class="dropbtn">                <img class="dropdown-icon" alt="Toggle dropdown menu" src="https://practicaldev-herokuapp-com.freetls.fastly.net/assets/three-dots-943ace87a6e3393984e260d09db4d12e3793f6658c33197e93c01ba552c165ba.svg" />              </button>              <div class="dropdown">                  <div class="dropdown-content">                    <a href="' +
      e.url +
      '">                      Permalink                    </a>                    <a href="' +
      e.url +
      '/settings">                      Settings                    </a>                    <a href="/report-abuse?url=https://dev.to' +
      e.url +
      '">Report Abuse</a>                  </div>              </div>            </div>            <div class="body">              ' +
      e.body_html +
      "              " +
      reactions(e) +
      "            </div>            " +
      actions(e) +
      "          </div>      </div>      " +
      a
  );
}
function actions(e) {
  return e.newly_created
    ? '<div class="actions" data-comment-id="' +
        e.id +
        '" data-path="' +
        e.url +
        '">              <span class="current-user-actions" style="display: ' +
        (e.newly_created ? "inline-block" : "none") +
        ';">                <a data-no-instant="" href="' +
        e.url +
        '/delete_confirm" class="edit-butt" rel="nofollow">DELETE</a>                <a href="' +
        e.url +
        '/edit" class="edit-butt" rel="nofollow">EDIT</a>              </span>                <a href="#" class="toggle-reply-form" rel="nofollow">REPLY</a>            </div>'
    : '<div class="actions" data-comment-id="' +
        e.id +
        '" data-path="' +
        e.url +
        '" data-commentable-id="' +
        e.commentable.id +
        '">                <a href="' +
        e.url +
        '" rel="nofollow">VIEW/REPLY</a>            </div>';
}
function reactions(e) {
  if (e.newly_created)
    return (
      '<button class="reaction-button reacted" id="button-for-comment-' +
      e.id +
      '" data-comment-id="' +
      e.id +
      '">              <img src="https://practicaldev-herokuapp-com.freetls.fastly.net/assets/favorite-heart-outline-button-eafc0d6b1b73d9d1e00410de01d79a2bc9cbfba43e1c2a674fad9d740abfa37d.svg" alt="Favorite heart outline button">              <img class="voted-heart" src="https://practicaldev-herokuapp-com.freetls.fastly.net/assets/emoji/emoji-one-heart-855b5a6263042e4c9448cf2cb0dd2e201598b77b1e3f1dc041492bc0128d9fb8.png" alt="Favorite heart button">              <span class="reactions-count" id="reactions-count-' +
      e.id +
      '">1</span></button>'
    );
  if (e.heart_ids.indexOf(userData().id) > -1) var t = "reacted";
  else t = "";
  return (
    '<button style="background:white" class="reaction-button ' +
    t +
    '" id="button-for-comment-' +
    e.id +
    '" data-comment-id="' +
    e.id +
    '">              <img src="https://practicaldev-herokuapp-com.freetls.fastly.net/assets/favorite-heart-outline-button-eafc0d6b1b73d9d1e00410de01d79a2bc9cbfba43e1c2a674fad9d740abfa37d.svg" alt="Favorite heart outline button">              <img class="voted-heart" src="https://practicaldev-herokuapp-com.freetls.fastly.net/assets/emoji/emoji-one-heart-855b5a6263042e4c9448cf2cb0dd2e201598b77b1e3f1dc041492bc0128d9fb8.png" alt="Favorite heart button">              <span class="reactions-count" id="reactions-count-' +
    e.id +
    '">' +
    e.positive_reactions_count +
    "</span></button>"
  );
}
function checkUserLoggedIn() {
  const e = document.getElementsByTagName("body")[0];
  return !!e && "logged-in" === e.getAttribute("data-user-status");
}
function getCsrfToken() {
  return new Promise(function(e, t) {
    var n = 0,
      o = setInterval(function() {
        var i = document.querySelector("meta[name='csrf-token']");
        if ((n++, i)) {
          clearInterval(o);
          var r = i.getAttribute("content");
          return e(r);
        }
        if (1e3 === n)
          return (
            clearInterval(o),
            Honeybadger.notify(
              "Could not locate CSRF metatag " +
                JSON.stringify(localStorage.current_user)
            ),
            t("Could not locate CSRF meta tag on the page.")
          );
      }, 5);
  });
}
function getCurrentPage(e) {
  return (
    document.querySelectorAll("[data-current-page='" + e + "']").length > 0
  );
}
function getImageForLink(e) {
  var t = e.getAttribute("data-preload-image");
  t &&
    -1 === $fetchedImageUrls.indexOf(t) &&
    ((new Image().src = t), $fetchedImageUrls.push(t));
}
function insertAfter(e, t) {
  t && t.parentNode && t.parentNode.insertBefore(e, t.nextSibling);
}
function timestampToLocalDateTime(e, t, n) {
  if ("" === e) return "";
  try {
    var o = new Date(e);
    return new Intl.DateTimeFormat(t || "default", n).format(o);
  } catch (i) {
    return "";
  }
}
function addLocalizedDateTimeToElementsTitles(e, t) {
  for (
    var n = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
      },
      o = 0;
    o < e.length;
    o += 1
  ) {
    var i = e[o],
      r = i.getAttribute(t || "datetime");
    if (r) {
      var a = timestampToLocalDateTime(r, navigator.language, n);
      i.setAttribute("title", a);
    }
  }
}
function localizeTimeElements(e, t) {
  for (let n = 0; n < e.length; n += 1) {
    const o = e[n],
      i = o.getAttribute("datetime");
    if (i) {
      const e = timestampToLocalDateTime(i, navigator.language, t);
      o.textContent = e;
    }
  }
}
function localStorageTest() {
  var e = "devtolocalstoragetestforavaialbility";
  try {
    return localStorage.setItem(e, e), localStorage.removeItem(e), !0;
  } catch (t) {
    return !1;
  }
}
function preventDefaultAction(e) {
  e.preventDefault();
}
function sendFetch(e, t) {
  switch (e) {
    case "article-preview":
      return fetchCallback({
        url: "/articles/preview",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: t
      });
    case "reaction-creation":
      return fetchCallback({ url: "/reactions", addTokenToBody: !0, body: t });
    case "image-upload":
      return fetchCallback({
        url: "/image_uploads",
        addTokenToBody: !0,
        body: t
      });
    case "follow-creation":
      return fetchCallback({ url: "/follows", addTokenToBody: !0, body: t });
    case "chat-creation":
      return fetchCallback({
        url: "/chat_channels/create_chat",
        addTokenToBody: !0,
        body: t
      });
    case "block-user":
      return fetchCallback({
        url: "/user_blocks",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        addTokenToBody: !1,
        body: t
      });
    case "comment-creation":
      return fetchCallback({
        url: "/comments",
        headers: { "Content-Type": "application/json" },
        body: t
      });
    case "comment-preview":
      return fetchCallback({
        url: "/comments/preview",
        headers: { "Content-Type": "application/json" },
        body: t
      });
    default:
      console.log("A wrong switchStatement was used.");
  }
  return !0;
}
function sendHapticMessage(e) {
  try {
    window &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.haptic &&
      window.webkit.messageHandlers.haptic.postMessage(e);
  } catch (t) {
    console.log(t.message);
  }
}
function initSignupModal() {
  document.getElementById("global-signup-modal") &&
    (document.getElementById("global-signup-modal-bg").onclick = () => {
      (document.getElementById("global-signup-modal").style.display = "none"),
        document
          .getElementById("global-signup-modal")
          .classList.remove("showing"),
        document.getElementsByTagName("body")[0].classList.remove("modal-open");
    });
}
function showModal() {
  (document.getElementById("global-signup-modal").style.display = "block"),
    document.getElementById("global-signup-modal").classList.add("showing"),
    document.getElementsByTagName("body")[0].classList.add("modal-open"),
    initSignupModal();
}
function slideSidebar(e, t) {
  document.getElementById("sidebar-wrapper-" + e) &&
    ("intoView" === t
      ? (document.getElementById("articles-list").classList.add("modal-open"),
        document.getElementsByTagName("body")[0].classList.add("modal-open"),
        document
          .getElementById("sidebar-wrapper-" + e)
          .classList.add("swiped-in"),
        document
          .getElementById("articles-list")
          .addEventListener("touchmove", preventDefaultAction, !1))
      : (document
          .getElementById("articles-list")
          .classList.remove("modal-open"),
        document.getElementsByTagName("body")[0].classList.remove("modal-open"),
        (document
          .getElementById("sidebar-wrapper-" + e)
          .querySelector(".side-bar").scrollTop = 0),
        document
          .getElementById("sidebar-wrapper-" + e)
          .classList.remove("swiped-in"),
        document
          .getElementById("articles-list")
          .removeEventListener("touchmove", preventDefaultAction, !1)));
}
function secondsToHumanUnitAgo(e) {
  const t = [
    ["second", 1],
    ["min", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
    ["month", 2592e3],
    ["year", 31536e3]
  ];
  if (e < t[0][1]) return "just now";
  let n = 0;
  for (; n + 1 < t.length && e >= t[n + 1][1]; ) n += 1;
  const o = Math.floor(e / t[n][1]);
  return o + " " + (t[n][0] + (1 === o ? "" : "s")) + " ago";
}
function timeAgo(e, t = 86399) {
  const n = new Date() / 1e3,
    o = Math.round(n - e);
  return o > t
    ? ""
    : "<span class='time-ago-indicator'>(" +
        secondsToHumanUnitAgo(o) +
        ")</span>";
}
function userData() {
  const e = document.getElementsByTagName("body")[0].getAttribute("data-user");
  return null === e ? null : JSON.parse(e);
}
function initializePage() {
  initializeLocalStorageRender(),
    initializeStylesheetAppend(),
    initializeFetchFollowedArticles(),
    callInitalizers();
}
function callInitalizers() {
  initializeLocalStorageRender(), initializeBodyData();
  var e = setInterval(function() {
    "true" ==
      document.getElementsByTagName("body")[0].getAttribute("data-loaded") &&
      (clearInterval(e),
      "logged-in" ==
        document
          .getElementsByTagName("body")[0]
          .getAttribute("data-user-status") &&
        (initializeBaseUserData(),
        initializeAllChatButtons(),
        initializeAllTagEditButtons()),
      initializeAllFollowButts(),
      initializeReadingListIcons(),
      initializeSponsorshipVisibility(),
      document.getElementById("sidebar-additional") &&
        document.getElementById("sidebar-additional").classList.add("showing"));
  }, 1);
  initializeBaseTracking(),
    initializeTouchDevice(),
    initializeCommentsPage(),
    initializeArticleDate(),
    initializeArticleReactions(),
    initNotifications(),
    initializeStylesheetAppend(),
    initializeCommentDate(),
    initializeCommentDropdown(),
    initializeSettings(),
    initializeFooterMod(),
    initializeCommentPreview(),
    initializeAdditionalContentBoxes(),
    initializeTimeFixer(),
    initializeDashboardSort(),
    initializePWAFunctionality(),
    initializeEllipsisMenu(),
    initializeArchivedPostFilter(),
    initializeCreditsPage(),
    initializeUserProfilePage(),
    initializeDrawerSliders(),
    (nextPage = 0),
    (fetching = !1),
    (done = !1),
    (adClicked = !1),
    setTimeout(function() {
      done = !1;
    }, 300),
    initScrolling.called || initScrolling();
}
function initializeBaseApp() {
  InstantClick.on("change", function() {
    initializePage();
  }),
    InstantClick.init();
}
var client,
  negativeFollow = -1,
  KEY_CODE_B = 66,
  KEY_CODE_I = 73,
  KEY_CODE_K = 75,
  ENTER_KEY_CODE = 13;
const sponsorClickHandler = e => {
  e.target.classList.contains("follow-action-button") &&
    (handleOptimisticButtRender(e.target), handleFollowButtPress(e.target)),
    ga(
      "send",
      "event",
      "click",
      "click sponsor link",
      e.target.dataset.details,
      null
    );
};
var $fetchedImageUrls = [];
const fetchCallback = ({
  url: e,
  headers: t = {},
  addTokenToBody: n = !1,
  body: o
}) => i => (
  n && o.append("authenticity_token", i),
  window.fetch(e, {
    method: "POST",
    headers: { "X-CSRF-Token": i, ...t },
    body: o,
    credentials: "same-origin"
  })
);
!(function e(t, n, o) {
  function i(a, s) {
    if (!n[a]) {
      if (!t[a]) {
        var c = "function" == typeof require && require;
        if (!s && c) return c(a, !0);
        if (r) return r(a, !0);
        var l = new Error("Cannot find module '" + a + "'");
        throw ((l.code = "MODULE_NOT_FOUND"), l);
      }
      var d = (n[a] = { exports: {} });
      t[a][0].call(
        d.exports,
        function(e) {
          var n = t[a][1][e];
          return i(n || e);
        },
        d,
        d.exports,
        e,
        t,
        n,
        o
      );
    }
    return n[a].exports;
  }
  for (
    var r = "function" == typeof require && require, a = 0;
    a < o.length;
    a++
  )
    i(o[a]);
  return i;
})(
  {
    1: [
      function(e, t, n) {
        function o() {
          return {};
        }
        function i() {}
        function r() {}
        function a() {}
        function s() {}
        function c(e) {
          return e.replace(I, "&lt;").replace(x, "&gt;");
        }
        function l(e, t, n, o) {
          if (((n = h(n)), "href" === t || "src" === t)) {
            if ("#" === (n = T.trim(n))) return "#";
            if (
              "http://" !== n.substr(0, 7) &&
              "https://" !== n.substr(0, 8) &&
              "mailto:" !== n.substr(0, 7) &&
              "#" !== n[0] &&
              "/" !== n[0]
            )
              return "";
          } else if ("background" === t) {
            if (((N.lastIndex = 0), N.test(n))) return "";
          } else if ("style" === t) {
            if (((R.lastIndex = 0), R.test(n))) return "";
            if (
              ((O.lastIndex = 0), O.test(n) && ((N.lastIndex = 0), N.test(n)))
            )
              return "";
            !1 !== o && (n = (o = o || k).process(n));
          }
          return (n = g(n));
        }
        function d(e) {
          return e.replace(S, "&quot;");
        }
        function u(e) {
          return e.replace(L, '"');
        }
        function m(e) {
          return e.replace(B, function(e, t) {
            return "x" === t[0] || "X" === t[0]
              ? String.fromCharCode(parseInt(t.substr(1), 16))
              : String.fromCharCode(parseInt(t, 10));
          });
        }
        function f(e) {
          return e.replace(C, ":").replace(A, " ");
        }
        function p(e) {
          for (var t = "", n = 0, o = e.length; n < o; n++)
            t += e.charCodeAt(n) < 32 ? " " : e.charAt(n);
          return T.trim(t);
        }
        function h(e) {
          return (e = p((e = f((e = m((e = u(e))))))));
        }
        function g(e) {
          return (e = c((e = d(e))));
        }
        function y() {
          return "";
        }
        function v(e, t) {
          function n(t) {
            return !!o || -1 !== T.indexOf(e, t);
          }
          "function" != typeof t && (t = function() {});
          var o = !Array.isArray(e),
            i = [],
            r = !1;
          return {
            onIgnoreTag: function(e, o, a) {
              if (n(e)) {
                if (a.isClosing) {
                  var s = "[/removed]",
                    c = a.position + s.length;
                  return i.push([!1 !== r ? r : a.position, c]), (r = !1), s;
                }
                return r || (r = a.position), "[removed]";
              }
              return t(e, o, a);
            },
            remove: function(e) {
              var t = "",
                n = 0;
              return (
                T.forEach(i, function(o) {
                  (t += e.slice(n, o[0])), (n = o[1]);
                }),
                (t += e.slice(n))
              );
            }
          };
        }
        function b(e) {
          return e.replace(M, "");
        }
        function w(e) {
          var t = e.split("");
          return (t = t.filter(function(e) {
            var t = e.charCodeAt(0);
            return 127 !== t && (!(t <= 31) || 10 === t || 13 === t);
          })).join("");
        }
        var _ = e("cssfilter").FilterCSS,
          E = e("cssfilter").getDefaultWhiteList,
          T = e("./util"),
          k = new _(),
          I = /</g,
          x = />/g,
          S = /"/g,
          L = /&quot;/g,
          B = /&#([a-zA-Z0-9]*);?/gim,
          C = /&colon;?/gim,
          A = /&newline;?/gim,
          N = /((j\s*a\s*v\s*a|v\s*b|l\s*i\s*v\s*e)\s*s\s*c\s*r\s*i\s*p\s*t\s*|m\s*o\s*c\s*h\s*a)\:/gi,
          R = /e\s*x\s*p\s*r\s*e\s*s\s*s\s*i\s*o\s*n\s*\(.*/gi,
          O = /u\s*r\s*l\s*\(.*/gi,
          M = /<!--[\s\S]*?-->/g;
        (n.whiteList = o()),
          (n.getDefaultWhiteList = o),
          (n.onTag = i),
          (n.onIgnoreTag = r),
          (n.onTagAttr = a),
          (n.onIgnoreTagAttr = s),
          (n.safeAttrValue = l),
          (n.escapeHtml = c),
          (n.escapeQuote = d),
          (n.unescapeQuote = u),
          (n.escapeHtmlEntities = m),
          (n.escapeDangerHtml5Entities = f),
          (n.clearNonPrintableCharacter = p),
          (n.friendlyAttrValue = h),
          (n.escapeAttrValue = g),
          (n.onIgnoreTagStripAll = y),
          (n.StripTagBody = v),
          (n.stripCommentTag = b),
          (n.stripBlankChar = w),
          (n.cssFilter = k),
          (n.getDefaultCSSWhiteList = E);
      },
      { "./util": 4, cssfilter: 8 }
    ],
    2: [
      function(e, t, n) {
        function o(e, t) {
          return new a(t).process(e);
        }
        var i = e("./default"),
          r = e("./parser"),
          a = e("./xss");
        for (var s in (((n = t.exports = o).FilterXSS = a), i)) n[s] = i[s];
        for (var s in r) n[s] = r[s];
        "undefined" != typeof window && (window.filterXSS = t.exports);
      },
      { "./default": 1, "./parser": 3, "./xss": 5 }
    ],
    3: [
      function(e, t, n) {
        function o(e) {
          var t = e.indexOf(" ");
          if (-1 === t) var n = e.slice(1, -1);
          else n = e.slice(1, t + 1);
          return (
            "/" === (n = u.trim(n).toLowerCase()).slice(0, 1) &&
              (n = n.slice(1)),
            "/" === n.slice(-1) && (n = n.slice(0, -1)),
            n
          );
        }
        function i(e) {
          return "</" === e.slice(0, 2);
        }
        function r(e, t, n) {
          "user strict";
          var r = "",
            a = 0,
            s = !1,
            c = !1,
            l = 0,
            d = e.length,
            u = "",
            m = "";
          for (l = 0; l < d; l++) {
            var f = e.charAt(l);
            if (!1 === s) {
              if ("<" === f) {
                s = l;
                continue;
              }
            } else if (!1 === c) {
              if ("<" === f) {
                (r += n(e.slice(a, l))), (s = l), (a = l);
                continue;
              }
              if (">" === f) {
                (r += n(e.slice(a, s))),
                  (m = o((u = e.slice(s, l + 1)))),
                  (r += t(s, r.length, m, u, i(u))),
                  (a = l + 1),
                  (s = !1);
                continue;
              }
              if (('"' === f || "'" === f) && "=" === e.charAt(l - 1)) {
                c = f;
                continue;
              }
            } else if (f === c) {
              c = !1;
              continue;
            }
          }
          return a < e.length && (r += n(e.substr(a))), r;
        }
        function a(e, t) {
          "user strict";
          function n(e, n) {
            if (
              !((e = (e = u.trim(e)).replace(m, "").toLowerCase()).length < 1)
            ) {
              var o = t(e, n || "");
              o && i.push(o);
            }
          }
          for (var o = 0, i = [], r = !1, a = e.length, l = 0; l < a; l++) {
            var f,
              p = e.charAt(l);
            if (!1 !== r || "=" !== p)
              if (
                !1 === r ||
                l !== o ||
                ('"' !== p && "'" !== p) ||
                "=" !== e.charAt(l - 1)
              )
                if (" " !== p);
                else {
                  if (!1 === r) {
                    if (-1 === (f = s(e, l))) {
                      n(u.trim(e.slice(o, l))), (r = !1), (o = l + 1);
                      continue;
                    }
                    l = f - 1;
                    continue;
                  }
                  if (-1 === (f = c(e, l - 1))) {
                    n(r, d(u.trim(e.slice(o, l)))), (r = !1), (o = l + 1);
                    continue;
                  }
                }
              else {
                if (-1 === (f = e.indexOf(p, l + 1))) break;
                n(r, u.trim(e.slice(o + 1, f))), (r = !1), (o = (l = f) + 1);
              }
            else (r = e.slice(o, l)), (o = l + 1);
          }
          return (
            o < e.length &&
              (!1 === r ? n(e.slice(o)) : n(r, d(u.trim(e.slice(o))))),
            u.trim(i.join(" "))
          );
        }
        function s(e, t) {
          for (; t < e.length; t++) {
            var n = e[t];
            if (" " !== n) return "=" === n ? t : -1;
          }
        }
        function c(e, t) {
          for (; t > 0; t--) {
            var n = e[t];
            if (" " !== n) return "=" === n ? t : -1;
          }
        }
        function l(e) {
          return (
            ('"' === e[0] && '"' === e[e.length - 1]) ||
            ("'" === e[0] && "'" === e[e.length - 1])
          );
        }
        function d(e) {
          return l(e) ? e.substr(1, e.length - 2) : e;
        }
        var u = e("./util"),
          m = /[^a-zA-Z0-9_:\.\-]/gim;
        (n.parseTag = r), (n.parseAttr = a);
      },
      { "./util": 4 }
    ],
    4: [
      function(e, t) {
        t.exports = {
          indexOf: function(e, t) {
            var n, o;
            if (Array.prototype.indexOf) return e.indexOf(t);
            for (n = 0, o = e.length; n < o; n++) if (e[n] === t) return n;
            return -1;
          },
          forEach: function(e, t, n) {
            var o, i;
            if (Array.prototype.forEach) return e.forEach(t, n);
            for (o = 0, i = e.length; o < i; o++) t.call(n, e[o], o, e);
          },
          trim: function(e) {
            return String.prototype.trim
              ? e.trim()
              : e.replace(/(^\s*)|(\s*$)/g, "");
          }
        };
      },
      {}
    ],
    5: [
      function(e, t) {
        function n(e) {
          return e === undefined || null === e;
        }
        function o(e) {
          var t = e.indexOf(" ");
          if (-1 === t) return { html: "", closing: "/" === e[e.length - 2] };
          var n = "/" === (e = u.trim(e.slice(t + 1, -1)))[e.length - 1];
          return n && (e = u.trim(e.slice(0, -1))), { html: e, closing: n };
        }
        function i(e) {
          var t = {};
          for (var n in e) t[n] = e[n];
          return t;
        }
        function r(e) {
          (e = i(e || {})).stripIgnoreTag &&
            (e.onIgnoreTag &&
              console.error(
                'Notes: cannot use these two options "stripIgnoreTag" and "onIgnoreTag" at the same time'
              ),
            (e.onIgnoreTag = s.onIgnoreTagStripAll)),
            (e.whiteList = e.whiteList || s.whiteList),
            (e.onTag = e.onTag || s.onTag),
            (e.onTagAttr = e.onTagAttr || s.onTagAttr),
            (e.onIgnoreTag = e.onIgnoreTag || s.onIgnoreTag),
            (e.onIgnoreTagAttr = e.onIgnoreTagAttr || s.onIgnoreTagAttr),
            (e.safeAttrValue = e.safeAttrValue || s.safeAttrValue),
            (e.escapeHtml = e.escapeHtml || s.escapeHtml),
            (this.options = e),
            !1 === e.css
              ? (this.cssFilter = !1)
              : ((e.css = e.css || {}), (this.cssFilter = new a(e.css)));
        }
        var a = e("cssfilter").FilterCSS,
          s = e("./default"),
          c = e("./parser"),
          l = c.parseTag,
          d = c.parseAttr,
          u = e("./util");
        (r.prototype.process = function(e) {
          if (!(e = (e = e || "").toString())) return "";
          var t = this,
            i = t.options,
            r = i.whiteList,
            a = i.onTag,
            c = i.onIgnoreTag,
            m = i.onTagAttr,
            f = i.onIgnoreTagAttr,
            p = i.safeAttrValue,
            h = i.escapeHtml,
            g = t.cssFilter;
          i.stripBlankChar && (e = s.stripBlankChar(e)),
            i.allowCommentTag || (e = s.stripCommentTag(e));
          var y = !1;
          if (i.stripIgnoreTagBody) {
            y = s.StripTagBody(i.stripIgnoreTagBody, c);
            c = y.onIgnoreTag;
          }
          var v = l(
            e,
            function(e, t, i, s, l) {
              var y,
                v = {
                  sourcePosition: e,
                  position: t,
                  isClosing: l,
                  isWhite: i in r
                };
              if (!n((y = a(i, s, v)))) return y;
              if (v.isWhite) {
                if (v.isClosing) return "</" + i + ">";
                var b = o(s),
                  w = r[i],
                  _ = d(b.html, function(e, t) {
                    var o,
                      r = -1 !== u.indexOf(w, e);
                    return n((o = m(i, e, t, r)))
                      ? r
                        ? (t = p(i, e, t, g))
                          ? e + '="' + t + '"'
                          : e
                        : n((o = f(i, e, t, r)))
                        ? void 0
                        : o
                      : o;
                  });
                s = "<" + i;
                return (
                  _ && (s += " " + _), b.closing && (s += " /"), (s += ">")
                );
              }
              return n((y = c(i, s, v))) ? h(s) : y;
            },
            h
          );
          return y && (v = y.remove(v)), v;
        }),
          (t.exports = r);
      },
      { "./default": 1, "./parser": 3, "./util": 4, cssfilter: 8 }
    ],
    6: [
      function(e, t) {
        function n(e) {
          return e === undefined || null === e;
        }
        function o(e) {
          var t = {};
          for (var n in e) t[n] = e[n];
          return t;
        }
        function i(e) {
          ((e = o(e || {})).whiteList = e.whiteList || r.whiteList),
            (e.onAttr = e.onAttr || r.onAttr),
            (e.onIgnoreAttr = e.onIgnoreAttr || r.onIgnoreAttr),
            (this.options = e);
        }
        var r = e("./default"),
          a = e("./parser");
        e("./util");
        (i.prototype.process = function(e) {
          if (!(e = (e = e || "").toString())) return "";
          var t = this.options,
            o = t.whiteList,
            i = t.onAttr,
            r = t.onIgnoreAttr;
          return a(e, function(e, t, a, s, c) {
            var l = o[a],
              d = !1;
            !0 === l
              ? (d = l)
              : "function" == typeof l
              ? (d = l(s))
              : l instanceof RegExp && (d = l.test(s)),
              !0 !== d && (d = !1);
            var u,
              m = { position: t, sourcePosition: e, source: c, isWhite: d };
            return d
              ? n((u = i(a, s, m)))
                ? a + ":" + s
                : u
              : n((u = r(a, s, m)))
              ? void 0
              : u;
          });
        }),
          (t.exports = i);
      },
      { "./default": 7, "./parser": 9, "./util": 10 }
    ],
    7: [
      function(e, t, n) {
        function o() {
          var e = {
            "align-content": !1,
            "align-items": !1,
            "align-self": !1,
            "alignment-adjust": !1,
            "alignment-baseline": !1,
            all: !1,
            "anchor-point": !1,
            animation: !1,
            "animation-delay": !1,
            "animation-direction": !1,
            "animation-duration": !1,
            "animation-fill-mode": !1,
            "animation-iteration-count": !1,
            "animation-name": !1,
            "animation-play-state": !1,
            "animation-timing-function": !1,
            azimuth: !1,
            "backface-visibility": !1,
            background: !0,
            "background-attachment": !0,
            "background-clip": !0,
            "background-color": !0,
            "background-image": !0,
            "background-origin": !0,
            "background-position": !0,
            "background-repeat": !0,
            "background-size": !0,
            "baseline-shift": !1,
            binding: !1,
            bleed: !1,
            "bookmark-label": !1,
            "bookmark-level": !1,
            "bookmark-state": !1,
            border: !0,
            "border-bottom": !0,
            "border-bottom-color": !0,
            "border-bottom-left-radius": !0,
            "border-bottom-right-radius": !0,
            "border-bottom-style": !0,
            "border-bottom-width": !0,
            "border-collapse": !0,
            "border-color": !0,
            "border-image": !0,
            "border-image-outset": !0,
            "border-image-repeat": !0,
            "border-image-slice": !0,
            "border-image-source": !0,
            "border-image-width": !0,
            "border-left": !0,
            "border-left-color": !0,
            "border-left-style": !0,
            "border-left-width": !0,
            "border-radius": !0,
            "border-right": !0,
            "border-right-color": !0,
            "border-right-style": !0,
            "border-right-width": !0,
            "border-spacing": !0,
            "border-style": !0,
            "border-top": !0,
            "border-top-color": !0,
            "border-top-left-radius": !0,
            "border-top-right-radius": !0,
            "border-top-style": !0,
            "border-top-width": !0,
            "border-width": !0,
            bottom: !1,
            "box-decoration-break": !0,
            "box-shadow": !0,
            "box-sizing": !0,
            "box-snap": !0,
            "box-suppress": !0,
            "break-after": !0,
            "break-before": !0,
            "break-inside": !0,
            "caption-side": !1,
            chains: !1,
            clear: !0,
            clip: !1,
            "clip-path": !1,
            "clip-rule": !1,
            color: !0,
            "color-interpolation-filters": !0,
            "column-count": !1,
            "column-fill": !1,
            "column-gap": !1,
            "column-rule": !1,
            "column-rule-color": !1,
            "column-rule-style": !1,
            "column-rule-width": !1,
            "column-span": !1,
            "column-width": !1,
            columns: !1,
            contain: !1,
            content: !1,
            "counter-increment": !1,
            "counter-reset": !1,
            "counter-set": !1,
            crop: !1,
            cue: !1,
            "cue-after": !1,
            "cue-before": !1,
            cursor: !1,
            direction: !1,
            display: !0,
            "display-inside": !0,
            "display-list": !0,
            "display-outside": !0,
            "dominant-baseline": !1,
            elevation: !1,
            "empty-cells": !1,
            filter: !1,
            flex: !1,
            "flex-basis": !1,
            "flex-direction": !1,
            "flex-flow": !1,
            "flex-grow": !1,
            "flex-shrink": !1,
            "flex-wrap": !1,
            float: !1,
            "float-offset": !1,
            "flood-color": !1,
            "flood-opacity": !1,
            "flow-from": !1,
            "flow-into": !1,
            font: !0,
            "font-family": !0,
            "font-feature-settings": !0,
            "font-kerning": !0,
            "font-language-override": !0,
            "font-size": !0,
            "font-size-adjust": !0,
            "font-stretch": !0,
            "font-style": !0,
            "font-synthesis": !0,
            "font-variant": !0,
            "font-variant-alternates": !0,
            "font-variant-caps": !0,
            "font-variant-east-asian": !0,
            "font-variant-ligatures": !0,
            "font-variant-numeric": !0,
            "font-variant-position": !0,
            "font-weight": !0,
            grid: !1,
            "grid-area": !1,
            "grid-auto-columns": !1,
            "grid-auto-flow": !1,
            "grid-auto-rows": !1,
            "grid-column": !1,
            "grid-column-end": !1,
            "grid-column-start": !1,
            "grid-row": !1,
            "grid-row-end": !1,
            "grid-row-start": !1,
            "grid-template": !1,
            "grid-template-areas": !1,
            "grid-template-columns": !1,
            "grid-template-rows": !1,
            "hanging-punctuation": !1,
            height: !0,
            hyphens: !1,
            icon: !1,
            "image-orientation": !1,
            "image-resolution": !1,
            "ime-mode": !1,
            "initial-letters": !1,
            "inline-box-align": !1,
            "justify-content": !1,
            "justify-items": !1,
            "justify-self": !1,
            left: !1,
            "letter-spacing": !0,
            "lighting-color": !0,
            "line-box-contain": !1,
            "line-break": !1,
            "line-grid": !1,
            "line-height": !1,
            "line-snap": !1,
            "line-stacking": !1,
            "line-stacking-ruby": !1,
            "line-stacking-shift": !1,
            "line-stacking-strategy": !1,
            "list-style": !0,
            "list-style-image": !0,
            "list-style-position": !0,
            "list-style-type": !0,
            margin: !0,
            "margin-bottom": !0,
            "margin-left": !0,
            "margin-right": !0,
            "margin-top": !0,
            "marker-offset": !1,
            "marker-side": !1,
            marks: !1,
            mask: !1,
            "mask-box": !1,
            "mask-box-outset": !1,
            "mask-box-repeat": !1,
            "mask-box-slice": !1,
            "mask-box-source": !1,
            "mask-box-width": !1,
            "mask-clip": !1,
            "mask-image": !1,
            "mask-origin": !1,
            "mask-position": !1,
            "mask-repeat": !1,
            "mask-size": !1,
            "mask-source-type": !1,
            "mask-type": !1,
            "max-height": !0,
            "max-lines": !1,
            "max-width": !0,
            "min-height": !0,
            "min-width": !0,
            "move-to": !1,
            "nav-down": !1,
            "nav-index": !1,
            "nav-left": !1,
            "nav-right": !1,
            "nav-up": !1,
            "object-fit": !1,
            "object-position": !1,
            opacity: !1,
            order: !1,
            orphans: !1,
            outline: !1,
            "outline-color": !1,
            "outline-offset": !1,
            "outline-style": !1,
            "outline-width": !1,
            overflow: !1,
            "overflow-wrap": !1,
            "overflow-x": !1,
            "overflow-y": !1,
            padding: !0,
            "padding-bottom": !0,
            "padding-left": !0,
            "padding-right": !0,
            "padding-top": !0,
            page: !1,
            "page-break-after": !1,
            "page-break-before": !1,
            "page-break-inside": !1,
            "page-policy": !1,
            pause: !1,
            "pause-after": !1,
            "pause-before": !1,
            perspective: !1,
            "perspective-origin": !1,
            pitch: !1,
            "pitch-range": !1,
            "play-during": !1,
            position: !1,
            "presentation-level": !1,
            quotes: !1,
            "region-fragment": !1,
            resize: !1,
            rest: !1,
            "rest-after": !1,
            "rest-before": !1,
            richness: !1,
            right: !1,
            rotation: !1,
            "rotation-point": !1,
            "ruby-align": !1,
            "ruby-merge": !1,
            "ruby-position": !1,
            "shape-image-threshold": !1,
            "shape-outside": !1,
            "shape-margin": !1,
            size: !1,
            speak: !1,
            "speak-as": !1,
            "speak-header": !1,
            "speak-numeral": !1,
            "speak-punctuation": !1,
            "speech-rate": !1,
            stress: !1,
            "string-set": !1,
            "tab-size": !1,
            "table-layout": !1,
            "text-align": !0,
            "text-align-last": !0,
            "text-combine-upright": !0,
            "text-decoration": !0,
            "text-decoration-color": !0,
            "text-decoration-line": !0,
            "text-decoration-skip": !0,
            "text-decoration-style": !0,
            "text-emphasis": !0,
            "text-emphasis-color": !0,
            "text-emphasis-position": !0,
            "text-emphasis-style": !0,
            "text-height": !0,
            "text-indent": !0,
            "text-justify": !0,
            "text-orientation": !0,
            "text-overflow": !0,
            "text-shadow": !0,
            "text-space-collapse": !0,
            "text-transform": !0,
            "text-underline-position": !0,
            "text-wrap": !0,
            top: !1,
            transform: !1,
            "transform-origin": !1,
            "transform-style": !1,
            transition: !1,
            "transition-delay": !1,
            "transition-duration": !1,
            "transition-property": !1,
            "transition-timing-function": !1,
            "unicode-bidi": !1,
            "vertical-align": !1,
            visibility: !1,
            "voice-balance": !1,
            "voice-duration": !1,
            "voice-family": !1,
            "voice-pitch": !1,
            "voice-range": !1,
            "voice-rate": !1,
            "voice-stress": !1,
            "voice-volume": !1,
            volume: !1,
            "white-space": !1,
            widows: !1,
            width: !0,
            "will-change": !1,
            "word-break": !0,
            "word-spacing": !0,
            "word-wrap": !0,
            "wrap-flow": !1,
            "wrap-through": !1,
            "writing-mode": !1,
            "z-index": !1
          };
          return e;
        }
        function i() {}
        function r() {}
        (n.whiteList = o()),
          (n.getDefaultWhiteList = o),
          (n.onAttr = i),
          (n.onIgnoreAttr = r);
      },
      {}
    ],
    8: [
      function(e, t, n) {
        function o(e, t) {
          return new r(t).process(e);
        }
        var i = e("./default"),
          r = e("./css");
        for (var a in (((n = t.exports = o).FilterCSS = r), i)) n[a] = i[a];
        "undefined" != typeof window && (window.filterCSS = t.exports);
      },
      { "./css": 6, "./default": 7 }
    ],
    9: [
      function(e, t) {
        function n(e, t) {
          function n() {
            if (!r) {
              var n = o.trim(e.slice(a, s)),
                i = n.indexOf(":");
              if (-1 !== i) {
                var l = o.trim(n.slice(0, i)),
                  d = o.trim(n.slice(i + 1));
                if (l) {
                  var u = t(a, c.length, l, d, n);
                  u && (c += u + "; ");
                }
              }
            }
            a = s + 1;
          }
          ";" !== (e = o.trimRight(e))[e.length - 1] && (e += ";");
          for (var i = e.length, r = !1, a = 0, s = 0, c = ""; s < i; s++) {
            var l = e[s];
            if ("/" === l && "*" === e[s + 1]) {
              var d = e.indexOf("*/", s + 2);
              if (-1 === d) break;
              (a = (s = d + 1) + 1), (r = !1);
            } else
              "(" === l
                ? (r = !0)
                : ")" === l
                ? (r = !1)
                : ";" === l
                ? r || n()
                : "\n" === l && n();
          }
          return o.trim(c);
        }
        var o = e("./util");
        t.exports = n;
      },
      { "./util": 10 }
    ],
    10: [
      function(e, t) {
        t.exports = {
          indexOf: function(e, t) {
            var n, o;
            if (Array.prototype.indexOf) return e.indexOf(t);
            for (n = 0, o = e.length; n < o; n++) if (e[n] === t) return n;
            return -1;
          },
          forEach: function(e, t, n) {
            var o, i;
            if (Array.prototype.forEach) return e.forEach(t, n);
            for (o = 0, i = e.length; o < i; o++) t.call(n, e[o], o, e);
          },
          trim: function(e) {
            return String.prototype.trim
              ? e.trim()
              : e.replace(/(^\s*)|(\s*$)/g, "");
          },
          trimRight: function(e) {
            return String.prototype.trimRight
              ? e.trimRight()
              : e.replace(/(\s*$)/g, "");
          }
        };
      },
      {}
    ]
  },
  {},
  [2]
),
  (function(e, t) {
    "use strict";
    var n = {};
    !(function() {
      var e = document.getElementsByTagName("script"),
        t = e[e.length - 1];
      if (t)
        for (var o, i = t.attributes, r = 0, a = i.length; r < a; r++)
          /data-(\w+)$/.test(i[r].nodeName) &&
            ("false" === (o = i[r].nodeValue) && (o = !1), (n[RegExp.$1] = o));
    })();
    var o = function() {
      var e = t(),
        o = e(n);
      return (o.factory = e), o;
    };
    "function" == typeof define && define.amd
      ? define([], o)
      : "object" == typeof module && module.exports
      ? (module.exports = o())
      : (e.Honeybadger = o());
  })(this, function() {
    function e(e, t) {
      var n = {};
      for (var o in e) n[o] = e[o];
      for (var o in t) n[o] = t[o];
      return n;
    }
    function t(e) {
      return (
        !!c &&
        c.name === e.name && c.message === e.message && c.stack === e.stack
      );
    }
    function n(e, t) {
      var n = e.message;
      for (var o in t) if (n.match(t[o])) return !0;
      return !1;
    }
    function o() {
      var e = {};
      return (
        (e.HTTP_USER_AGENT = navigator.userAgent),
        document.referrer.match(/\S/) && (e.HTTP_REFERER = document.referrer),
        e
      );
    }
    function i(e) {
      if ("object" != typeof e) return undefined;
      var t = [];
      for (var n in e) t.push(n + "=" + e[n]);
      return t.join(";");
    }
    function r(e) {
      return e.stacktrace || e.stack || undefined;
    }
    function a(e) {
      var t,
        n = 10;
      if (e && (t = r(e))) return { stack: t, generator: undefined };
      try {
        throw new Error("");
      } catch (i) {
        if ((t = r(i))) return { stack: t, generator: "throw" };
      }
      t = ["<call-stack>"];
      for (var o = arguments.callee; o && t.length < n; ) {
        /function(?:\s+([\w$]+))+\s*\(/.test(o.toString())
          ? t.push(RegExp.$1 || "<anonymous>")
          : t.push("<anonymous>");
        try {
          o = o.caller;
        } catch (i) {
          break;
        }
      }
      return { stack: t.join("\n"), generator: "walk" };
    }
    function s(e, t) {
      var n, o;
      for (n = 0, o = e.length; n < o; n++) if (!1 === (0, e[n])(t)) return !0;
      return !1;
    }
    var c,
      l,
      d = "0.5.0",
      u = {
        name: "honeybadger.js",
        url: "https://github.com/honeybadger-io/honeybadger-js",
        version: d,
        language: "javascript"
      },
      m = !1,
      f = !1;
    return function(p) {
      function h(e) {
        g("debug") && this.console && console.log(e);
      }
      function g(e, t) {
        var n = L[e];
        return (
          n === undefined && (n = L[e.toLowerCase()]),
          "false" === n && (n = !1),
          n !== undefined ? n : t
        );
      }
      function y() {
        return (
          "http" +
          (g("ssl", !0) ? "s" : "") +
          "://" +
          g("host", "api.honeybadger.io")
        );
      }
      function v(e) {
        return (
          !/function|symbol/.test(typeof e) &&
          ("object" != typeof e || "undefined" != typeof e.hasOwnProperty)
        );
      }
      function b(e, t, n) {
        var o, i, r, a;
        if (((r = []), n || (n = 0), n >= g("max_depth", 8)))
          return encodeURIComponent(t) + "=[MAX DEPTH REACHED]";
        for (o in e)
          (a = e[o]),
            e.hasOwnProperty(o) &&
              null != o &&
              null != a &&
              (v(a) || (a = Object.prototype.toString.call(a)),
              (i = t ? t + "[" + o + "]" : o),
              r.push(
                "object" == typeof a
                  ? b(a, i, n + 1)
                  : encodeURIComponent(i) + "=" + encodeURIComponent(a)
              ));
        return r.join("&");
      }
      function w(e) {
        try {
          var t = new (this.XMLHttpRequest || ActiveXObject)(
            "MSXML2.XMLHTTP.3.0"
          );
          return t.open("GET", e, g("async", !0)), void t.send();
        } catch (n) {
          h("Error encountered during XHR request (will retry): " + n);
        }
        new Image().src = e;
      }
      function _(e) {
        c = l = null;
        var t = g("apiKey", g("api_key"));
        return t
          ? (w(
              y() +
                "/v1/notices/js.gif?" +
                b({ notice: e }) +
                "&api_key=" +
                t +
                "&t=" +
                new Date().getTime()
            ),
            !0)
          : (h("Unable to send error report: no API key has been configured."),
            !1);
      }
      function E(a, d) {
        if (g("disabled", !1)) return !1;
        if ("object" != typeof a) return !1;
        if ("[object Error]" === Object.prototype.toString.call(a)) {
          var f = a;
          a = e(a, { name: f.name, message: f.message, stack: r(f) });
        }
        if (t(a)) return !1;
        if (
          (l && m && _(l),
          0 ===
            (function() {
              var e, t;
              for (e in ((t = []), a))
                ({}.hasOwnProperty.call(a, e) && t.push(e));
              return t;
            })().length)
        )
          return !1;
        if ((d && (a = e(a, d)), n(a, g("ignorePatterns")))) return !1;
        if (s(L.beforeNotifyHandlers, a)) return !1;
        var p = o();
        "string" == typeof a.cookies
          ? (p.HTTP_COOKIE = a.cookies)
          : "object" == typeof a.cookies && (p.HTTP_COOKIE = i(a.cookies));
        var y = {
          notifier: u,
          error: {
            class: a.name || "Error",
            message: a.message,
            backtrace: a.stack,
            generator: a.generator,
            fingerprint: a.fingerprint
          },
          request: {
            url: a.url || document.URL,
            component: a.component || g("component"),
            action: a.action || g("action"),
            context: e(L.context, a.context),
            cgi_data: p,
            params: a.params
          },
          server: {
            project_root:
              a.projectRoot ||
              a.project_root ||
              g(
                "projectRoot",
                g(
                  "project_root",
                  window.location.protocol + "//" + window.location.host
                )
              ),
            environment_name: a.environment || g("environment"),
            revision: a.revision || g("revision")
          }
        };
        return (
          (l = y),
          (c = a),
          m
            ? (h("Deferring notice.", a, y),
              window.setTimeout(function() {
                t(a) && _(y);
              }))
            : (h("Queuing notice.", a, y), S.push(y)),
          a
        );
      }
      function T(e) {
        return (
          "function" != typeof Object.isExtensible || Object.isExtensible(e)
        );
      }
      function k(e, t) {
        try {
          return "function" != typeof e
            ? e
            : T(e)
            ? (e.___hb ||
                (e.___hb = function() {
                  var n = g("onerror", !0);
                  if (!((C && (n || t)) || (t && !n)))
                    return e.apply(this, arguments);
                  try {
                    return e.apply(this, arguments);
                  } catch (o) {
                    throw (E(o), o);
                  }
                }),
              e.___hb)
            : e;
        } catch (n) {
          return e;
        }
      }
      function I(e, t, n) {
        if (!f && e && t && n) {
          var o = e[t];
          e[t] = n(o);
        }
      }
      var x = [],
        S = [],
        L = { context: {}, beforeNotifyHandlers: [] };
      if ("object" == typeof p) for (var B in p) L[B] = p[B];
      var C = !0;
      if ((window.atob || (C = !1), window.ErrorEvent))
        try {
          0 === new window.ErrorEvent("").colno && (C = !1);
        } catch (O) {}
      (L.notify = function(t, n, o) {
        if (
          (t || (t = {}),
          "[object Error]" === Object.prototype.toString.call(t))
        ) {
          var i = t;
          t = e(t, { name: i.name, message: i.message, stack: r(i) });
        }
        "object" != typeof t && (t = { message: String(t) });
        n && "object" != typeof n && (n = { name: String(n) });
        return (
          n && (t = e(t, n)), "object" == typeof o && (t = e(t, o)), E(t, a(t))
        );
      }),
        (L.wrap = function(e) {
          return k(e, !0);
        }),
        (L.setContext = function(t) {
          return "object" == typeof t && (L.context = e(L.context, t)), L;
        }),
        (L.resetContext = function(t) {
          return (L.context = "object" == typeof t ? e({}, t) : {}), L;
        }),
        (L.configure = function(e) {
          for (var t in e) L[t] = e[t];
          return L;
        }),
        (L.beforeNotify = function(e) {
          return L.beforeNotifyHandlers.push(e), L;
        });
      var A =
        [].indexOf ||
        function(e) {
          for (var t = 0, n = this.length; t < n; t++)
            if (t in this && this[t] === e) return t;
          return -1;
        };
      (L.reset = function() {
        for (var e in ((L.context = {}), (L.beforeNotifyHandlers = []), L))
          -1 == A.call(x, e) && (L[e] = undefined);
        return L;
      }),
        (L.getVersion = function() {
          return d;
        });
      var N = function(e) {
        return function(t, n) {
          if ("function" == typeof t) {
            var o = Array.prototype.slice.call(arguments, 2);
            return (
              (t = k(t)),
              e(function() {
                t.apply(null, o);
              }, n)
            );
          }
          return e(t, n);
        };
      };
      for (var B in (I(window, "setTimeout", N),
      I(window, "setInterval", N),
      "EventTarget Window Node ApplicationCache AudioTrackList ChannelMergerNode CryptoOperation EventSource FileReader HTMLUnknownElement IDBDatabase IDBRequest IDBTransaction KeyOperation MediaController MessagePort ModalWindow Notification SVGElementInstance Screen TextTrack TextTrackCue TextTrackList WebSocket WebSocketWorker Worker XMLHttpRequest XMLHttpRequestEventTarget XMLHttpRequestUpload".replace(
        /\w+/g,
        function(e) {
          var t = window[e] && window[e].prototype;
          t &&
            t.hasOwnProperty &&
            t.hasOwnProperty("addEventListener") &&
            (I(t, "addEventListener", function(e) {
              return function(t, n, o, i) {
                try {
                  n &&
                    null != n.handleEvent &&
                    (n.handleEvent = k(n.handleEvent));
                } catch (r) {
                  h(r);
                }
                return e.call(this, t, k(n), o, i);
              };
            }),
            I(t, "removeEventListener", function(e) {
              return function(t, n, o, i) {
                return e.call(this, t, n, o, i), e.call(this, t, k(n), o, i);
              };
            }));
        }
      ),
      I(window, "onerror", function(e) {
        function t(e, t, n, o, i) {
          c ||
            (g("onerror", !0) &&
              (0 === n && /Script error\.?/.test(e)
                ? h(
                    "Ignoring cross-domain script error. Use CORS to enable tracking of these types of errors."
                  )
                : (h("Error caught by window.onerror"),
                  E(
                    i || {
                      name: "window.onerror",
                      message: e,
                      stack: [
                        e,
                        "\n    at ? (",
                        t || "unknown",
                        ":",
                        n || 0,
                        ":",
                        o || 0,
                        ")"
                      ].join("")
                    }
                  ))));
        }
        return function(n, o, i, r, a) {
          return (
            t(n, o, i, r, a), "function" == typeof e && e.apply(this, arguments)
          );
        };
      }),
      (f = !0),
      L))
        x.push(B);
      if (
        (h("Initializing honeybadger.js " + d),
        /complete|interactive|loaded/.test(document.readyState))
      )
        (m = !0), h("honeybadger.js " + d + " ready");
      else {
        h("Installing ready handler");
        var R = function() {
          var e;
          for (m = !0, h("honeybadger.js " + d + " ready"); (e = S.pop()); )
            _(e);
        };
        document.addEventListener
          ? document.addEventListener("DOMContentLoaded", R, !0)
          : window.attachEvent("onload", R);
      }
      return L;
    };
  }),
  "serviceWorker" in navigator &&
    navigator.serviceWorker
      .register("/serviceworker.js", { scope: "/" })
      .then(function() {})
      ["catch"](e => {
        console.log("ServiceWorker registration failed: ", e);
      }),
  window.addEventListener("beforeinstallprompt", e => {
    e.userChoice.then(e => {
      ga("send", "event", "PWA-install", e.outcome);
    });
  }),
  (function(e) {
    var t;
    "undefined" != typeof window
      ? (t = window)
      : "undefined" != typeof self && (t = self),
      (t.ALGOLIA_MIGRATION_LAYER = e());
  })(function() {
    return (function e(t, n, o) {
      function i(a, s) {
        if (!n[a]) {
          if (!t[a]) {
            var c = "function" == typeof require && require;
            if (!s && c) return c(a, !0);
            if (r) return r(a, !0);
            var l = new Error("Cannot find module '" + a + "'");
            throw ((l.code = "MODULE_NOT_FOUND"), l);
          }
          var d = (n[a] = { exports: {} });
          t[a][0].call(
            d.exports,
            function(e) {
              var n = t[a][1][e];
              return i(n || e);
            },
            d,
            d.exports,
            e,
            t,
            n,
            o
          );
        }
        return n[a].exports;
      }
      for (
        var r = "function" == typeof require && require, a = 0;
        a < o.length;
        a++
      )
        i(o[a]);
      return i;
    })(
      {
        1: [
          function(e, t) {
            function n(e, t) {
              for (var n in t) e.setAttribute(n, t[n]);
            }
            function o(e, t) {
              (e.onload = function() {
                (this.onerror = this.onload = null), t(null, e);
              }),
                (e.onerror = function() {
                  (this.onerror = this.onload = null),
                    t(new Error("Failed to load " + this.src), e);
                });
            }
            function i(e, t) {
              e.onreadystatechange = function() {
                ("complete" != this.readyState &&
                  "loaded" != this.readyState) ||
                  ((this.onreadystatechange = null), t(null, e));
              };
            }
            t.exports = function(e, t, r) {
              var a = document.head || document.getElementsByTagName("head")[0],
                s = document.createElement("script");
              "function" == typeof t && ((r = t), (t = {})),
                (t = t || {}),
                (r = r || function() {}),
                (s.type = t.type || "text/javascript"),
                (s.charset = t.charset || "utf8"),
                (s.async = !("async" in t && !t.async)),
                (s.src = e),
                t.attrs && n(s, t.attrs),
                t.text && (s.text = "" + t.text),
                ("onload" in s ? o : i)(s, r),
                s.onload || o(s, r),
                a.appendChild(s);
            };
          },
          {}
        ],
        2: [
          function(e, t) {
            "use strict";
            function n(e) {
              for (
                var t = new RegExp(
                    "cdn\\.jsdelivr\\.net/algoliasearch/latest/" +
                      e.replace(".", "\\.") +
                      "(?:\\.min)?\\.js$"
                  ),
                  n = document.getElementsByTagName("script"),
                  o = !1,
                  i = 0,
                  r = n.length;
                i < r;
                i++
              )
                if (n[i].src && t.test(n[i].src)) {
                  o = !0;
                  break;
                }
              return o;
            }
            t.exports = n;
          },
          {}
        ],
        3: [
          function(e, t) {
            "use strict";
            function n(t) {
              var n = e(1),
                i = "//cdn.jsdelivr.net/algoliasearch/2/" + t + ".min.js",
                r =
                  "-- AlgoliaSearch `latest` warning --\nWarning, you are using the `latest` version string from jsDelivr to load the AlgoliaSearch library.\nUsing `latest` is no more recommended, you should load //cdn.jsdelivr.net/algoliasearch/2/algoliasearch.min.js\n\nAlso, we updated the AlgoliaSearch JavaScript client to V3. If you want to upgrade,\nplease read our migration guide at https://github.com/algolia/algoliasearch-client-js/wiki/Migration-guide-from-2.x.x-to-3.x.x\n-- /AlgoliaSearch  `latest` warning --";
              window.console &&
                (window.console.warn
                  ? window.console.warn(r)
                  : window.console.log && window.console.log(r));
              try {
                document.write(
                  "<script>window.ALGOLIA_SUPPORTS_DOCWRITE = true</script>"
                ),
                  !0 === window.ALGOLIA_SUPPORTS_DOCWRITE
                    ? (document.write('<script src="' + i + '"></script>'),
                      o("document.write")())
                    : n(i, o("DOMElement"));
              } catch (a) {
                n(i, o("DOMElement"));
              }
            }
            function o(e) {
              return function() {
                var t = "AlgoliaSearch: loaded V2 script using " + e;
                window.console && window.console.log && window.console.log(t);
              };
            }
            t.exports = n;
          },
          { 1: 1 }
        ],
        4: [
          function(e, t) {
            "use strict";
            function n() {
              var e =
                "-- AlgoliaSearch V2 => V3 error --\nYou are trying to use a new version of the AlgoliaSearch JavaScript client with an old notation.\nPlease read our migration guide at https://github.com/algolia/algoliasearch-client-js/wiki/Migration-guide-from-2.x.x-to-3.x.x\n-- /AlgoliaSearch V2 => V3 error --";
              (window.AlgoliaSearch = function() {
                throw new Error(e);
              }),
                (window.AlgoliaSearchHelper = function() {
                  throw new Error(e);
                }),
                (window.AlgoliaExplainResults = function() {
                  throw new Error(e);
                });
            }
            t.exports = n;
          },
          {}
        ],
        5: [
          function(e) {
            "use strict";
            function t(t) {
              var n = e(2),
                o = e(3),
                i = e(4);
              n(t) ? o(t) : i();
            }
            t("algoliasearch");
          },
          { 2: 2, 3: 3, 4: 4 }
        ]
      },
      {},
      [5]
    )(5);
  }),
  (function(e) {
    if ("object" == typeof exports && "undefined" != typeof module)
      module.exports = e();
    else if ("function" == typeof define && define.amd) define([], e);
    else {
      ("undefined" != typeof window
        ? window
        : "undefined" != typeof global
        ? global
        : "undefined" != typeof self
        ? self
        : this
      ).algoliasearch = e();
    }
  })(function() {
    var e;
    return (function t(e, n, o) {
      function i(a, s) {
        if (!n[a]) {
          if (!e[a]) {
            var c = "function" == typeof require && require;
            if (!s && c) return c(a, !0);
            if (r) return r(a, !0);
            var l = new Error("Cannot find module '" + a + "'");
            throw ((l.code = "MODULE_NOT_FOUND"), l);
          }
          var d = (n[a] = { exports: {} });
          e[a][0].call(
            d.exports,
            function(t) {
              var n = e[a][1][t];
              return i(n || t);
            },
            d,
            d.exports,
            t,
            e,
            n,
            o
          );
        }
        return n[a].exports;
      }
      for (
        var r = "function" == typeof require && require, a = 0;
        a < o.length;
        a++
      )
        i(o[a]);
      return i;
    })(
      {
        1: [
          function(e, t, n) {
            (function(o) {
              function i() {
                return (
                  ("undefined" != typeof document &&
                    "WebkitAppearance" in document.documentElement.style) ||
                  (window.console &&
                    (console.firebug ||
                      (console.exception && console.table))) ||
                  (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) &&
                    parseInt(RegExp.$1, 10) >= 31)
                );
              }
              function r() {
                var e = arguments,
                  t = this.useColors;
                if (
                  ((e[0] =
                    (t ? "%c" : "") +
                    this.namespace +
                    (t ? " %c" : " ") +
                    e[0] +
                    (t ? "%c " : " ") +
                    "+" +
                    n.humanize(this.diff)),
                  !t)
                )
                  return e;
                var o = "color: " + this.color;
                e = [e[0], o, "color: inherit"].concat(
                  Array.prototype.slice.call(e, 1)
                );
                var i = 0,
                  r = 0;
                return (
                  e[0].replace(/%[a-z%]/g, function(e) {
                    "%%" !== e && "%c" === e && (r = ++i);
                  }),
                  e.splice(r, 0, o),
                  e
                );
              }
              function a() {
                return (
                  "object" == typeof console &&
                  console.log &&
                  Function.prototype.apply.call(console.log, console, arguments)
                );
              }
              function s(e) {
                try {
                  null == e
                    ? n.storage.removeItem("debug")
                    : (n.storage.debug = e);
                } catch (t) {}
              }
              function c() {
                try {
                  return n.storage.debug;
                } catch (e) {}
                if (void 0 !== o && "env" in o) return o.env.DEBUG;
              }
              function l() {
                try {
                  return window.localStorage;
                } catch (e) {}
              }
              ((n = t.exports = e(2)).log = a),
                (n.formatArgs = r),
                (n.save = s),
                (n.load = c),
                (n.useColors = i),
                (n.storage =
                  "undefined" != typeof chrome &&
                  "undefined" != typeof chrome.storage
                    ? chrome.storage.local
                    : l()),
                (n.colors = [
                  "lightseagreen",
                  "forestgreen",
                  "goldenrod",
                  "dodgerblue",
                  "darkorchid",
                  "crimson"
                ]),
                (n.formatters.j = function(e) {
                  try {
                    return JSON.stringify(e);
                  } catch (t) {
                    return "[UnexpectedJSONParseError]: " + t.message;
                  }
                }),
                n.enable(c());
            }.call(this, e(12)));
          },
          { 12: 12, 2: 2 }
        ],
        2: [
          function(e, t, n) {
            function o() {
              return n.colors[d++ % n.colors.length];
            }
            function i(e) {
              function t() {}
              function i() {
                var e = i,
                  t = +new Date(),
                  r = t - (l || t);
                (e.diff = r),
                  (e.prev = l),
                  (e.curr = t),
                  (l = t),
                  null == e.useColors && (e.useColors = n.useColors()),
                  null == e.color && e.useColors && (e.color = o());
                for (
                  var a = new Array(arguments.length), s = 0;
                  s < a.length;
                  s++
                )
                  a[s] = arguments[s];
                (a[0] = n.coerce(a[0])),
                  "string" != typeof a[0] && (a = ["%o"].concat(a));
                var c = 0;
                (a[0] = a[0].replace(/%([a-z%])/g, function(t, o) {
                  if ("%%" === t) return t;
                  c++;
                  var i = n.formatters[o];
                  if ("function" == typeof i) {
                    var r = a[c];
                    (t = i.call(e, r)), a.splice(c, 1), c--;
                  }
                  return t;
                })),
                  (a = n.formatArgs.apply(e, a)),
                  (i.log || n.log || console.log.bind(console)).apply(e, a);
              }
              (t.enabled = !1), (i.enabled = !0);
              var r = n.enabled(e) ? i : t;
              return (r.namespace = e), r;
            }
            function r(e) {
              n.save(e);
              for (
                var t = (e || "").split(/[\s,]+/), o = t.length, i = 0;
                i < o;
                i++
              )
                t[i] &&
                  ("-" ===
                  (e = t[i]
                    .replace(/[\\^$+?.()|[\]{}]/g, "\\$&")
                    .replace(/\*/g, ".*?"))[0]
                    ? n.skips.push(new RegExp("^" + e.substr(1) + "$"))
                    : n.names.push(new RegExp("^" + e + "$")));
            }
            function a() {
              n.enable("");
            }
            function s(e) {
              var t, o;
              for (t = 0, o = n.skips.length; t < o; t++)
                if (n.skips[t].test(e)) return !1;
              for (t = 0, o = n.names.length; t < o; t++)
                if (n.names[t].test(e)) return !0;
              return !1;
            }
            function c(e) {
              return e instanceof Error ? e.stack || e.message : e;
            }
            ((n = t.exports = i.debug = i).coerce = c),
              (n.disable = a),
              (n.enable = r),
              (n.enabled = s),
              (n.humanize = e(9)),
              (n.names = []),
              (n.skips = []),
              (n.formatters = {});
            var l,
              d = 0;
          },
          { 9: 9 }
        ],
        3: [
          function(t, n, o) {
            (function(i, r) {
              !(function(t, i) {
                "object" == typeof o && void 0 !== n
                  ? (n.exports = i())
                  : "function" == typeof e && e.amd
                  ? e(i)
                  : (t.ES6Promise = i());
              })(this, function() {
                "use strict";
                function e(e) {
                  return (
                    "function" == typeof e ||
                    ("object" == typeof e && null !== e)
                  );
                }
                function n(e) {
                  return "function" == typeof e;
                }
                function o(e) {
                  Y = e;
                }
                function a(e) {
                  G = e;
                }
                function s() {
                  return function() {
                    return i.nextTick(m);
                  };
                }
                function c() {
                  return void 0 !== W
                    ? function() {
                        W(m);
                      }
                    : u();
                }
                function l() {
                  var e = 0,
                    t = new Q(m),
                    n = document.createTextNode("");
                  return (
                    t.observe(n, { characterData: !0 }),
                    function() {
                      n.data = e = ++e % 2;
                    }
                  );
                }
                function d() {
                  var e = new MessageChannel();
                  return (
                    (e.port1.onmessage = m),
                    function() {
                      return e.port2.postMessage(0);
                    }
                  );
                }
                function u() {
                  var e = setTimeout;
                  return function() {
                    return e(m, 1);
                  };
                }
                function m() {
                  for (var e = 0; e < V; e += 2) {
                    (0, te[e])(te[e + 1]),
                      (te[e] = void 0),
                      (te[e + 1] = void 0);
                  }
                  V = 0;
                }
                function f() {
                  try {
                    var e = t("vertx");
                    return (W = e.runOnLoop || e.runOnContext), c();
                  } catch (o) {
                    return u();
                  }
                }
                function p(e, t) {
                  var n = arguments,
                    o = this,
                    i = new this.constructor(g);
                  void 0 === i[oe] && M(i);
                  var r = o._state;
                  return (
                    r
                      ? (function() {
                          var e = n[r - 1];
                          G(function() {
                            return N(r, i, e, o._result);
                          });
                        })()
                      : L(o, i, e, t),
                    i
                  );
                }
                function h(e) {
                  var t = this;
                  if (e && "object" == typeof e && e.constructor === t)
                    return e;
                  var n = new t(g);
                  return k(n, e), n;
                }
                function g() {}
                function y() {
                  return new TypeError(
                    "You cannot resolve a promise with itself"
                  );
                }
                function v() {
                  return new TypeError(
                    "A promises callback cannot return that same promise."
                  );
                }
                function b(e) {
                  try {
                    return e.then;
                  } catch (t) {
                    return (se.error = t), se;
                  }
                }
                function w(e, t, n, o) {
                  try {
                    e.call(t, n, o);
                  } catch (i) {
                    return i;
                  }
                }
                function _(e, t, n) {
                  G(function(e) {
                    var o = !1,
                      i = w(
                        n,
                        t,
                        function(n) {
                          o || ((o = !0), t !== n ? k(e, n) : x(e, n));
                        },
                        function(t) {
                          o || ((o = !0), S(e, t));
                        },
                        "Settle: " + (e._label || " unknown promise")
                      );
                    !o && i && ((o = !0), S(e, i));
                  }, e);
                }
                function E(e, t) {
                  t._state === re
                    ? x(e, t._result)
                    : t._state === ae
                    ? S(e, t._result)
                    : L(
                        t,
                        void 0,
                        function(t) {
                          return k(e, t);
                        },
                        function(t) {
                          return S(e, t);
                        }
                      );
                }
                function T(e, t, o) {
                  t.constructor === e.constructor &&
                  o === p &&
                  t.constructor.resolve === h
                    ? E(e, t)
                    : o === se
                    ? S(e, se.error)
                    : void 0 === o
                    ? x(e, t)
                    : n(o)
                    ? _(e, t, o)
                    : x(e, t);
                }
                function k(t, n) {
                  t === n ? S(t, y()) : e(n) ? T(t, n, b(n)) : x(t, n);
                }
                function I(e) {
                  e._onerror && e._onerror(e._result), B(e);
                }
                function x(e, t) {
                  e._state === ie &&
                    ((e._result = t),
                    (e._state = re),
                    0 !== e._subscribers.length && G(B, e));
                }
                function S(e, t) {
                  e._state === ie &&
                    ((e._state = ae), (e._result = t), G(I, e));
                }
                function L(e, t, n, o) {
                  var i = e._subscribers,
                    r = i.length;
                  (e._onerror = null),
                    (i[r] = t),
                    (i[r + re] = n),
                    (i[r + ae] = o),
                    0 === r && e._state && G(B, e);
                }
                function B(e) {
                  var t = e._subscribers,
                    n = e._state;
                  if (0 !== t.length) {
                    for (
                      var o = void 0, i = void 0, r = e._result, a = 0;
                      a < t.length;
                      a += 3
                    )
                      (o = t[a]), (i = t[a + n]), o ? N(n, o, i, r) : i(r);
                    e._subscribers.length = 0;
                  }
                }
                function C() {
                  this.error = null;
                }
                function A(e, t) {
                  try {
                    return e(t);
                  } catch (n) {
                    return (ce.error = n), ce;
                  }
                }
                function N(e, t, o, i) {
                  var r = n(o),
                    a = void 0,
                    s = void 0,
                    c = void 0,
                    l = void 0;
                  if (r) {
                    if (
                      ((a = A(o, i)) === ce
                        ? ((l = !0), (s = a.error), (a = null))
                        : (c = !0),
                      t === a)
                    )
                      return void S(t, v());
                  } else (a = i), (c = !0);
                  t._state !== ie ||
                    (r && c
                      ? k(t, a)
                      : l
                      ? S(t, s)
                      : e === re
                      ? x(t, a)
                      : e === ae && S(t, a));
                }
                function R(e, t) {
                  try {
                    t(
                      function(t) {
                        k(e, t);
                      },
                      function(t) {
                        S(e, t);
                      }
                    );
                  } catch (n) {
                    S(e, n);
                  }
                }
                function O() {
                  return le++;
                }
                function M(e) {
                  (e[oe] = le++),
                    (e._state = void 0),
                    (e._result = void 0),
                    (e._subscribers = []);
                }
                function j(e, t) {
                  (this._instanceConstructor = e),
                    (this.promise = new e(g)),
                    this.promise[oe] || M(this.promise),
                    J(t)
                      ? ((this._input = t),
                        (this.length = t.length),
                        (this._remaining = t.length),
                        (this._result = new Array(this.length)),
                        0 === this.length
                          ? x(this.promise, this._result)
                          : ((this.length = this.length || 0),
                            this._enumerate(),
                            0 === this._remaining &&
                              x(this.promise, this._result)))
                      : S(this.promise, P());
                }
                function P() {
                  return new Error("Array Methods must be provided an Array");
                }
                function D(e) {
                  return new j(this, e).promise;
                }
                function H(e) {
                  var t = this;
                  return new t(
                    J(e)
                      ? function(n, o) {
                          for (var i = e.length, r = 0; r < i; r++)
                            t.resolve(e[r]).then(n, o);
                        }
                      : function(e, t) {
                          return t(
                            new TypeError("You must pass an array to race.")
                          );
                        }
                  );
                }
                function q(e) {
                  var t = new this(g);
                  return S(t, e), t;
                }
                function U() {
                  throw new TypeError(
                    "You must pass a resolver function as the first argument to the promise constructor"
                  );
                }
                function F() {
                  throw new TypeError(
                    "Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function."
                  );
                }
                function z(e) {
                  (this[oe] = O()),
                    (this._result = this._state = void 0),
                    (this._subscribers = []),
                    g !== e &&
                      ("function" != typeof e && U(),
                      this instanceof z ? R(this, e) : F());
                }
                function X() {
                  var e = void 0;
                  if (void 0 !== r) e = r;
                  else if ("undefined" != typeof self) e = self;
                  else
                    try {
                      e = Function("return this")();
                    } catch (t) {
                      throw new Error(
                        "polyfill failed because global object is unavailable in this environment"
                      );
                    }
                  var n = e.Promise;
                  if (n) {
                    var o = null;
                    try {
                      o = Object.prototype.toString.call(n.resolve());
                    } catch (t) {}
                    if ("[object Promise]" === o && !n.cast) return;
                  }
                  e.Promise = z;
                }
                var J = Array.isArray
                    ? Array.isArray
                    : function(e) {
                        return (
                          "[object Array]" === Object.prototype.toString.call(e)
                        );
                      },
                  V = 0,
                  W = void 0,
                  Y = void 0,
                  G = function(e, t) {
                    (te[V] = e),
                      (te[V + 1] = t),
                      2 === (V += 2) && (Y ? Y(m) : ne());
                  },
                  K = "undefined" != typeof window ? window : void 0,
                  $ = K || {},
                  Q = $.MutationObserver || $.WebKitMutationObserver,
                  Z =
                    "undefined" == typeof self &&
                    void 0 !== i &&
                    "[object process]" === {}.toString.call(i),
                  ee =
                    "undefined" != typeof Uint8ClampedArray &&
                    "undefined" != typeof importScripts &&
                    "undefined" != typeof MessageChannel,
                  te = new Array(1e3),
                  ne = void 0;
                ne = Z
                  ? s()
                  : Q
                  ? l()
                  : ee
                  ? d()
                  : void 0 === K && "function" == typeof t
                  ? f()
                  : u();
                var oe = Math.random()
                    .toString(36)
                    .substring(16),
                  ie = void 0,
                  re = 1,
                  ae = 2,
                  se = new C(),
                  ce = new C(),
                  le = 0;
                return (
                  (j.prototype._enumerate = function() {
                    for (
                      var e = this.length, t = this._input, n = 0;
                      this._state === ie && n < e;
                      n++
                    )
                      this._eachEntry(t[n], n);
                  }),
                  (j.prototype._eachEntry = function(e, t) {
                    var n = this._instanceConstructor,
                      o = n.resolve;
                    if (o === h) {
                      var i = b(e);
                      if (i === p && e._state !== ie)
                        this._settledAt(e._state, t, e._result);
                      else if ("function" != typeof i)
                        this._remaining--, (this._result[t] = e);
                      else if (n === z) {
                        var r = new n(g);
                        T(r, e, i), this._willSettleAt(r, t);
                      } else
                        this._willSettleAt(
                          new n(function(t) {
                            return t(e);
                          }),
                          t
                        );
                    } else this._willSettleAt(o(e), t);
                  }),
                  (j.prototype._settledAt = function(e, t, n) {
                    var o = this.promise;
                    o._state === ie &&
                      (this._remaining--,
                      e === ae ? S(o, n) : (this._result[t] = n)),
                      0 === this._remaining && x(o, this._result);
                  }),
                  (j.prototype._willSettleAt = function(e, t) {
                    var n = this;
                    L(
                      e,
                      void 0,
                      function(e) {
                        return n._settledAt(re, t, e);
                      },
                      function(e) {
                        return n._settledAt(ae, t, e);
                      }
                    );
                  }),
                  (z.all = D),
                  (z.race = H),
                  (z.resolve = h),
                  (z.reject = q),
                  (z._setScheduler = o),
                  (z._setAsap = a),
                  (z._asap = G),
                  (z.prototype = {
                    constructor: z,
                    then: p,
                    catch: function(e) {
                      return this.then(null, e);
                    }
                  }),
                  (z.polyfill = X),
                  (z.Promise = z),
                  z
                );
              });
            }.call(
              this,
              t(12),
              "undefined" != typeof global
                ? global
                : "undefined" != typeof self
                ? self
                : "undefined" != typeof window
                ? window
                : {}
            ));
          },
          { 12: 12 }
        ],
        4: [
          function(e, t) {
            function n() {
              (this._events = this._events || {}),
                (this._maxListeners = this._maxListeners || void 0);
            }
            function o(e) {
              return "function" == typeof e;
            }
            function i(e) {
              return "number" == typeof e;
            }
            function r(e) {
              return "object" == typeof e && null !== e;
            }
            function a(e) {
              return void 0 === e;
            }
            (t.exports = n),
              (n.EventEmitter = n),
              (n.prototype._events = void 0),
              (n.prototype._maxListeners = void 0),
              (n.defaultMaxListeners = 10),
              (n.prototype.setMaxListeners = function(e) {
                if (!i(e) || e < 0 || isNaN(e))
                  throw TypeError("n must be a positive number");
                return (this._maxListeners = e), this;
              }),
              (n.prototype.emit = function(e) {
                var t, n, i, s, c, l;
                if (
                  (this._events || (this._events = {}),
                  "error" === e &&
                    (!this._events.error ||
                      (r(this._events.error) && !this._events.error.length)))
                ) {
                  if ((t = arguments[1]) instanceof Error) throw t;
                  var d = new Error(
                    'Uncaught, unspecified "error" event. (' + t + ")"
                  );
                  throw ((d.context = t), d);
                }
                if (a((n = this._events[e]))) return !1;
                if (o(n))
                  switch (arguments.length) {
                    case 1:
                      n.call(this);
                      break;
                    case 2:
                      n.call(this, arguments[1]);
                      break;
                    case 3:
                      n.call(this, arguments[1], arguments[2]);
                      break;
                    default:
                      (s = Array.prototype.slice.call(arguments, 1)),
                        n.apply(this, s);
                  }
                else if (r(n))
                  for (
                    s = Array.prototype.slice.call(arguments, 1),
                      i = (l = n.slice()).length,
                      c = 0;
                    c < i;
                    c++
                  )
                    l[c].apply(this, s);
                return !0;
              }),
              (n.prototype.addListener = function(e, t) {
                var i;
                if (!o(t)) throw TypeError("listener must be a function");
                return (
                  this._events || (this._events = {}),
                  this._events.newListener &&
                    this.emit("newListener", e, o(t.listener) ? t.listener : t),
                  this._events[e]
                    ? r(this._events[e])
                      ? this._events[e].push(t)
                      : (this._events[e] = [this._events[e], t])
                    : (this._events[e] = t),
                  r(this._events[e]) &&
                    !this._events[e].warned &&
                    (i = a(this._maxListeners)
                      ? n.defaultMaxListeners
                      : this._maxListeners) &&
                      i > 0 &&
                      this._events[e].length > i &&
                      ((this._events[e].warned = !0),
                      console.error(
                        "(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",
                        this._events[e].length
                      ),
                      "function" == typeof console.trace && console.trace()),
                  this
                );
              }),
              (n.prototype.on = n.prototype.addListener),
              (n.prototype.once = function(e, t) {
                function n() {
                  this.removeListener(e, n),
                    i || ((i = !0), t.apply(this, arguments));
                }
                if (!o(t)) throw TypeError("listener must be a function");
                var i = !1;
                return (n.listener = t), this.on(e, n), this;
              }),
              (n.prototype.removeListener = function(e, t) {
                var n, i, a, s;
                if (!o(t)) throw TypeError("listener must be a function");
                if (!this._events || !this._events[e]) return this;
                if (
                  ((a = (n = this._events[e]).length),
                  (i = -1),
                  n === t || (o(n.listener) && n.listener === t))
                )
                  delete this._events[e],
                    this._events.removeListener &&
                      this.emit("removeListener", e, t);
                else if (r(n)) {
                  for (s = a; s-- > 0; )
                    if (n[s] === t || (n[s].listener && n[s].listener === t)) {
                      i = s;
                      break;
                    }
                  if (i < 0) return this;
                  1 === n.length
                    ? ((n.length = 0), delete this._events[e])
                    : n.splice(i, 1),
                    this._events.removeListener &&
                      this.emit("removeListener", e, t);
                }
                return this;
              }),
              (n.prototype.removeAllListeners = function(e) {
                var t, n;
                if (!this._events) return this;
                if (!this._events.removeListener)
                  return (
                    0 === arguments.length
                      ? (this._events = {})
                      : this._events[e] && delete this._events[e],
                    this
                  );
                if (0 === arguments.length) {
                  for (t in this._events)
                    "removeListener" !== t && this.removeAllListeners(t);
                  return (
                    this.removeAllListeners("removeListener"),
                    (this._events = {}),
                    this
                  );
                }
                if (o((n = this._events[e]))) this.removeListener(e, n);
                else if (n)
                  for (; n.length; ) this.removeListener(e, n[n.length - 1]);
                return delete this._events[e], this;
              }),
              (n.prototype.listeners = function(e) {
                return this._events && this._events[e]
                  ? o(this._events[e])
                    ? [this._events[e]]
                    : this._events[e].slice()
                  : [];
              }),
              (n.prototype.listenerCount = function(e) {
                if (this._events) {
                  var t = this._events[e];
                  if (o(t)) return 1;
                  if (t) return t.length;
                }
                return 0;
              }),
              (n.listenerCount = function(e, t) {
                return e.listenerCount(t);
              });
          },
          {}
        ],
        5: [
          function(e, t) {
            var n = Object.prototype.hasOwnProperty,
              o = Object.prototype.toString;
            t.exports = function(e, t, i) {
              if ("[object Function]" !== o.call(t))
                throw new TypeError("iterator must be a function");
              var r = e.length;
              if (r === +r) for (var a = 0; a < r; a++) t.call(i, e[a], a, e);
              else for (var s in e) n.call(e, s) && t.call(i, e[s], s, e);
            };
          },
          {}
        ],
        6: [
          function(e, t) {
            (function(e) {
              "undefined" != typeof window
                ? (t.exports = window)
                : void 0 !== e
                ? (t.exports = e)
                : "undefined" != typeof self
                ? (t.exports = self)
                : (t.exports = {});
            }.call(
              this,
              "undefined" != typeof global
                ? global
                : "undefined" != typeof self
                ? self
                : "undefined" != typeof window
                ? window
                : {}
            ));
          },
          {}
        ],
        7: [
          function(e, t) {
            "function" == typeof Object.create
              ? (t.exports = function(e, t) {
                  (e.super_ = t),
                    (e.prototype = Object.create(t.prototype, {
                      constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                      }
                    }));
                })
              : (t.exports = function(e, t) {
                  e.super_ = t;
                  var n = function() {};
                  (n.prototype = t.prototype),
                    (e.prototype = new n()),
                    (e.prototype.constructor = e);
                });
          },
          {}
        ],
        8: [
          function(e, t) {
            var n = {}.toString;
            t.exports =
              Array.isArray ||
              function(e) {
                return "[object Array]" == n.call(e);
              };
          },
          {}
        ],
        9: [
          function(e, t) {
            function n(e) {
              if (!((e = String(e)).length > 1e4)) {
                var t = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
                  e
                );
                if (t) {
                  var n = parseFloat(t[1]);
                  switch ((t[2] || "ms").toLowerCase()) {
                    case "years":
                    case "year":
                    case "yrs":
                    case "yr":
                    case "y":
                      return n * d;
                    case "days":
                    case "day":
                    case "d":
                      return n * l;
                    case "hours":
                    case "hour":
                    case "hrs":
                    case "hr":
                    case "h":
                      return n * c;
                    case "minutes":
                    case "minute":
                    case "mins":
                    case "min":
                    case "m":
                      return n * s;
                    case "seconds":
                    case "second":
                    case "secs":
                    case "sec":
                    case "s":
                      return n * a;
                    case "milliseconds":
                    case "millisecond":
                    case "msecs":
                    case "msec":
                    case "ms":
                      return n;
                    default:
                      return;
                  }
                }
              }
            }
            function o(e) {
              return e >= l
                ? Math.round(e / l) + "d"
                : e >= c
                ? Math.round(e / c) + "h"
                : e >= s
                ? Math.round(e / s) + "m"
                : e >= a
                ? Math.round(e / a) + "s"
                : e + "ms";
            }
            function i(e) {
              return (
                r(e, l, "day") ||
                r(e, c, "hour") ||
                r(e, s, "minute") ||
                r(e, a, "second") ||
                e + " ms"
              );
            }
            function r(e, t, n) {
              if (!(e < t))
                return e < 1.5 * t
                  ? Math.floor(e / t) + " " + n
                  : Math.ceil(e / t) + " " + n + "s";
            }
            var a = 1e3,
              s = 60 * a,
              c = 60 * s,
              l = 24 * c,
              d = 365.25 * l;
            t.exports = function(e, t) {
              t = t || {};
              var r = typeof e;
              if ("string" === r && e.length > 0) return n(e);
              if ("number" === r && !1 === isNaN(e))
                return t.long ? i(e) : o(e);
              throw new Error(
                "val is not a non-empty string or a valid number. val=" +
                  JSON.stringify(e)
              );
            };
          },
          {}
        ],
        10: [
          function(e, t) {
            "use strict";
            var n = Object.prototype.hasOwnProperty,
              o = Object.prototype.toString,
              i = Array.prototype.slice,
              r = e(11),
              a = Object.prototype.propertyIsEnumerable,
              s = !a.call({ toString: null }, "toString"),
              c = a.call(function() {}, "prototype"),
              l = [
                "toString",
                "toLocaleString",
                "valueOf",
                "hasOwnProperty",
                "isPrototypeOf",
                "propertyIsEnumerable",
                "constructor"
              ],
              d = function(e) {
                var t = e.constructor;
                return t && t.prototype === e;
              },
              u = {
                $console: !0,
                $external: !0,
                $frame: !0,
                $frameElement: !0,
                $frames: !0,
                $innerHeight: !0,
                $innerWidth: !0,
                $outerHeight: !0,
                $outerWidth: !0,
                $pageXOffset: !0,
                $pageYOffset: !0,
                $parent: !0,
                $scrollLeft: !0,
                $scrollTop: !0,
                $scrollX: !0,
                $scrollY: !0,
                $self: !0,
                $webkitIndexedDB: !0,
                $webkitStorageInfo: !0,
                $window: !0
              },
              m = (function() {
                if ("undefined" == typeof window) return !1;
                for (var e in window)
                  try {
                    if (
                      !u["$" + e] &&
                      n.call(window, e) &&
                      null !== window[e] &&
                      "object" == typeof window[e]
                    )
                      try {
                        d(window[e]);
                      } catch (t) {
                        return !0;
                      }
                  } catch (t) {
                    return !0;
                  }
                return !1;
              })(),
              f = function(e) {
                if ("undefined" == typeof window || !m) return d(e);
                try {
                  return d(e);
                } catch (t) {
                  return !1;
                }
              },
              p = function(e) {
                var t = null !== e && "object" == typeof e,
                  i = "[object Function]" === o.call(e),
                  a = r(e),
                  d = t && "[object String]" === o.call(e),
                  u = [];
                if (!t && !i && !a)
                  throw new TypeError("Object.keys called on a non-object");
                var m = c && i;
                if (d && e.length > 0 && !n.call(e, 0))
                  for (var p = 0; p < e.length; ++p) u.push(String(p));
                if (a && e.length > 0)
                  for (var h = 0; h < e.length; ++h) u.push(String(h));
                else
                  for (var g in e)
                    (m && "prototype" === g) ||
                      !n.call(e, g) ||
                      u.push(String(g));
                if (s)
                  for (var y = f(e), v = 0; v < l.length; ++v)
                    (y && "constructor" === l[v]) ||
                      !n.call(e, l[v]) ||
                      u.push(l[v]);
                return u;
              };
            (p.shim = function() {
              if (Object.keys) {
                if (
                  !(function() {
                    return 2 === (Object.keys(arguments) || "").length;
                  })(1, 2)
                ) {
                  var e = Object.keys;
                  Object.keys = function(t) {
                    return e(r(t) ? i.call(t) : t);
                  };
                }
              } else Object.keys = p;
              return Object.keys || p;
            }),
              (t.exports = p);
          },
          { 11: 11 }
        ],
        11: [
          function(e, t) {
            "use strict";
            var n = Object.prototype.toString;
            t.exports = function(e) {
              var t = n.call(e),
                o = "[object Arguments]" === t;
              return (
                o ||
                  (o =
                    "[object Array]" !== t &&
                    null !== e &&
                    "object" == typeof e &&
                    "number" == typeof e.length &&
                    e.length >= 0 &&
                    "[object Function]" === n.call(e.callee)),
                o
              );
            };
          },
          {}
        ],
        12: [
          function(e, t) {
            function n() {
              throw new Error("setTimeout has not been defined");
            }
            function o() {
              throw new Error("clearTimeout has not been defined");
            }
            function i(e) {
              if (d === setTimeout) return setTimeout(e, 0);
              if ((d === n || !d) && setTimeout)
                return (d = setTimeout), setTimeout(e, 0);
              try {
                return d(e, 0);
              } catch (t) {
                try {
                  return d.call(null, e, 0);
                } catch (t) {
                  return d.call(this, e, 0);
                }
              }
            }
            function r(e) {
              if (u === clearTimeout) return clearTimeout(e);
              if ((u === o || !u) && clearTimeout)
                return (u = clearTimeout), clearTimeout(e);
              try {
                return u(e);
              } catch (t) {
                try {
                  return u.call(null, e);
                } catch (t) {
                  return u.call(this, e);
                }
              }
            }
            function a() {
              h &&
                f &&
                ((h = !1),
                f.length ? (p = f.concat(p)) : (g = -1),
                p.length && s());
            }
            function s() {
              if (!h) {
                var e = i(a);
                h = !0;
                for (var t = p.length; t; ) {
                  for (f = p, p = []; ++g < t; ) f && f[g].run();
                  (g = -1), (t = p.length);
                }
                (f = null), (h = !1), r(e);
              }
            }
            function c(e, t) {
              (this.fun = e), (this.array = t);
            }
            function l() {}
            var d,
              u,
              m = (t.exports = {});
            !(function() {
              try {
                d = "function" == typeof setTimeout ? setTimeout : n;
              } catch (e) {
                d = n;
              }
              try {
                u = "function" == typeof clearTimeout ? clearTimeout : o;
              } catch (e) {
                u = o;
              }
            })();
            var f,
              p = [],
              h = !1,
              g = -1;
            (m.nextTick = function(e) {
              var t = new Array(arguments.length - 1);
              if (arguments.length > 1)
                for (var n = 1; n < arguments.length; n++)
                  t[n - 1] = arguments[n];
              p.push(new c(e, t)), 1 !== p.length || h || i(s);
            }),
              (c.prototype.run = function() {
                this.fun.apply(null, this.array);
              }),
              (m.title = "browser"),
              (m.browser = !0),
              (m.env = {}),
              (m.argv = []),
              (m.version = ""),
              (m.versions = {}),
              (m.on = l),
              (m.addListener = l),
              (m.once = l),
              (m.off = l),
              (m.removeListener = l),
              (m.removeAllListeners = l),
              (m.emit = l),
              (m.binding = function() {
                throw new Error("process.binding is not supported");
              }),
              (m.cwd = function() {
                return "/";
              }),
              (m.chdir = function() {
                throw new Error("process.chdir is not supported");
              }),
              (m.umask = function() {
                return 0;
              });
          },
          {}
        ],
        13: [
          function(e, t) {
            "use strict";
            function n(e, t) {
              if (e.map) return e.map(t);
              for (var n = [], o = 0; o < e.length; o++) n.push(t(e[o], o));
              return n;
            }
            var o = function(e) {
              switch (typeof e) {
                case "string":
                  return e;
                case "boolean":
                  return e ? "true" : "false";
                case "number":
                  return isFinite(e) ? e : "";
                default:
                  return "";
              }
            };
            t.exports = function(e, t, a, s) {
              return (
                (t = t || "&"),
                (a = a || "="),
                null === e && (e = void 0),
                "object" == typeof e
                  ? n(r(e), function(r) {
                      var s = encodeURIComponent(o(r)) + a;
                      return i(e[r])
                        ? n(e[r], function(e) {
                            return s + encodeURIComponent(o(e));
                          }).join(t)
                        : s + encodeURIComponent(o(e[r]));
                    }).join(t)
                  : s
                  ? encodeURIComponent(o(s)) + a + encodeURIComponent(o(e))
                  : ""
              );
            };
            var i =
                Array.isArray ||
                function(e) {
                  return "[object Array]" === Object.prototype.toString.call(e);
                },
              r =
                Object.keys ||
                function(e) {
                  var t = [];
                  for (var n in e)
                    Object.prototype.hasOwnProperty.call(e, n) && t.push(n);
                  return t;
                };
          },
          {}
        ],
        14: [
          function(e, t) {
            function n() {
              s.apply(this, arguments);
            }
            function o() {
              var e =
                "Not implemented in this environment.\nIf you feel this is a mistake, write to support@algolia.com";
              throw new l.AlgoliaSearchError(e);
            }
            t.exports = n;
            var i = e(16),
              r = e(26),
              a = e(27),
              s = e(15),
              c = e(7),
              l = e(28);
            c(n, s),
              (n.prototype.deleteIndex = function(e, t) {
                return this._jsonRequest({
                  method: "DELETE",
                  url: "/1/indexes/" + encodeURIComponent(e),
                  hostType: "write",
                  callback: t
                });
              }),
              (n.prototype.moveIndex = function(e, t, n) {
                var o = { operation: "move", destination: t };
                return this._jsonRequest({
                  method: "POST",
                  url: "/1/indexes/" + encodeURIComponent(e) + "/operation",
                  body: o,
                  hostType: "write",
                  callback: n
                });
              }),
              (n.prototype.copyIndex = function(e, t, n) {
                var o = { operation: "copy", destination: t };
                return this._jsonRequest({
                  method: "POST",
                  url: "/1/indexes/" + encodeURIComponent(e) + "/operation",
                  body: o,
                  hostType: "write",
                  callback: n
                });
              }),
              (n.prototype.getLogs = function(t, n, o) {
                var i = e(25),
                  r = {};
                return (
                  "object" == typeof t
                    ? ((r = i(t)), (o = n))
                    : 0 === arguments.length || "function" == typeof t
                    ? (o = t)
                    : 1 === arguments.length || "function" == typeof n
                    ? ((o = n), (r.offset = t))
                    : ((r.offset = t), (r.length = n)),
                  void 0 === r.offset && (r.offset = 0),
                  void 0 === r.length && (r.length = 10),
                  this._jsonRequest({
                    method: "GET",
                    url: "/1/logs?" + this._getSearchParams(r, ""),
                    hostType: "read",
                    callback: o
                  })
                );
              }),
              (n.prototype.listIndexes = function(e, t) {
                var n = "";
                return (
                  void 0 === e || "function" == typeof e
                    ? (t = e)
                    : (n = "?page=" + e),
                  this._jsonRequest({
                    method: "GET",
                    url: "/1/indexes" + n,
                    hostType: "read",
                    callback: t
                  })
                );
              }),
              (n.prototype.initIndex = function(e) {
                return new i(this, e);
              }),
              (n.prototype.listUserKeys = function(e) {
                return this._jsonRequest({
                  method: "GET",
                  url: "/1/keys",
                  hostType: "read",
                  callback: e
                });
              }),
              (n.prototype.getUserKeyACL = function(e, t) {
                return this._jsonRequest({
                  method: "GET",
                  url: "/1/keys/" + e,
                  hostType: "read",
                  callback: t
                });
              }),
              (n.prototype.deleteUserKey = function(e, t) {
                return this._jsonRequest({
                  method: "DELETE",
                  url: "/1/keys/" + e,
                  hostType: "write",
                  callback: t
                });
              }),
              (n.prototype.addUserKey = function(t, n, o) {
                var i =
                  "Usage: client.addUserKey(arrayOfAcls[, params, callback])";
                if (!e(8)(t)) throw new Error(i);
                (1 !== arguments.length && "function" != typeof n) ||
                  ((o = n), (n = null));
                var r = { acl: t };
                return (
                  n &&
                    ((r.validity = n.validity),
                    (r.maxQueriesPerIPPerHour = n.maxQueriesPerIPPerHour),
                    (r.maxHitsPerQuery = n.maxHitsPerQuery),
                    (r.indexes = n.indexes),
                    (r.description = n.description),
                    n.queryParameters &&
                      (r.queryParameters = this._getSearchParams(
                        n.queryParameters,
                        ""
                      )),
                    (r.referers = n.referers)),
                  this._jsonRequest({
                    method: "POST",
                    url: "/1/keys",
                    body: r,
                    hostType: "write",
                    callback: o
                  })
                );
              }),
              (n.prototype.addUserKeyWithValidity = r(function(e, t, n) {
                return this.addUserKey(e, t, n);
              }, a("client.addUserKeyWithValidity()", "client.addUserKey()"))),
              (n.prototype.updateUserKey = function(t, n, o, i) {
                var r =
                  "Usage: client.updateUserKey(key, arrayOfAcls[, params, callback])";
                if (!e(8)(n)) throw new Error(r);
                (2 !== arguments.length && "function" != typeof o) ||
                  ((i = o), (o = null));
                var a = { acl: n };
                return (
                  o &&
                    ((a.validity = o.validity),
                    (a.maxQueriesPerIPPerHour = o.maxQueriesPerIPPerHour),
                    (a.maxHitsPerQuery = o.maxHitsPerQuery),
                    (a.indexes = o.indexes),
                    (a.description = o.description),
                    o.queryParameters &&
                      (a.queryParameters = this._getSearchParams(
                        o.queryParameters,
                        ""
                      )),
                    (a.referers = o.referers)),
                  this._jsonRequest({
                    method: "PUT",
                    url: "/1/keys/" + t,
                    body: a,
                    hostType: "write",
                    callback: i
                  })
                );
              }),
              (n.prototype.startQueriesBatch = r(function() {
                this._batch = [];
              }, a("client.startQueriesBatch()", "client.search()"))),
              (n.prototype.addQueryInBatch = r(function(e, t, n) {
                this._batch.push({ indexName: e, query: t, params: n });
              }, a("client.addQueryInBatch()", "client.search()"))),
              (n.prototype.sendQueriesBatch = r(function(e) {
                return this.search(this._batch, e);
              }, a("client.sendQueriesBatch()", "client.search()"))),
              (n.prototype.batch = function(t, n) {
                var o = "Usage: client.batch(operations[, callback])";
                if (!e(8)(t)) throw new Error(o);
                return this._jsonRequest({
                  method: "POST",
                  url: "/1/indexes/*/batch",
                  body: { requests: t },
                  hostType: "write",
                  callback: n
                });
              }),
              (n.prototype.destroy = o),
              (n.prototype.enableRateLimitForward = o),
              (n.prototype.disableRateLimitForward = o),
              (n.prototype.useSecuredAPIKey = o),
              (n.prototype.disableSecuredAPIKey = o),
              (n.prototype.generateSecuredApiKey = o);
          },
          { 15: 15, 16: 16, 25: 25, 26: 26, 27: 27, 28: 28, 7: 7, 8: 8 }
        ],
        15: [
          function(e, t) {
            (function(n) {
              function o(t, n, o) {
                var r = e(1)("algoliasearch"),
                  a = e(25),
                  s = e(8),
                  l = e(30),
                  d = "Usage: algoliasearch(applicationID, apiKey, opts)";
                if (!0 !== o._allowEmptyCredentials && !t)
                  throw new c.AlgoliaSearchError(
                    "Please provide an application ID. " + d
                  );
                if (!0 !== o._allowEmptyCredentials && !n)
                  throw new c.AlgoliaSearchError(
                    "Please provide an API key. " + d
                  );
                (this.applicationID = t),
                  (this.apiKey = n),
                  (this.hosts = { read: [], write: [] });
                var u = (o = o || {}).protocol || "https:";
                if (
                  ((this._timeouts = o.timeouts || {
                    connect: 1e3,
                    read: 2e3,
                    write: 3e4
                  }),
                  o.timeout &&
                    (this._timeouts.connect = this._timeouts.read = this._timeouts.write =
                      o.timeout),
                  /:$/.test(u) || (u += ":"),
                  "http:" !== o.protocol && "https:" !== o.protocol)
                )
                  throw new c.AlgoliaSearchError(
                    "protocol must be `http:` or `https:` (was `" +
                      o.protocol +
                      "`)"
                  );
                if ((this._checkAppIdData(), o.hosts))
                  s(o.hosts)
                    ? ((this.hosts.read = a(o.hosts)),
                      (this.hosts.write = a(o.hosts)))
                    : ((this.hosts.read = a(o.hosts.read)),
                      (this.hosts.write = a(o.hosts.write)));
                else {
                  var m = l(this._shuffleResult, function(e) {
                    return t + "-" + e + ".algolianet.com";
                  });
                  (this.hosts.read = [
                    this.applicationID + "-dsn.algolia.net"
                  ].concat(m)),
                    (this.hosts.write = [
                      this.applicationID + ".algolia.net"
                    ].concat(m));
                }
                (this.hosts.read = l(this.hosts.read, i(u))),
                  (this.hosts.write = l(this.hosts.write, i(u))),
                  (this.extraHeaders = []),
                  (this.cache = o._cache || {}),
                  (this._ua = o._ua),
                  (this._useCache =
                    !(void 0 !== o._useCache && !o._cache) || o._useCache),
                  (this._useFallback =
                    void 0 === o.useFallback || o.useFallback),
                  (this._setTimeout = o._setTimeout),
                  r("init done, %j", this);
              }
              function i(e) {
                return function(t) {
                  return e + "//" + t.toLowerCase();
                };
              }
              function r(e) {
                if (void 0 === Array.prototype.toJSON) return JSON.stringify(e);
                var t = Array.prototype.toJSON;
                delete Array.prototype.toJSON;
                var n = JSON.stringify(e);
                return (Array.prototype.toJSON = t), n;
              }
              function a(e) {
                for (var t, n, o = e.length; 0 !== o; )
                  (n = Math.floor(Math.random() * o)),
                    (t = e[(o -= 1)]),
                    (e[o] = e[n]),
                    (e[n] = t);
                return e;
              }
              function s(e) {
                var t = {};
                for (var n in e)
                  if (Object.prototype.hasOwnProperty.call(e, n)) {
                    var o;
                    (o =
                      "x-algolia-api-key" === n ||
                      "x-algolia-application-id" === n
                        ? "**hidden for security purposes**"
                        : e[n]),
                      (t[n] = o);
                  }
                return t;
              }
              t.exports = o;
              var c = e(28),
                l = e(29),
                d = e(18),
                u = e(34),
                m = 500,
                f =
                  (n.env.RESET_APP_DATA_TIMER &&
                    parseInt(n.env.RESET_APP_DATA_TIMER, 10)) ||
                  12e4;
              (o.prototype.initIndex = function(e) {
                return new d(this, e);
              }),
                (o.prototype.setExtraHeader = function(e, t) {
                  this.extraHeaders.push({ name: e.toLowerCase(), value: t });
                }),
                (o.prototype.addAlgoliaAgent = function(e) {
                  -1 === this._ua.indexOf(";" + e) && (this._ua += ";" + e);
                }),
                (o.prototype._jsonRequest = function(t) {
                  function n(e, l) {
                    function m(e) {
                      var t =
                        (e && e.body && e.body.message && e.body.status) ||
                        e.statusCode ||
                        (e && e.body && 200);
                      a(
                        "received response: statusCode: %s, computed statusCode: %d, headers: %j",
                        e.statusCode,
                        t,
                        e.headers
                      );
                      var n = 2 === Math.floor(t / 100),
                        r = new Date();
                      if (
                        (g.push({
                          currentHost: E,
                          headers: s(i),
                          content: o || null,
                          contentLength: void 0 !== o ? o.length : null,
                          method: l.method,
                          timeouts: l.timeouts,
                          url: l.url,
                          startTime: _,
                          endTime: r,
                          duration: r - _,
                          statusCode: t
                        }),
                        n)
                      )
                        return (
                          u._useCache && d && (d[w] = e.responseText), e.body
                        );
                      if (4 !== Math.floor(t / 100)) return (f += 1), v();
                      a("unrecoverable error");
                      var m = new c.AlgoliaSearchError(
                        e.body && e.body.message,
                        { debugData: g, statusCode: t }
                      );
                      return u._promise.reject(m);
                    }
                    function y(e) {
                      a("error: %s, stack: %s", e.message, e.stack);
                      var n = new Date();
                      return (
                        g.push({
                          currentHost: E,
                          headers: s(i),
                          content: o || null,
                          contentLength: void 0 !== o ? o.length : null,
                          method: l.method,
                          timeouts: l.timeouts,
                          url: l.url,
                          startTime: _,
                          endTime: n,
                          duration: n - _
                        }),
                        e instanceof c.AlgoliaSearchError ||
                          (e = new c.Unknown(e && e.message, e)),
                        (f += 1),
                        e instanceof c.Unknown ||
                        e instanceof c.UnparsableJSON ||
                        (f >= u.hosts[t.hostType].length && (p || !h))
                          ? ((e.debugData = g), u._promise.reject(e))
                          : e instanceof c.RequestTimeout
                          ? b()
                          : v()
                      );
                    }
                    function v() {
                      return (
                        a("retrying request"),
                        u._incrementHostIndex(t.hostType),
                        n(e, l)
                      );
                    }
                    function b() {
                      return (
                        a("retrying request with higher timeout"),
                        u._incrementHostIndex(t.hostType),
                        u._incrementTimeoutMultipler(),
                        (l.timeouts = u._getTimeoutsForRequest(t.hostType)),
                        n(e, l)
                      );
                    }
                    u._checkAppIdData();
                    var w,
                      _ = new Date();
                    if (
                      (u._useCache && (w = t.url),
                      u._useCache && o && (w += "_body_" + l.body),
                      u._useCache && d && void 0 !== d[w])
                    )
                      return (
                        a("serving response from cache"),
                        u._promise.resolve(JSON.parse(d[w]))
                      );
                    if (f >= u.hosts[t.hostType].length)
                      return !h || p
                        ? (a("could not get any response"),
                          u._promise.reject(
                            new c.AlgoliaSearchError(
                              "Cannot connect to the AlgoliaSearch API. Send an email to support@algolia.com to report and resolve the issue. Application id was: " +
                                u.applicationID,
                              { debugData: g }
                            )
                          ))
                        : (a("switching to fallback"),
                          (f = 0),
                          (l.method = t.fallback.method),
                          (l.url = t.fallback.url),
                          (l.jsonBody = t.fallback.body),
                          l.jsonBody && (l.body = r(l.jsonBody)),
                          (i = u._computeRequestHeaders()),
                          (l.timeouts = u._getTimeoutsForRequest(t.hostType)),
                          u._setHostIndexByType(0, t.hostType),
                          (p = !0),
                          n(u._request.fallback, l));
                    var E = u._getHostByType(t.hostType),
                      T = E + l.url,
                      k = {
                        body: l.body,
                        jsonBody: l.jsonBody,
                        method: l.method,
                        headers: i,
                        timeouts: l.timeouts,
                        debug: a
                      };
                    return (
                      a(
                        "method: %s, url: %s, headers: %j, timeouts: %d",
                        k.method,
                        T,
                        k.headers,
                        k.timeouts
                      ),
                      e === u._request.fallback && a("using fallback"),
                      e.call(u, T, k).then(m, y)
                    );
                  }
                  this._checkAppIdData();
                  var o,
                    i,
                    a = e(1)("algoliasearch:" + t.url),
                    d = t.cache,
                    u = this,
                    f = 0,
                    p = !1,
                    h = u._useFallback && u._request.fallback && t.fallback;
                  this.apiKey.length > m &&
                  void 0 !== t.body &&
                  (void 0 !== t.body.params || void 0 !== t.body.requests)
                    ? ((t.body.apiKey = this.apiKey),
                      (i = this._computeRequestHeaders(!1)))
                    : (i = this._computeRequestHeaders()),
                    void 0 !== t.body && (o = r(t.body)),
                    a("request start");
                  var g = [],
                    y = n(u._request, {
                      url: t.url,
                      method: t.method,
                      body: o,
                      jsonBody: t.body,
                      timeouts: u._getTimeoutsForRequest(t.hostType)
                    });
                  return t.callback
                    ? void y.then(
                        function(e) {
                          l(function() {
                            t.callback(null, e);
                          }, u._setTimeout || setTimeout);
                        },
                        function(e) {
                          l(function() {
                            t.callback(e);
                          }, u._setTimeout || setTimeout);
                        }
                      )
                    : y;
                }),
                (o.prototype._getSearchParams = function(e, t) {
                  if (null == e) return t;
                  for (var n in e)
                    null !== n &&
                      void 0 !== e[n] &&
                      e.hasOwnProperty(n) &&
                      ((t += "" === t ? "" : "&"),
                      (t +=
                        n +
                        "=" +
                        encodeURIComponent(
                          "[object Array]" ===
                            Object.prototype.toString.call(e[n])
                            ? r(e[n])
                            : e[n]
                        )));
                  return t;
                }),
                (o.prototype._computeRequestHeaders = function(t) {
                  var n = e(5),
                    o = {
                      "x-algolia-agent": this._ua,
                      "x-algolia-application-id": this.applicationID
                    };
                  return (
                    !1 !== t && (o["x-algolia-api-key"] = this.apiKey),
                    this.userToken &&
                      (o["x-algolia-usertoken"] = this.userToken),
                    this.securityTags &&
                      (o["x-algolia-tagfilters"] = this.securityTags),
                    this.extraHeaders &&
                      n(this.extraHeaders, function(e) {
                        o[e.name] = e.value;
                      }),
                    o
                  );
                }),
                (o.prototype.search = function(t, n, o) {
                  var i = e(8),
                    r = e(30),
                    a = "Usage: client.search(arrayOfQueries[, callback])";
                  if (!i(t)) throw new Error(a);
                  "function" == typeof n
                    ? ((o = n), (n = {}))
                    : void 0 === n && (n = {});
                  var s = this,
                    c = {
                      requests: r(t, function(e) {
                        var t = "";
                        return (
                          void 0 !== e.query &&
                            (t += "query=" + encodeURIComponent(e.query)),
                          {
                            indexName: e.indexName,
                            params: s._getSearchParams(e.params, t)
                          }
                        );
                      })
                    },
                    l = r(c.requests, function(e, t) {
                      return (
                        t +
                        "=" +
                        encodeURIComponent(
                          "/1/indexes/" +
                            encodeURIComponent(e.indexName) +
                            "?" +
                            e.params
                        )
                      );
                    }).join("&"),
                    d = "/1/indexes/*/queries";
                  return (
                    void 0 !== n.strategy && (d += "?strategy=" + n.strategy),
                    this._jsonRequest({
                      cache: this.cache,
                      method: "POST",
                      url: d,
                      body: c,
                      hostType: "read",
                      fallback: {
                        method: "GET",
                        url: "/1/indexes/*",
                        body: { params: l }
                      },
                      callback: o
                    })
                  );
                }),
                (o.prototype.setSecurityTags = function(e) {
                  if ("[object Array]" === Object.prototype.toString.call(e)) {
                    for (var t = [], n = 0; n < e.length; ++n)
                      if (
                        "[object Array]" ===
                        Object.prototype.toString.call(e[n])
                      ) {
                        for (var o = [], i = 0; i < e[n].length; ++i)
                          o.push(e[n][i]);
                        t.push("(" + o.join(",") + ")");
                      } else t.push(e[n]);
                    e = t.join(",");
                  }
                  this.securityTags = e;
                }),
                (o.prototype.setUserToken = function(e) {
                  this.userToken = e;
                }),
                (o.prototype.clearCache = function() {
                  this.cache = {};
                }),
                (o.prototype.setRequestTimeout = function(e) {
                  e &&
                    (this._timeouts.connect = this._timeouts.read = this._timeouts.write = e);
                }),
                (o.prototype.setTimeouts = function(e) {
                  this._timeouts = e;
                }),
                (o.prototype.getTimeouts = function() {
                  return this._timeouts;
                }),
                (o.prototype._getAppIdData = function() {
                  var e = u.get(this.applicationID);
                  return null !== e && this._cacheAppIdData(e), e;
                }),
                (o.prototype._setAppIdData = function(e) {
                  return (
                    (e.lastChange = new Date().getTime()),
                    this._cacheAppIdData(e),
                    u.set(this.applicationID, e)
                  );
                }),
                (o.prototype._checkAppIdData = function() {
                  var e = this._getAppIdData(),
                    t = new Date().getTime();
                  return null === e || t - e.lastChange > f
                    ? this._resetInitialAppIdData(e)
                    : e;
                }),
                (o.prototype._resetInitialAppIdData = function(e) {
                  var t = e || {};
                  return (
                    (t.hostIndexes = { read: 0, write: 0 }),
                    (t.timeoutMultiplier = 1),
                    (t.shuffleResult = t.shuffleResult || a([1, 2, 3])),
                    this._setAppIdData(t)
                  );
                }),
                (o.prototype._cacheAppIdData = function(e) {
                  (this._hostIndexes = e.hostIndexes),
                    (this._timeoutMultiplier = e.timeoutMultiplier),
                    (this._shuffleResult = e.shuffleResult);
                }),
                (o.prototype._partialAppIdDataUpdate = function(t) {
                  var n = e(5),
                    o = this._getAppIdData();
                  return (
                    n(t, function(e, t) {
                      o[t] = e;
                    }),
                    this._setAppIdData(o)
                  );
                }),
                (o.prototype._getHostByType = function(e) {
                  return this.hosts[e][this._getHostIndexByType(e)];
                }),
                (o.prototype._getTimeoutMultiplier = function() {
                  return this._timeoutMultiplier;
                }),
                (o.prototype._getHostIndexByType = function(e) {
                  return this._hostIndexes[e];
                }),
                (o.prototype._setHostIndexByType = function(t, n) {
                  var o = e(25)(this._hostIndexes);
                  return (
                    (o[n] = t),
                    this._partialAppIdDataUpdate({ hostIndexes: o }),
                    t
                  );
                }),
                (o.prototype._incrementHostIndex = function(e) {
                  return this._setHostIndexByType(
                    (this._getHostIndexByType(e) + 1) % this.hosts[e].length,
                    e
                  );
                }),
                (o.prototype._incrementTimeoutMultipler = function() {
                  var e = Math.max(this._timeoutMultiplier + 1, 4);
                  return this._partialAppIdDataUpdate({ timeoutMultiplier: e });
                }),
                (o.prototype._getTimeoutsForRequest = function(e) {
                  return {
                    connect: this._timeouts.connect * this._timeoutMultiplier,
                    complete: this._timeouts[e] * this._timeoutMultiplier
                  };
                });
            }.call(this, e(12)));
          },
          {
            1: 1,
            12: 12,
            18: 18,
            25: 25,
            28: 28,
            29: 29,
            30: 30,
            34: 34,
            5: 5,
            8: 8
          }
        ],
        16: [
          function(e, t) {
            function n() {
              i.apply(this, arguments);
            }
            var o = e(7),
              i = e(18),
              r = e(26),
              a = e(27),
              s = e(29),
              c = e(28);
            (t.exports = n),
              o(n, i),
              (n.prototype.addObject = function(e, t, n) {
                var o = this;
                return (
                  (1 !== arguments.length && "function" != typeof t) ||
                    ((n = t), (t = void 0)),
                  this.as._jsonRequest({
                    method: void 0 !== t ? "PUT" : "POST",
                    url:
                      "/1/indexes/" +
                      encodeURIComponent(o.indexName) +
                      (void 0 !== t ? "/" + encodeURIComponent(t) : ""),
                    body: e,
                    hostType: "write",
                    callback: n
                  })
                );
              }),
              (n.prototype.addObjects = function(t, n) {
                var o = "Usage: index.addObjects(arrayOfObjects[, callback])";
                if (!e(8)(t)) throw new Error(o);
                for (
                  var i = this, r = { requests: [] }, a = 0;
                  a < t.length;
                  ++a
                ) {
                  var s = { action: "addObject", body: t[a] };
                  r.requests.push(s);
                }
                return this.as._jsonRequest({
                  method: "POST",
                  url:
                    "/1/indexes/" + encodeURIComponent(i.indexName) + "/batch",
                  body: r,
                  hostType: "write",
                  callback: n
                });
              }),
              (n.prototype.partialUpdateObject = function(e, t, n) {
                (1 !== arguments.length && "function" != typeof t) ||
                  ((n = t), (t = void 0));
                var o =
                  "/1/indexes/" +
                  encodeURIComponent(this.indexName) +
                  "/" +
                  encodeURIComponent(e.objectID) +
                  "/partial";
                return (
                  !1 === t && (o += "?createIfNotExists=false"),
                  this.as._jsonRequest({
                    method: "POST",
                    url: o,
                    body: e,
                    hostType: "write",
                    callback: n
                  })
                );
              }),
              (n.prototype.partialUpdateObjects = function(t, n) {
                var o =
                  "Usage: index.partialUpdateObjects(arrayOfObjects[, callback])";
                if (!e(8)(t)) throw new Error(o);
                for (
                  var i = this, r = { requests: [] }, a = 0;
                  a < t.length;
                  ++a
                ) {
                  var s = {
                    action: "partialUpdateObject",
                    objectID: t[a].objectID,
                    body: t[a]
                  };
                  r.requests.push(s);
                }
                return this.as._jsonRequest({
                  method: "POST",
                  url:
                    "/1/indexes/" + encodeURIComponent(i.indexName) + "/batch",
                  body: r,
                  hostType: "write",
                  callback: n
                });
              }),
              (n.prototype.saveObject = function(e, t) {
                var n = this;
                return this.as._jsonRequest({
                  method: "PUT",
                  url:
                    "/1/indexes/" +
                    encodeURIComponent(n.indexName) +
                    "/" +
                    encodeURIComponent(e.objectID),
                  body: e,
                  hostType: "write",
                  callback: t
                });
              }),
              (n.prototype.saveObjects = function(t, n) {
                var o = "Usage: index.saveObjects(arrayOfObjects[, callback])";
                if (!e(8)(t)) throw new Error(o);
                for (
                  var i = this, r = { requests: [] }, a = 0;
                  a < t.length;
                  ++a
                ) {
                  var s = {
                    action: "updateObject",
                    objectID: t[a].objectID,
                    body: t[a]
                  };
                  r.requests.push(s);
                }
                return this.as._jsonRequest({
                  method: "POST",
                  url:
                    "/1/indexes/" + encodeURIComponent(i.indexName) + "/batch",
                  body: r,
                  hostType: "write",
                  callback: n
                });
              }),
              (n.prototype.deleteObject = function(e, t) {
                if (
                  "function" == typeof e ||
                  ("string" != typeof e && "number" != typeof e)
                ) {
                  var n = new c.AlgoliaSearchError(
                    "Cannot delete an object without an objectID"
                  );
                  return "function" == typeof (t = e)
                    ? t(n)
                    : this.as._promise.reject(n);
                }
                var o = this;
                return this.as._jsonRequest({
                  method: "DELETE",
                  url:
                    "/1/indexes/" +
                    encodeURIComponent(o.indexName) +
                    "/" +
                    encodeURIComponent(e),
                  hostType: "write",
                  callback: t
                });
              }),
              (n.prototype.deleteObjects = function(t, n) {
                var o = e(8),
                  i = e(30),
                  r =
                    "Usage: index.deleteObjects(arrayOfObjectIDs[, callback])";
                if (!o(t)) throw new Error(r);
                var a = this,
                  s = {
                    requests: i(t, function(e) {
                      return {
                        action: "deleteObject",
                        objectID: e,
                        body: { objectID: e }
                      };
                    })
                  };
                return this.as._jsonRequest({
                  method: "POST",
                  url:
                    "/1/indexes/" + encodeURIComponent(a.indexName) + "/batch",
                  body: s,
                  hostType: "write",
                  callback: n
                });
              }),
              (n.prototype.deleteByQuery = function(t, n, o) {
                function i(e) {
                  if (0 === e.nbHits) return e;
                  var t = u(e.hits, function(e) {
                    return e.objectID;
                  });
                  return m
                    .deleteObjects(t)
                    .then(r)
                    .then(a);
                }
                function r(e) {
                  return m.waitTask(e.taskID);
                }
                function a() {
                  return m.deleteByQuery(t, n);
                }
                function c() {
                  s(function() {
                    o(null);
                  }, f._setTimeout || setTimeout);
                }
                function l(e) {
                  s(function() {
                    o(e);
                  }, f._setTimeout || setTimeout);
                }
                var d = e(25),
                  u = e(30),
                  m = this,
                  f = m.as;
                1 === arguments.length || "function" == typeof n
                  ? ((o = n), (n = {}))
                  : (n = d(n)),
                  (n.attributesToRetrieve = "objectID"),
                  (n.hitsPerPage = 1e3),
                  (n.distinct = !1),
                  this.clearCache();
                var p = this.search(t, n).then(i);
                return o ? void p.then(c, l) : p;
              }),
              (n.prototype.browseAll = function(t, n) {
                function o(e) {
                  var t;
                  a._stopped ||
                    ((t = void 0 !== e ? "cursor=" + encodeURIComponent(e) : l),
                    s._jsonRequest({
                      method: "GET",
                      url:
                        "/1/indexes/" +
                        encodeURIComponent(c.indexName) +
                        "/browse?" +
                        t,
                      hostType: "read",
                      callback: i
                    }));
                }
                function i(e, t) {
                  if (!a._stopped)
                    return e
                      ? void a._error(e)
                      : (a._result(t),
                        void 0 === t.cursor ? void a._end() : void o(t.cursor));
                }
                "object" == typeof t && ((n = t), (t = void 0));
                var r = e(31),
                  a = new (e(17))(),
                  s = this.as,
                  c = this,
                  l = s._getSearchParams(r({}, n || {}, { query: t }), "");
                return o(), a;
              }),
              (n.prototype.ttAdapter = function(e) {
                var t = this;
                return function(n, o, i) {
                  var r;
                  (r = "function" == typeof i ? i : o),
                    t.search(n, e, function(e, t) {
                      return e ? void r(e) : void r(t.hits);
                    });
                };
              }),
              (n.prototype.waitTask = function(e, t) {
                function n() {
                  return d
                    ._jsonRequest({
                      method: "GET",
                      hostType: "read",
                      url:
                        "/1/indexes/" +
                        encodeURIComponent(l.indexName) +
                        "/task/" +
                        e
                    })
                    .then(function(e) {
                      var t = r * ++c * c;
                      return (
                        t > a && (t = a),
                        "published" !== e.status
                          ? d._promise.delay(t).then(n)
                          : e
                      );
                    });
                }
                function o(e) {
                  s(function() {
                    t(null, e);
                  }, d._setTimeout || setTimeout);
                }
                function i(e) {
                  s(function() {
                    t(e);
                  }, d._setTimeout || setTimeout);
                }
                var r = 100,
                  a = 5e3,
                  c = 0,
                  l = this,
                  d = l.as,
                  u = n();
                return t ? void u.then(o, i) : u;
              }),
              (n.prototype.clearIndex = function(e) {
                var t = this;
                return this.as._jsonRequest({
                  method: "POST",
                  url:
                    "/1/indexes/" + encodeURIComponent(t.indexName) + "/clear",
                  hostType: "write",
                  callback: e
                });
              }),
              (n.prototype.getSettings = function(e) {
                var t = this;
                return this.as._jsonRequest({
                  method: "GET",
                  url:
                    "/1/indexes/" +
                    encodeURIComponent(t.indexName) +
                    "/settings?getVersion=2",
                  hostType: "read",
                  callback: e
                });
              }),
              (n.prototype.searchSynonyms = function(e, t) {
                return (
                  "function" == typeof e
                    ? ((t = e), (e = {}))
                    : void 0 === e && (e = {}),
                  this.as._jsonRequest({
                    method: "POST",
                    url:
                      "/1/indexes/" +
                      encodeURIComponent(this.indexName) +
                      "/synonyms/search",
                    body: e,
                    hostType: "read",
                    callback: t
                  })
                );
              }),
              (n.prototype.saveSynonym = function(e, t, n) {
                return (
                  "function" == typeof t
                    ? ((n = t), (t = {}))
                    : void 0 === t && (t = {}),
                  this.as._jsonRequest({
                    method: "PUT",
                    url:
                      "/1/indexes/" +
                      encodeURIComponent(this.indexName) +
                      "/synonyms/" +
                      encodeURIComponent(e.objectID) +
                      "?forwardToSlaves=" +
                      (t.forwardToSlaves ? "true" : "false"),
                    body: e,
                    hostType: "write",
                    callback: n
                  })
                );
              }),
              (n.prototype.getSynonym = function(e, t) {
                return this.as._jsonRequest({
                  method: "GET",
                  url:
                    "/1/indexes/" +
                    encodeURIComponent(this.indexName) +
                    "/synonyms/" +
                    encodeURIComponent(e),
                  hostType: "read",
                  callback: t
                });
              }),
              (n.prototype.deleteSynonym = function(e, t, n) {
                return (
                  "function" == typeof t
                    ? ((n = t), (t = {}))
                    : void 0 === t && (t = {}),
                  this.as._jsonRequest({
                    method: "DELETE",
                    url:
                      "/1/indexes/" +
                      encodeURIComponent(this.indexName) +
                      "/synonyms/" +
                      encodeURIComponent(e) +
                      "?forwardToSlaves=" +
                      (t.forwardToSlaves ? "true" : "false"),
                    hostType: "write",
                    callback: n
                  })
                );
              }),
              (n.prototype.clearSynonyms = function(e, t) {
                return (
                  "function" == typeof e
                    ? ((t = e), (e = {}))
                    : void 0 === e && (e = {}),
                  this.as._jsonRequest({
                    method: "POST",
                    url:
                      "/1/indexes/" +
                      encodeURIComponent(this.indexName) +
                      "/synonyms/clear?forwardToSlaves=" +
                      (e.forwardToSlaves ? "true" : "false"),
                    hostType: "write",
                    callback: t
                  })
                );
              }),
              (n.prototype.batchSynonyms = function(e, t, n) {
                return (
                  "function" == typeof t
                    ? ((n = t), (t = {}))
                    : void 0 === t && (t = {}),
                  this.as._jsonRequest({
                    method: "POST",
                    url:
                      "/1/indexes/" +
                      encodeURIComponent(this.indexName) +
                      "/synonyms/batch?forwardToSlaves=" +
                      (t.forwardToSlaves ? "true" : "false") +
                      "&replaceExistingSynonyms=" +
                      (t.replaceExistingSynonyms ? "true" : "false"),
                    hostType: "write",
                    body: e,
                    callback: n
                  })
                );
              }),
              (n.prototype.setSettings = function(e, t, n) {
                (1 !== arguments.length && "function" != typeof t) ||
                  ((n = t), (t = {}));
                var o = t.forwardToSlaves || !1,
                  i = this;
                return this.as._jsonRequest({
                  method: "PUT",
                  url:
                    "/1/indexes/" +
                    encodeURIComponent(i.indexName) +
                    "/settings?forwardToSlaves=" +
                    (o ? "true" : "false"),
                  hostType: "write",
                  body: e,
                  callback: n
                });
              }),
              (n.prototype.listUserKeys = function(e) {
                var t = this;
                return this.as._jsonRequest({
                  method: "GET",
                  url:
                    "/1/indexes/" + encodeURIComponent(t.indexName) + "/keys",
                  hostType: "read",
                  callback: e
                });
              }),
              (n.prototype.getUserKeyACL = function(e, t) {
                var n = this;
                return this.as._jsonRequest({
                  method: "GET",
                  url:
                    "/1/indexes/" +
                    encodeURIComponent(n.indexName) +
                    "/keys/" +
                    e,
                  hostType: "read",
                  callback: t
                });
              }),
              (n.prototype.deleteUserKey = function(e, t) {
                var n = this;
                return this.as._jsonRequest({
                  method: "DELETE",
                  url:
                    "/1/indexes/" +
                    encodeURIComponent(n.indexName) +
                    "/keys/" +
                    e,
                  hostType: "write",
                  callback: t
                });
              }),
              (n.prototype.addUserKey = function(t, n, o) {
                var i =
                  "Usage: index.addUserKey(arrayOfAcls[, params, callback])";
                if (!e(8)(t)) throw new Error(i);
                (1 !== arguments.length && "function" != typeof n) ||
                  ((o = n), (n = null));
                var r = { acl: t };
                return (
                  n &&
                    ((r.validity = n.validity),
                    (r.maxQueriesPerIPPerHour = n.maxQueriesPerIPPerHour),
                    (r.maxHitsPerQuery = n.maxHitsPerQuery),
                    (r.description = n.description),
                    n.queryParameters &&
                      (r.queryParameters = this.as._getSearchParams(
                        n.queryParameters,
                        ""
                      )),
                    (r.referers = n.referers)),
                  this.as._jsonRequest({
                    method: "POST",
                    url:
                      "/1/indexes/" +
                      encodeURIComponent(this.indexName) +
                      "/keys",
                    body: r,
                    hostType: "write",
                    callback: o
                  })
                );
              }),
              (n.prototype.addUserKeyWithValidity = r(function(e, t, n) {
                return this.addUserKey(e, t, n);
              }, a("index.addUserKeyWithValidity()", "index.addUserKey()"))),
              (n.prototype.updateUserKey = function(t, n, o, i) {
                var r =
                  "Usage: index.updateUserKey(key, arrayOfAcls[, params, callback])";
                if (!e(8)(n)) throw new Error(r);
                (2 !== arguments.length && "function" != typeof o) ||
                  ((i = o), (o = null));
                var a = { acl: n };
                return (
                  o &&
                    ((a.validity = o.validity),
                    (a.maxQueriesPerIPPerHour = o.maxQueriesPerIPPerHour),
                    (a.maxHitsPerQuery = o.maxHitsPerQuery),
                    (a.description = o.description),
                    o.queryParameters &&
                      (a.queryParameters = this.as._getSearchParams(
                        o.queryParameters,
                        ""
                      )),
                    (a.referers = o.referers)),
                  this.as._jsonRequest({
                    method: "PUT",
                    url:
                      "/1/indexes/" +
                      encodeURIComponent(this.indexName) +
                      "/keys/" +
                      t,
                    body: a,
                    hostType: "write",
                    callback: i
                  })
                );
              });
          },
          {
            17: 17,
            18: 18,
            25: 25,
            26: 26,
            27: 27,
            28: 28,
            29: 29,
            30: 30,
            31: 31,
            7: 7,
            8: 8
          }
        ],
        17: [
          function(e, t) {
            "use strict";
            function n() {}
            (t.exports = n),
              e(7)(n, e(4).EventEmitter),
              (n.prototype.stop = function() {
                (this._stopped = !0), this._clean();
              }),
              (n.prototype._end = function() {
                this.emit("end"), this._clean();
              }),
              (n.prototype._error = function(e) {
                this.emit("error", e), this._clean();
              }),
              (n.prototype._result = function(e) {
                this.emit("result", e);
              }),
              (n.prototype._clean = function() {
                this.removeAllListeners("stop"),
                  this.removeAllListeners("end"),
                  this.removeAllListeners("error"),
                  this.removeAllListeners("result");
              });
          },
          { 4: 4, 7: 7 }
        ],
        18: [
          function(e, t) {
            function n(e, t) {
              (this.indexName = t),
                (this.as = e),
                (this.typeAheadArgs = null),
                (this.typeAheadValueOption = null),
                (this.cache = {});
            }
            var o = e(24),
              i = e(26),
              r = e(27);
            (t.exports = n),
              (n.prototype.clearCache = function() {
                this.cache = {};
              }),
              (n.prototype.search = o("query")),
              (n.prototype.similarSearch = o("similarQuery")),
              (n.prototype.browse = function(t, n, o) {
                var i,
                  r,
                  a = e(31),
                  s = this;
                0 === arguments.length ||
                (1 === arguments.length && "function" == typeof arguments[0])
                  ? ((i = 0), (o = arguments[0]), (t = void 0))
                  : "number" == typeof arguments[0]
                  ? ((i = arguments[0]),
                    "number" == typeof arguments[1]
                      ? (r = arguments[1])
                      : "function" == typeof arguments[1] &&
                        ((o = arguments[1]), (r = void 0)),
                    (t = void 0),
                    (n = void 0))
                  : "object" == typeof arguments[0]
                  ? ("function" == typeof arguments[1] && (o = arguments[1]),
                    (n = arguments[0]),
                    (t = void 0))
                  : "string" == typeof arguments[0] &&
                    "function" == typeof arguments[1] &&
                    ((o = arguments[1]), (n = void 0)),
                  (n = a({}, n || {}, { page: i, hitsPerPage: r, query: t }));
                var c = this.as._getSearchParams(n, "");
                return this.as._jsonRequest({
                  method: "GET",
                  url:
                    "/1/indexes/" +
                    encodeURIComponent(s.indexName) +
                    "/browse?" +
                    c,
                  hostType: "read",
                  callback: o
                });
              }),
              (n.prototype.browseFrom = function(e, t) {
                return this.as._jsonRequest({
                  method: "GET",
                  url:
                    "/1/indexes/" +
                    encodeURIComponent(this.indexName) +
                    "/browse?cursor=" +
                    encodeURIComponent(e),
                  hostType: "read",
                  callback: t
                });
              }),
              (n.prototype.searchForFacetValues = function(t, n) {
                var o = e(25),
                  i = e(32),
                  r =
                    "Usage: index.searchForFacetValues({facetName, facetQuery, ...params}[, callback])";
                if (void 0 === t.facetName || void 0 === t.facetQuery)
                  throw new Error(r);
                var a = t.facetName,
                  s = i(o(t), function(e) {
                    return "facetName" === e;
                  }),
                  c = this.as._getSearchParams(s, "");
                return this.as._jsonRequest({
                  method: "POST",
                  url:
                    "/1/indexes/" +
                    encodeURIComponent(this.indexName) +
                    "/facets/" +
                    encodeURIComponent(a) +
                    "/query",
                  hostType: "read",
                  body: { params: c },
                  callback: n
                });
              }),
              (n.prototype.searchFacet = i(function(e, t) {
                return this.searchForFacetValues(e, t);
              }, r(
                "index.searchFacet(params[, callback])",
                "index.searchForFacetValues(params[, callback])"
              ))),
              (n.prototype._search = function(e, t, n) {
                return this.as._jsonRequest({
                  cache: this.cache,
                  method: "POST",
                  url:
                    t ||
                    "/1/indexes/" +
                      encodeURIComponent(this.indexName) +
                      "/query",
                  body: { params: e },
                  hostType: "read",
                  fallback: {
                    method: "GET",
                    url: "/1/indexes/" + encodeURIComponent(this.indexName),
                    body: { params: e }
                  },
                  callback: n
                });
              }),
              (n.prototype.getObject = function(e, t, n) {
                var o = this;
                (1 !== arguments.length && "function" != typeof t) ||
                  ((n = t), (t = void 0));
                var i = "";
                if (void 0 !== t) {
                  i = "?attributes=";
                  for (var r = 0; r < t.length; ++r)
                    0 !== r && (i += ","), (i += t[r]);
                }
                return this.as._jsonRequest({
                  method: "GET",
                  url:
                    "/1/indexes/" +
                    encodeURIComponent(o.indexName) +
                    "/" +
                    encodeURIComponent(e) +
                    i,
                  hostType: "read",
                  callback: n
                });
              }),
              (n.prototype.getObjects = function(t, n, o) {
                var i = e(8),
                  r = e(30),
                  a = "Usage: index.getObjects(arrayOfObjectIDs[, callback])";
                if (!i(t)) throw new Error(a);
                var s = this;
                (1 !== arguments.length && "function" != typeof n) ||
                  ((o = n), (n = void 0));
                var c = {
                  requests: r(t, function(e) {
                    var t = { indexName: s.indexName, objectID: e };
                    return n && (t.attributesToRetrieve = n.join(",")), t;
                  })
                };
                return this.as._jsonRequest({
                  method: "POST",
                  url: "/1/indexes/*/objects",
                  hostType: "read",
                  body: c,
                  callback: o
                });
              }),
              (n.prototype.as = null),
              (n.prototype.indexName = null),
              (n.prototype.typeAheadArgs = null),
              (n.prototype.typeAheadValueOption = null);
          },
          { 24: 24, 25: 25, 26: 26, 27: 27, 30: 30, 31: 31, 32: 32, 8: 8 }
        ],
        19: [
          function(e, t) {
            "use strict";
            var n = e(14),
              o = e(20);
            t.exports = o(n);
          },
          { 14: 14, 20: 20 }
        ],
        20: [
          function(e, t) {
            (function(n) {
              "use strict";
              var o = e(6),
                i = o.Promise || e(3).Promise;
              t.exports = function(t, r) {
                function a(t, n, o) {
                  var i = e(25),
                    r = e(21);
                  return (
                    void 0 === (o = i(o || {})).protocol && (o.protocol = r()),
                    (o._ua = o._ua || a.ua),
                    new s(t, n, o)
                  );
                }
                function s() {
                  t.apply(this, arguments);
                }
                var c = e(7),
                  l = e(28),
                  d = e(22),
                  u = e(23),
                  m = e(33);
                (r = r || ""),
                  "debug" === n.env.NODE_ENV && e(1).enable("algoliasearch*"),
                  (a.version = e(35)),
                  (a.ua = "Algolia for vanilla JavaScript " + r + a.version),
                  (a.initPlaces = m(a)),
                  (o.__algolia = { debug: e(1), algoliasearch: a });
                var f = {
                  hasXMLHttpRequest: "XMLHttpRequest" in o,
                  hasXDomainRequest: "XDomainRequest" in o
                };
                return (
                  f.hasXMLHttpRequest &&
                    (f.cors = "withCredentials" in new XMLHttpRequest()),
                  c(s, t),
                  (s.prototype._request = function(e, t) {
                    return new i(function(n, o) {
                      function i() {
                        if (!p) {
                          var e;
                          clearTimeout(m);
                          try {
                            e = {
                              body: JSON.parse(g.responseText),
                              responseText: g.responseText,
                              statusCode: g.status,
                              headers:
                                (g.getAllResponseHeaders &&
                                  g.getAllResponseHeaders()) ||
                                {}
                            };
                          } catch (t) {
                            e = new l.UnparsableJSON({ more: g.responseText });
                          }
                          e instanceof l.UnparsableJSON ? o(e) : n(e);
                        }
                      }
                      function r(e) {
                        p || (clearTimeout(m), o(new l.Network({ more: e })));
                      }
                      function a() {
                        (p = !0), g.abort(), o(new l.RequestTimeout());
                      }
                      function s() {
                        (y = !0),
                          clearTimeout(m),
                          (m = setTimeout(a, t.timeouts.complete));
                      }
                      function c() {
                        y || s();
                      }
                      function u() {
                        !y && g.readyState > 1 && s();
                      }
                      if (f.cors || f.hasXDomainRequest) {
                        e = d(e, t.headers);
                        var m,
                          p,
                          h = t.body,
                          g = f.cors
                            ? new XMLHttpRequest()
                            : new XDomainRequest(),
                          y = !1;
                        (m = setTimeout(a, t.timeouts.connect)),
                          (g.onprogress = c),
                          "onreadystatechange" in g &&
                            (g.onreadystatechange = u),
                          (g.onload = i),
                          (g.onerror = r),
                          g instanceof XMLHttpRequest
                            ? g.open(t.method, e, !0)
                            : g.open(t.method, e),
                          f.cors &&
                            (h &&
                              ("POST" === t.method
                                ? g.setRequestHeader(
                                    "content-type",
                                    "application/x-www-form-urlencoded"
                                  )
                                : g.setRequestHeader(
                                    "content-type",
                                    "application/json"
                                  )),
                            g.setRequestHeader("accept", "application/json")),
                          g.send(h);
                      } else o(new l.Network("CORS not supported"));
                    });
                  }),
                  (s.prototype._request.fallback = function(e, t) {
                    return (
                      (e = d(e, t.headers)),
                      new i(function(n, o) {
                        u(e, t, function(e, t) {
                          return e ? void o(e) : void n(t);
                        });
                      })
                    );
                  }),
                  (s.prototype._promise = {
                    reject: function(e) {
                      return i.reject(e);
                    },
                    resolve: function(e) {
                      return i.resolve(e);
                    },
                    delay: function(e) {
                      return new i(function(t) {
                        setTimeout(t, e);
                      });
                    }
                  }),
                  a
                );
              };
            }.call(this, e(12)));
          },
          {
            1: 1,
            12: 12,
            21: 21,
            22: 22,
            23: 23,
            25: 25,
            28: 28,
            3: 3,
            33: 33,
            35: 35,
            6: 6,
            7: 7
          }
        ],
        21: [
          function(e, t) {
            "use strict";
            function n() {
              var e = window.document.location.protocol;
              return "http:" !== e && "https:" !== e && (e = "http:"), e;
            }
            t.exports = n;
          },
          {}
        ],
        22: [
          function(e, t) {
            "use strict";
            function n(e, t) {
              return (e += /\?/.test(e) ? "&" : "?") + o(t);
            }
            t.exports = n;
            var o = e(13);
          },
          { 13: 13 }
        ],
        23: [
          function(e, t) {
            "use strict";
            function n(e, t, n) {
              function r() {
                t.debug("JSONP: success"),
                  g ||
                    m ||
                    ((g = !0),
                    u ||
                      (t.debug(
                        "JSONP: Fail. Script loaded but did not call the callback"
                      ),
                      s(),
                      n(new o.JSONPScriptFail())));
              }
              function a() {
                ("loaded" !== this.readyState &&
                  "complete" !== this.readyState) ||
                  r();
              }
              function s() {
                clearTimeout(y),
                  (p.onload = null),
                  (p.onreadystatechange = null),
                  (p.onerror = null),
                  f.removeChild(p);
              }
              function c() {
                try {
                  delete window[h], delete window[h + "_loaded"];
                } catch (e) {
                  window[h] = window[h + "_loaded"] = void 0;
                }
              }
              function l() {
                t.debug("JSONP: Script timeout"),
                  (m = !0),
                  s(),
                  n(new o.RequestTimeout());
              }
              function d() {
                t.debug("JSONP: Script error"),
                  g || m || (s(), n(new o.JSONPScriptError()));
              }
              if ("GET" === t.method) {
                t.debug("JSONP: start");
                var u = !1,
                  m = !1;
                i += 1;
                var f = document.getElementsByTagName("head")[0],
                  p = document.createElement("script"),
                  h = "algoliaJSONP_" + i,
                  g = !1;
                (window[h] = function(e) {
                  return (
                    c(),
                    m
                      ? void t.debug("JSONP: Late answer, ignoring")
                      : ((u = !0), s(), void n(null, { body: e }))
                  );
                }),
                  (e += "&callback=" + h),
                  t.jsonBody &&
                    t.jsonBody.params &&
                    (e += "&" + t.jsonBody.params);
                var y = setTimeout(l, t.timeouts.complete);
                (p.onreadystatechange = a),
                  (p.onload = r),
                  (p.onerror = d),
                  (p.async = !0),
                  (p.defer = !0),
                  (p.src = e),
                  f.appendChild(p);
              } else
                n(
                  new Error(
                    "Method " +
                      t.method +
                      " " +
                      e +
                      " is not supported by JSONP."
                  )
                );
            }
            t.exports = n;
            var o = e(28),
              i = 0;
          },
          { 28: 28 }
        ],
        24: [
          function(e, t) {
            function n(e, t) {
              return function(n, i, r) {
                if (
                  ("function" == typeof n && "object" == typeof i) ||
                  "object" == typeof r
                )
                  throw new o.AlgoliaSearchError(
                    "index.search usage is index.search(query, params, cb)"
                  );
                0 === arguments.length || "function" == typeof n
                  ? ((r = n), (n = ""))
                  : (1 !== arguments.length && "function" != typeof i) ||
                    ((r = i), (i = void 0)),
                  "object" == typeof n && null !== n
                    ? ((i = n), (n = void 0))
                    : null != n || (n = "");
                var a = "";
                return (
                  void 0 !== n && (a += e + "=" + encodeURIComponent(n)),
                  void 0 !== i && (a = this.as._getSearchParams(i, a)),
                  this._search(a, t, r)
                );
              };
            }
            t.exports = n;
            var o = e(28);
          },
          { 28: 28 }
        ],
        25: [
          function(e, t) {
            t.exports = function(e) {
              return JSON.parse(JSON.stringify(e));
            };
          },
          {}
        ],
        26: [
          function(e, t) {
            t.exports = function(e, t) {
              function n() {
                return (
                  o || (console.log(t), (o = !0)), e.apply(this, arguments)
                );
              }
              var o = !1;
              return n;
            };
          },
          {}
        ],
        27: [
          function(e, t) {
            t.exports = function(e, t) {
              return (
                "algoliasearch: `" +
                e +
                "` was replaced by `" +
                t +
                "`. Please see https://github.com/algolia/algoliasearch-client-js/wiki/Deprecated#" +
                e
                  .toLowerCase()
                  .replace(".", "")
                  .replace("()", "")
              );
            };
          },
          {}
        ],
        28: [
          function(e, t) {
            "use strict";
            function n(t, n) {
              var o = e(5),
                i = this;
              "function" == typeof Error.captureStackTrace
                ? Error.captureStackTrace(this, this.constructor)
                : (i.stack =
                    new Error().stack ||
                    "Cannot get a stacktrace, browser is too old"),
                (this.name = "AlgoliaSearchError"),
                (this.message = t || "Unknown error"),
                n &&
                  o(n, function(e, t) {
                    i[t] = e;
                  });
            }
            function o(e, t) {
              function o() {
                var o = Array.prototype.slice.call(arguments, 0);
                "string" != typeof o[0] && o.unshift(t),
                  n.apply(this, o),
                  (this.name = "AlgoliaSearch" + e + "Error");
              }
              return i(o, n), o;
            }
            var i = e(7);
            i(n, Error),
              (t.exports = {
                AlgoliaSearchError: n,
                UnparsableJSON: o(
                  "UnparsableJSON",
                  "Could not parse the incoming response as JSON, see err.more for details"
                ),
                RequestTimeout: o(
                  "RequestTimeout",
                  "Request timedout before getting a response"
                ),
                Network: o(
                  "Network",
                  "Network issue, see err.more for details"
                ),
                JSONPScriptFail: o(
                  "JSONPScriptFail",
                  "<script> was loaded but did not call our provided callback"
                ),
                JSONPScriptError: o(
                  "JSONPScriptError",
                  "<script> unable to load due to an `error` event on it"
                ),
                Unknown: o("Unknown", "Unknown error occured")
              });
          },
          { 5: 5, 7: 7 }
        ],
        29: [
          function(e, t) {
            t.exports = function(e, t) {
              t(e, 0);
            };
          },
          {}
        ],
        30: [
          function(e, t) {
            var n = e(5);
            t.exports = function(e, t) {
              var o = [];
              return (
                n(e, function(n, i) {
                  o.push(t(n, i, e));
                }),
                o
              );
            };
          },
          { 5: 5 }
        ],
        31: [
          function(e, t) {
            var n = e(5);
            t.exports = function o(e) {
              var t = Array.prototype.slice.call(arguments);
              return (
                n(t, function(t) {
                  for (var n in t)
                    t.hasOwnProperty(n) &&
                      ("object" == typeof e[n] && "object" == typeof t[n]
                        ? (e[n] = o({}, e[n], t[n]))
                        : void 0 !== t[n] && (e[n] = t[n]));
                }),
                e
              );
            };
          },
          { 5: 5 }
        ],
        32: [
          function(e, t) {
            t.exports = function(t, n) {
              var o = e(10),
                i = e(5),
                r = {};
              return (
                i(o(t), function(e) {
                  !0 !== n(e) && (r[e] = t[e]);
                }),
                r
              );
            };
          },
          { 10: 10, 5: 5 }
        ],
        33: [
          function(e, t) {
            function n(t) {
              return function(n, i, r) {
                var a = e(25);
                ((r = (r && a(r)) || {}).hosts = r.hosts || [
                  "places-dsn.algolia.net",
                  "places-1.algolianet.com",
                  "places-2.algolianet.com",
                  "places-3.algolianet.com"
                ]),
                  (0 !== arguments.length &&
                    "object" != typeof n &&
                    void 0 !== n) ||
                    ((n = ""), (i = ""), (r._allowEmptyCredentials = !0));
                var s = t(n, i, r).initIndex("places");
                return (s.search = o("query", "/1/places/query")), s;
              };
            }
            t.exports = n;
            var o = e(24);
          },
          { 24: 24, 25: 25 }
        ],
        34: [
          function(e, t) {
            (function(n) {
              function o(e, t) {
                return 1 === arguments.length ? a.get(e) : a.set(e, t);
              }
              function i() {
                try {
                  return (
                    "localStorage" in n &&
                    null !== n.localStorage &&
                    !n.localStorage[c] &&
                    (n.localStorage.setItem(c, JSON.stringify({})), !0)
                  );
                } catch (e) {
                  return !1;
                }
              }
              function r() {
                try {
                  n.localStorage.removeItem(c);
                } catch (e) {}
              }
              var a,
                s = e(1)("algoliasearch:src/hostIndexState.js"),
                c = "algoliasearch-client-js",
                l = {
                  state: {},
                  set: function(e, t) {
                    return (this.state[e] = t), this.state[e];
                  },
                  get: function(e) {
                    return this.state[e] || null;
                  }
                },
                d = {
                  set: function(e, t) {
                    try {
                      var o = JSON.parse(n.localStorage[c]);
                      return (
                        (o[e] = t),
                        (n.localStorage[c] = JSON.stringify(o)),
                        o[e]
                      );
                    } catch (i) {
                      return (
                        s("localStorage set failed with", i),
                        r(),
                        (a = l).set(e, t)
                      );
                    }
                  },
                  get: function(e) {
                    return JSON.parse(n.localStorage[c])[e] || null;
                  }
                };
              (a = i() ? d : l), (t.exports = { get: o, set: o });
            }.call(
              this,
              "undefined" != typeof global
                ? global
                : "undefined" != typeof self
                ? self
                : "undefined" != typeof window
                ? window
                : {}
            ));
          },
          { 1: 1 }
        ],
        35: [
          function(e, t) {
            "use strict";
            t.exports = "3.20.3";
          },
          {}
        ]
      },
      {},
      [19]
    )(19);
  });
var instantClick,
  InstantClick = (instantClick = (function(e, t, n) {
    function o(e) {
      var t = e.indexOf("#");
      return t < 0 ? e : e.substr(0, t);
    }
    function i(e) {
      for (; e && "A" != e.nodeName; ) e = e.parentNode;
      return e;
    }
    function r(e) {
      do {
        if (!e.hasAttribute) break;
        if (e.hasAttribute("data-instant")) return !1;
        if (e.hasAttribute("data-no-instant")) return !0;
      } while ((e = e.parentNode));
      return !1;
    }
    function a(e) {
      var n = t.protocol + "//" + t.host;
      return !(
        e.target ||
        e.hasAttribute("download") ||
        0 != e.href.indexOf(n + "/") ||
        (e.href.indexOf("#") > -1 && o(e.href) == S) ||
        r(e)
      );
    }
    function s(e, t, n, o) {
      for (var i = !1, r = 0; r < z[e].length; r++)
        if ("receive" == e) {
          var a = z[e][r](t, n, o);
          a &&
            ("body" in a && (n = a.body),
            "title" in a && (o = a.title),
            (i = a));
        } else z[e][r](t, n, o);
      return i;
    }
    function c(t, n, i, r, a) {
      var c = e.getElementById("page-content");
      if (
        (e.getElementById("navigation-butt") &&
          e.getElementById("navigation-butt").classList.remove("showing"),
        e.getElementsByTagName("BODY")[0].replaceChild(n, c),
        e.getElementById("navigation-progress").classList.remove("showing"),
        i)
      ) {
        history.pushState(
          null,
          null,
          i.replace("?samepage=true", "").replace("&samepage=true", "")
        );
        var l = i.indexOf("#"),
          d = l > -1 && e.getElementById(i.substr(l + 1)),
          u = 0,
          m = i.indexOf("samepage=true") > -1;
        if (d)
          for (; d.offsetParent; ) (u += d.offsetTop), (d = d.offsetParent);
        m || scrollTo(0, u), (S = o(i));
      } else scrollTo(0, r);
      O && e.title == t
        ? (e.title = t + String.fromCharCode(160))
        : (e.title = t),
        b(),
        a ? s("restore") : s("change", !1);
    }
    function l() {
      (q = !1), (U = !1);
    }
    function d(e) {
      return e.replace(/<noscript[\s\S]+?<\/noscript>/gi, "");
    }
    function u(e) {
      if (!(C > +new Date() - 500)) {
        var t = i(e.target);
        t && a(t) && w(t.href);
      }
    }
    function m(e) {
      if (!(C > +new Date() - 500)) {
        var t = i(e.target);
        t &&
          a(t) &&
          (t.addEventListener("mouseout", h),
          R ? ((L = t.href), (B = setTimeout(w, R))) : w(t.href),
          getImageForLink(t));
      }
    }
    function f(e) {
      C = +new Date();
      var t = i(e.target);
      t &&
        a(t) &&
        (N
          ? t.removeEventListener("mousedown", u)
          : t.removeEventListener("mouseover", m),
        w(t.href),
        getImageForLink(t));
    }
    function p(e) {
      try {
        var t = i(e.target);
        if (!t || !a(t)) return;
        if (e.which > 1 || e.metaKey || e.ctrlKey) return;
        if (
          (T(t.href),
          e.preventDefault(),
          window.ga && ga.create && t.hasAttribute("data-featured-article"))
        ) {
          var n = t.dataset.featuredArticle;
          ga("send", "event", "click", "featured-feed-click", n, null);
        }
      } catch (o) {
        console.log(o);
      }
    }
    function h() {
      if (B) return clearTimeout(B), void (B = !1);
      q && !U && (A.abort(), l());
    }
    function g() {
      y(A, j);
    }
    function y(t, n) {
      if (!(t.readyState < 4) && 0 != t.status) {
        if (
          ((H.ready = +new Date() - H.start),
          e.getElementById("page-content") &&
            200 === t.status &&
            t.getResponseHeader("Content-Type").match(/\/(x|ht|xht)ml/))
        ) {
          var i = e.implementation.createHTMLDocument("");
          i.documentElement.innerHTML = d(t.responseText);
          var r = i.title,
            a = i.getElementById("page-content"),
            c = s("receive", n, a, r);
          c && ("body" in c && (a = c.body), "title" in c && (r = c.title)),
            (D[n] = { body: a, title: r });
          o(n);
          for (var l, u, m = i.head.children, f = 0, p = 0; p < m.length; p++)
            if ((l = m[p]).hasAttribute("data-instant-track")) {
              u =
                l.getAttribute("href") || l.getAttribute("src") || l.innerHTML;
              for (var h = 0; h < F.length; h++) F[h] == u && f++;
            }
          f != F.length && (P = !0);
        } else P = !0;
        U && j === n && ((U = !1), T(j));
      }
    }
    function v() {
      var n = o(t.href);
      n != S &&
        (n in M
          ? ((M[S] = {
              body: e.getElementById("page-content"),
              title: e.title,
              scrollY: pageYOffset
            }),
            (S = n),
            c(M[n].title, M[n].body, !1, M[n].scrollY, !0))
          : (t.href = t.href));
    }
    function b(t) {
      if (
        (e.body &&
          (e.body.addEventListener("touchstart", f, !0),
          N
            ? e.body.addEventListener("mousedown", u, !0)
            : e.body.addEventListener("mouseover", m, !0),
          e.body.addEventListener("click", p, !0)),
        !t)
      )
        for (
          var n,
            o,
            i,
            r,
            a = e.body.getElementsByTagName("script"),
            s = 0,
            c = a.length;
          s < c;
          s++
        )
          (n = a[s]).hasAttribute("data-no-instant") ||
            ((o = e.createElement("script")),
            n.src && (o.src = n.src),
            n.innerHTML && (o.innerHTML = n.innerHTML),
            (i = n.parentNode),
            (r = n.nextSibling),
            i.removeChild(n),
            i.insertBefore(o, r));
    }
    function w(e, t) {
      if (
        !(!N && "display" in H && +new Date() - (H.start + H.display) < 100) &&
        (B && (clearTimeout(B), (B = !1)), e || (e = L), !q || (e != j && !U))
      ) {
        if (
          ((q = !0),
          (U = !1),
          (P = !1),
          (H = { start: +new Date() }),
          -1 == e.indexOf("?"))
        )
          var n = e + "?i=i";
        else n = e + "&i=i";
        _(),
          s("fetch"),
          D[e] ||
            ("force" === t
              ? E(e, function() {
                  y(this, e);
                })
              : ((j = e), A.open("GET", n), A.send()));
      }
    }
    function _(e) {
      (Object.keys(D).length > 13 || "force" == e) && (D = {});
    }
    function E(e, t) {
      var n = new XMLHttpRequest();
      if (-1 == e.indexOf("?")) var o = e + "?i=i";
      else o = e + "&i=i";
      n.open("GET", o, !0),
        (n.onreadystatechange = function() {
          4 == n.readyState && "function" == typeof t && t.apply(n);
        }),
        n.send();
    }
    function T(n) {
      if (((j = n), D[n]))
        var o = D[n].body,
          i = D[n].title;
      else e.getElementById("navigation-progress").classList.add("showing");
      if (("display" in H || (H.display = +new Date() - H.start), B || !q))
        return B && j && j != n
          ? void (t.href = n)
          : (w(n), s("wait"), void (U = !0));
      if (U) t.href = n;
      else if (P) t.href = j;
      else {
        if (!o) return s("wait"), void (U = !0);
        (M[S] = {
          body: e.getElementById("page-content"),
          title: e.title,
          scrollY: pageYOffset
        }),
          l(),
          c(i, o, j);
      }
    }
    function k(n) {
      if (!S)
        if (X) {
          "mousedown" == n ? (N = !0) : "number" == typeof n && (R = n),
            (S = o(t.href)),
            (M[S] = {
              body: e.getElementById("page-content"),
              title: e.title,
              scrollY: pageYOffset
            });
          for (var i, r, a = e.head.children, c = 0; c < a.length; c++)
            (i = a[c]).hasAttribute("data-instant-track") &&
              ((r =
                i.getAttribute("href") || i.getAttribute("src") || i.innerHTML),
              F.push(r));
          (A = new XMLHttpRequest()).addEventListener("readystatechange", g),
            b(!0),
            s("change", !0),
            addEventListener("popstate", v),
            x();
        } else s("change", !0);
    }
    function I(e, t) {
      z[e].push(t);
    }
    function x() {
      if ("ontouchstart" in e.documentElement) {
        var t = e.createElement("script");
        (t.src =
          "https://practicaldev-herokuapp-com.freetls.fastly.net/assets/lib/pulltorefresh-3772e82b051ed9f9d35d296c4d28eee86f488a46f87df17421538f55a20fabd7.js"),
          e.head.appendChild(t);
        var n = setInterval(function() {
          if ("undefined" != typeof PullToRefresh) {
            PullToRefresh.init({
              mainElement: "body",
              passive: !0,
              onRefresh: function() {
                window.location.reload();
              }
            });
            clearInterval(n);
          }
        }, 1);
      }
    }
    var S,
      L,
      B,
      C,
      A,
      N,
      R,
      O = n.indexOf(" CriOS/") > -1,
      M = {},
      j = !1,
      P = !1,
      D = {},
      H = {},
      q = !1,
      U = !1,
      F = [],
      z = { fetch: [], receive: [], wait: [], change: [], restore: [] },
      X =
        "pushState" in history &&
        (!n.match("Android") || n.match("Chrome/") || n.match("Firefox/")) &&
        "file:" != t.protocol;
    return {
      supported: X,
      init: k,
      isPreloadable: a,
      preload: w,
      removeExpiredKeys: _,
      display: T,
      on: I
    };
  })(document, location, navigator.userAgent));
Honeybadger.configure({
  apiKey: "a45862f6",
  environment: "production",
  revision: "a9cb13c3f611d00e661dd503f74405f9a8ac5779"
}),
  initializeBaseApp();
