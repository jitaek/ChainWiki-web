// Handle case for first time login, or returning user.
'use strict';

var userID;
var username;

window.onload = function() {
  getUser()
};

function getUser() {

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      userID = user.userID;
      username = user.displayName;
      console.log('user is signed in');
      firebase.database().ref(`/users/${userID}`).once('value').then(snapshot => {
        if (snapshot.val() !== null) {
          // redirect
          console.log("OI");
          window.location.href = './index';
        }
        else {
          // ask user for name.
          console.log("showdisplay");
          showDisplayNameForm();
        }
      });

    } else {
      console.log('user is not signed in');

    }
  });
}

function redirectHome() {
  window.location.href = './index';
}

function showDisplayNameForm() {

  $('<div/>', {
      'html':`<div align='center'>안녕하세요, <b>${username}</b> 님! 이름을 그대로 사용할까요? 아르카나 수정할 때만 기록됩니다.</div>
      <div align='center' style='margin-top: 10px'><button type='button' onclick='redirectHome()'>${username}로 활동하기</button></div>`,
  }).appendTo('#container');

  $('<div/>', {
      'html':`<form>
      <div align='center'>아니면 다른 이름을 원하시나요?</div>
        <div class="row">
          <div class="u-full-width">
            <input class="u-full-width" type="email" placeholder="새로운 이름 입력" id="exampleEmailInput" style='margin-top:10px'>
          </div>
        </div>
        <input class="button-primary" type="submit" value="완료">
      </form>
      `,
  }).on('click', function(){
      alert(this.id); // myDiv
  }).appendTo('#container');


}

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function authListener() {
  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log('user is signed in');
  } else {
    console.log('user is not signed in');

  }
});
}