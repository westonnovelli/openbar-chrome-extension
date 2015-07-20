// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(url);
  });
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function search_page() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "http://localhost:8000/voodoo/search_page", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      document.getElementById("content").innerHtml = xhr.responseText;
    }
  }
  xhr.send();
}

function search() {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://localhost:8000/search/", true);
  xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      document.getElementById("results").innerHTML = xhr.responseText;
      $('.header').html("");
      set_folder_manage_actions();
      set_followable_links();
    }
  }
  xhr.send("source=extension&input=" + document.getElementById("searchbar").value);
}

function get_folders() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "http://localhost:8000/extension/folders", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // innerText does not let the attacker inject HTML elements.
      document.getElementById("folders").innerHTML = xhr.responseText;
      set_menu();
      set_followable_links();
      set_click_handlers();
    }
  }
  xhr.send();
}

function set_menu() {
  $('.tree-toggle').click(function () {
    $(this).parent().children('ul.tree').toggle(200);
  });
  $(function(){
    $('.tree-toggle').parent().children('ul.tree').toggle(200);
  })
}

function adj(id, direction, amount) {
  url = "http://localhost:8000/set_complexity_score";
  if (direction == "greater") {
    url = "http://localhost:8000/increase_complexity_score";
  } else if (direction == "less") {
    url = "http://localhost:8000/decrease_complexity_score";
  }
  $.ajax({
    url: url,
    data: {id: id, amount: amount},
    success: function(result){
      console.log(result);
    }
  });
}
function review(id) {
  $.ajax({
    url: "http://localhost:8000/reviewed_link/",
    data: {id: id},
    success: function(result){
      $("#links_followed").html(result);
      set_followed_links_dropdown();
    }
  });
}
function decrease_complexity(id) {
  adj(id, "less", 1);
}
function increase_complexity(id) {
  adj(id, "greater", 1);
}
function update_indicator() {
  $(".indicator").toggleClass("glyphicon-folder-close");
  $(".indicator").toggleClass("glyphicon-folder-open");
}
function set_click_handlers() {
  $('.folder').on('click', function(event) {
    update_indicator();
  });
  set_menu();
  set_folder_manage_actions();
}
function get_user_complexity_score() {
  score = "";
  $.ajax({
    url: "http://localhost:8000/get_user_complexity_score/",
    success: function(result) {
      $("#user_cs").html(result);
      score = result;
    }
  });
  return score;
}

function set_tooltips() {
  $(function () { $("[data-toggle='tooltip']").tooltip(); });
  $(function () { $("[data-toggle='popover']").popover({html: true}); });
}

function set_review_actions() {
  $('.adjust-just-right').on('click', function(event) {
    review($(this).parent().data("followed-link-id"));
  });
  $('.adjust-less').on('click', function(event) {
    decrease_complexity($(this).parent().data("query-id"));
    review($(this).parent().data("followed-link-id"));
  });
  $('.adjust-more').on('click', function(event) {
    increase_complexity($(this).parent().data("query-id"));
    review($(this).parent().data("followed-link-id"));
  });
}

function set_folder_dropdown() {
  $('button.openbar-dropdown-folder').on('click', function (event) {
    $(".openbar-dropdown-folder").toggleClass('open');
  });
  $('body').on('click', function (e) {
    if (!$('.openbar-dropdown-menu').is(e.target)
        && $('.openbar-dropdown-menu').has(e.target).length === 0
        && $('.open').has(e.target).length === 0) {
          $('.openbar-dropdown').removeClass('open');
        }
  });
}

function set_followed_links_dropdown() {
  $('.openbar-dropdown-followed-links').on('click', function(event) {
    $(".openbar-dropdown-followed-links").toggleClass('open');
    console.log("clicked links");
  });
  set_review_actions();
}

function get_links_followed() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "http://localhost:8000/get_followed_links/", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      document.getElementById("links_followed").innerHTML = xhr.responseText;
      set_followed_links_dropdown();
    }
  }
  xhr.send();
}

function set_followable_links() {
  $(".followable-link").on('click', function(event) {
        $.ajax({
            url: "http://localhost:8000/follow_link/",
            data: {"query": $(this).data("query-id")},
            success: function(result) {
                $("#links_followed").html(result);
                set_followed_links_dropdown();
            }
        });
    });
}

function set_folder_manage_actions() {
  $('.action').on('click', function(event) {
    if ($(this).data('method') == 'remove_link') {
      remove_link($(this).data('query-id'), $(this).data('parent-id'))
    } else if ($(this).data('method') == 'save_link') {
      save_link($(this).data('query-id'), $(this).data('parent-id'))
    }
  });
}

function set_greeting() {
  $.ajax({
      url: "http://localhost:8000/greeting/",
      success: function(result) {
        $('#greeting').text(result);
      }
  });
}

function set_username() {
  $.ajax({
      url: "http://localhost:8000/username/",
      success: function(result) {
        $('#username').text(result);
      }
  });
}

function set_focus() {
  console.log($('#searchbar'))
  $('#searchbar').focus();
}

document.addEventListener('DOMContentLoaded', function() {
  set_tooltips();
  get_links_followed();
  set_click_handlers();
  get_user_complexity_score();
  get_folders();
  set_folder_dropdown();
  set_greeting();
  set_username();
  set_focus();
  document.getElementById("search-btn").addEventListener("click", search);
  document.getElementById("searchbar").addEventListener('keypress', function (e) {
      var key = e.which || e.keyCode;
      if (key === 13) { // 13 is enter
        search();
      }
  });
});
