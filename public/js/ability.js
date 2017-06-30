/**
Setup list selection.
 */
'use strict';

var ability;
var abilityType;
var arcanaArray = [];
var arcanaName;
var initialLoad = true;

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

var ArcanaClass = {
  warrior: 'warrior',
  knight: 'knight',
  archer: 'archer',
  magician: 'magician',
  healer: 'healer',
};

$(document).ready(function(){

    // add listeners to the abilitytype
    document.getElementById("abilityType").addEventListener("click",function(e) {

        if ($(e.target).is('button')) {

          const abilityType = e.target.id;
          localStorage.setItem("abilityType", abilityType);
          
          // check if user already downloaded the other abilitylist. if so, just update the arcana to this abilityType.
          // change between ability and kizuna
          if (ability) {
            window.location.href = `/ability?ability=${ability}&type=${abilityType}`;
          }
        }
    });

    ability = getParameterByName('ability');
    abilityType = getParameterByName('type');

    if (ability && abilityType) {
      localStorage.setItem("class", "warrior");
      loadAbility();
    }
    else {
      $('#abilityList').fadeIn();
      // pre-select ability or kizuna

      // add listeners to the ability cells
      document.getElementById("abilityList").addEventListener("click",function(e) {
        if (e.target && e.target.nodeName == "LI") {
            localStorage.setItem("ability", e.target.id);
            // todo: select kizuna
            const ability = e.target.id;
            const abilityType = localStorage.getItem('abilityType')
            window.location.href = `/ability?ability=${ability}&type=${abilityType}`;
        }
      });    
      
    }
});

function loadAbility() {

  $('body').prepend(`<div class='loadingBox'><div class='loader'></div><div>아르카나 검색 중...</div>
    </div>`);

  initialLoad = false;
  const abilityRef = firebase.database().ref('ability').child(ability + abilityType);
  abilityRef.once('value').then(function(snapshot) {
      
      $('.loadingBox').fadeOut(function() {
        $('.loadingBox').remove();
        $('#abilityTab').fadeIn();
        $('#arcanaTable').fadeIn();
        $('#abilityList').hide();
        $('#warriorTab').focus();
      });

      selectTab('warrior');

      snapshot.forEach(function(child) {
        const arcanaID = child.key;

        firebase.database().ref('arcana').child(arcanaID).once('value').then(function(snapshot) {
            insertCell(snapshot, 0);
      });
    });
  });
}

function selectTab(abilityType) {

  // hide the previous arcanaClass
 const previousTable = localStorage.getItem('class');
 $('#' + previousTable).hide();

 // Show the selected arcanaClass
 localStorage.setItem("class", abilityType);
 $('#' + abilityType).fadeIn();

}

function getArcanaClass(arcanaClass) {

  switch (arcanaClass) {
    case "전사":
      return 'warrior';
    case "기사":
      return 'knight';
    case "궁수":
      return 'archer';
    case "법사":
      return 'magician';
    case "승려":
      return 'healer';
    default:
      console.log('arcanas class reached a default case');
  }
}

function insertCell(data, index) {

  // todo: find the previous <tr> with the previousIDkey? and INSERT at that point.
  const val = data.val();
  const arcanaID = data.key;
  const nameKR = val.nameKR;
  const nicknameKR = val.nicknameKR || val.nickNameKR;
  const nameJP = val.nameJP;
  const nicknameJP = val.nicknameJP || val.nickNameJP;

  const arcanaClass = getArcanaClass(val.class);
  // var row = document.getElementById(arcanaClass).insertRow(index);

  var row = document.createElement('tr');
  row.className = 'arcanaCell';
  row.setAttribute('onclick', `location.href='/arcana?arcana=${arcanaID}'`);
  
  var arcanaImageCell = document.createElement('td');
  arcanaImageCell.style.width = '66px';  
  arcanaImageCell.style.height = '66px';

  firebase.storage().ref().child(`/image/arcana/${arcanaID}/icon.jpg`).getDownloadURL().then(function(url) {
    arcanaImageCell.innerHTML = `<img data-original='${url}' class='arcanaImageIcon' id='${arcanaID}_icon'/>`;
    $('img.arcanaImageIcon').lazyload({
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

  document.getElementById(arcanaClass).appendChild(row);
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

function authListener() {
  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log('user is signed in');
    window.ChainWiki = new ChainWiki();
  } else {
    console.log('user is not signed in');
    firebase.auth().signInAnonymously().catch(function(error) {
      window.ChainWiki = new ChainWiki();
    });
  }
});
}

window.onload = function() {
  authListener()
};