/**
 Search for an arcana based on nameKR
 */
'use strict';

var arcanaArray = [];
var arcanaName;
var Localization = {
  kr: 'kr',
  jp: 'jp',
};

var ArcanaAttribute = {
  rarity: 'rarity',
  group: 'group',
  weapon: 'weapon',
  affiliation: 'affiliation',
  numberOfViews: 'numberOfViews',
};

window.onload = function() {
  window.ChainWiki = new ChainWiki();
};

// Initializes ChainWiki.
function ChainWiki() {

  this.arcanaList = document.getElementById('arcana');
  this.initFirebase();
  arcanaName = getParameterByName('nameKR');
  this.loadArcana();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
ChainWiki.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.nameRef = this.database.ref('name');
  this.arcanaRef = this.database.ref('arcana');
};

function searchArcana() {
  const searchInput = document.getElementById('searchArcanaText').value;
  console.log("Searching for", searchInput);
  if (searchInput) {
      window.location.href = `/search?nameKR=${searchInput}`
  }
}

ChainWiki.prototype.loadArcana = function() {

  if (arcanaName) {
    return this.nameRef.once('value').then(function(snapshot) {

      $('.loadingBox').fadeOut(function() {
        $('.loadingBox').remove();
        $('#arcanaTable').fadeIn();
      });
      
      var count = 0;
      snapshot.forEach(function(child) {

        var arcanaID = child.key;
        var nameKR = child.val();
        if (nameKR.includes(arcanaName)) {
          count++;
          firebase.database().ref('arcana').child(arcanaID).once('value').then(function(snapshot) {
            insertCell(snapshot, 0);
          });  
        }
      });

      // If we didn't find at least one match, alert the user.
      if (count == 0) {
          showTip()
      }
    });
  }
  
};

function showTip() {

  var row = document.getElementById('arcana').insertRow(0);
  const tip = document.createElement('div');
  tip.style.textAlign = 'center';
  tip.style.marginTop = '10px';
  tip.style.marginLeft = '10px';
  tip.innerHTML = "아르카나가 없어요 :(";
  row.appendChild(tip);
}

function insertCell(data, index) {

  // todo: find the previous <tr> with the previousIDkey? and INSERT at that point.
  const val = data.val();
  const arcanaID = data.key;
  const nameKR = val.nameKR;
  const nicknameKR = val.nicknameKR || val.nickNameKR;
  const nameJP = val.nameJP;
  const nicknameJP = val.nicknameJP || val.nickNameJP;

  // row is a <tr> element
  var row = document.getElementById('arcana').insertRow(index);
  row.className = 'arcanaCell';
  row.setAttribute('onclick', `location.href='/arcana?arcana=${arcanaID}'`);
  
  var arcanaImageCell = document.createElement('td');
  arcanaImageCell.style.width = '66px';  
  arcanaImageCell.style.height = '66px';

  firebase.storage().ref().child(`/image/arcana/${arcanaID}/icon.jpg`).getDownloadURL().then(function(url) {
    arcanaImageCell.innerHTML = `<img data-original='${url}' class='arcanaImageIcon' id='${arcanaID}_icon'/>`;
    $('#' + `${arcanaID}_icon`).lazyload({
      placeholder: '/images/placeholder.png',
      effect : 'fadeIn'
    });
  }).catch(function(error) {
    console.log("Image download error.");
  });

  var nameCell = document.createElement('td');
  nameCell.style.verticalAlign = 'top';

  const nameKRContainerView = setupName(nameKR, nicknameKR, Localization.kr);
  const nameJPContainerView = setupName(nameJP, nicknameJP, Localization.jp);
  const detailContainerView = setupDetail(val.rarity, val.class, val.weapon, val.affiliation, val.numberOfViews);

  nameCell.appendChild(nameKRContainerView);
  nameCell.appendChild(nameJPContainerView);
  nameCell.appendChild(detailContainerView);

  row.appendChild(arcanaImageCell);
  row.appendChild(nameCell);

}

function setupName(name, nickname, localization) {

  const nameContainerView = document.createElement('div');
  const nameLabel = document.createElement('span');
  nameLabel.innerHTML = name;
  if (localization == 'kr') {
    nameLabel.setAttribute('class', 'nameKRLabel');
  }
  else {
    nameLabel.setAttribute('class', 'nameJPLabel');
  }

  nameContainerView.appendChild(nameLabel);

  if (nickname) {

    const nicknameLabel = document.createElement('span');
    nicknameLabel.innerHTML = nickname;
    if (localization == 'kr') {
      nicknameLabel.setAttribute('class', 'nicknameKRLabel');
    }
    else {
      nicknameLabel.setAttribute('class', 'nicknameJPLabel');
    }
    nameContainerView.appendChild(nicknameLabel);
  }

  return nameContainerView;
}

function setupDetail(rarity, group, weapon, affiliation, numberOfViews) {

  const detailContainerView = document.createElement('div');

  const rarityLabel = createDetailLabel(rarity, ArcanaAttribute.rarity);
  const groupLabel = createDetailLabel(group, ArcanaAttribute.group);
  const weaponLabel = createDetailLabel(weapon, ArcanaAttribute.weapon);
  const affiliationLabel = createDetailLabel(affiliation, ArcanaAttribute.affiliation);
  const numberOfViewsLabel = createDetailLabel(numberOfViews, ArcanaAttribute.numberOfViews);

  detailContainerView.appendChild(rarityLabel);
  detailContainerView.appendChild(groupLabel);
  detailContainerView.appendChild(weaponLabel);
  detailContainerView.appendChild(affiliationLabel);
  detailContainerView.appendChild(numberOfViewsLabel);

  return detailContainerView;
}

function createDetailLabel(detail, arcanaAttribute) {

  const detailLabel = document.createElement('span');
  detailLabel.setAttribute('class', 'detailLabel');

  if (arcanaAttribute == "rarity") {
    detailLabel.innerHTML = '#' + detail + '성';
  }
  else if (arcanaAttribute == "numberOfViews") {
    detailLabel.innerHTML = '조회 ' + detail;
  }
  else {
    detailLabel.innerHTML = '#' + detail;
  }

  return detailLabel

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

$(document).ready(function(){

    $('#searchArcanaText').keypress(function(e){

      if(e.keyCode==13) {
        searchArcana()
        return false;
      }
    });
});