'use strict';
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

var lastArcanaIDKey;
var initialKnownKey;
var arcanaArray = [];
var arcanaDictionary = {};
var initialLoad = true;
var pages = 0;
// Initializes ChainWiki.
function ChainWiki() {

  this.arcanaList = document.getElementById('arcana');
  this.initFirebase();
  this.loadArcana();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
ChainWiki.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storageRef = firebase.storage().ref();
};

ChainWiki.prototype.loadArcana = function() {

  this.arcanaRef = this.database.ref('arcana');
  // Make sure we remove all previous listeners.
  this.arcanaRef.off();

  var count = 0;
  var addArcana = function(data) {
    if (count == 0) {
      lastArcanaIDKey = data.key;
    }
    else if (count == 9) {
      initialKnownKey = data.key;
    }
    count++;

    if (arcanaDictionary[data.key]) {
      // arcana exists, don't add it.
      return;
    }
    this.insertNewArcana(data);
    this.insertCell(data, 0);
    arcanaDictionary[data.key] = true;
  }.bind(this);

  var changeArcana = function(data) {
    updateCell(data);
  }.bind(this);

  var removeArcana = function(data) {
    delete arcanaDictionary[data.key];
    this.removeCell(data);
  }.bind(this);


  // Observe festival arcana.
  this.database.ref('festival').orderByValue().once('value', function(snapshot) {
    if (snapshot.exists()) {

      snapshot.forEach(function(child) {
        const arcanaID = child.key;

        firebase.database().ref('arcana').child(arcanaID).once('value').then(function(snapshot) {
           insertFestivalCell(snapshot);
        });

      });

      $('#festivalTable').fadeIn();

    }
  });

  // Observe recent arcana.
  this.arcanaRef.orderByKey().limitToLast(10).on('child_added', addArcana);
  this.arcanaRef.orderByKey().limitToFirst(10).once('value', function(snapshot) {

    initialLoad = false;
    $('.loadingBox').fadeOut(function() {
      $('.loadingBox').remove();
      $('#arcanaTable').fadeIn();
    });
  });

  // this.arcanaRef.orderByKey().limitToLast(10).on('child_changed', changeArcana);
  // this.arcanaRef.orderByKey().limitToLast(10).on('child_changed', updateArcana);
  // this.arcanaRef.orderByKey().limitToLast(10).on('child_removed', removeArcana);
};

function insertBefore(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode);
}

ChainWiki.prototype.fetchArcana = function() {

  this.arcanaRef = this.database.ref('arcana');

  var count = 0;
  var addArcana = function(data) {
    if (count == 0) {
      lastArcanaIDKey = data.key;
    }
    if (count < 10) {
      this.insertCell(data, pages);
      this.insertNewArcana(data);
    }
    count++;

    console.log(data.key);
  }.bind(this);
  pages = arcanaArray.length;
  this.arcanaRef.orderByKey().endAt(lastArcanaIDKey).limitToLast(11).on('child_added', addArcana);
};

function insertFestivalCell(data) {

  const val = data.val();
  const arcanaID = data.key;
  const nameKR = val.nameKR;
  const nicknameKR = val.nicknameKR || val.nickNameKR;
  const nameJP = val.nameJP;
  const nicknameJP = val.nicknameJP || val.nickNameJP;

  // row is a <tr> element
  // var row = document.getElementById('festival').insertRow(0);
  var row = document.createElement('tr');
  // row.setAttribute('data-href', '/arcana?arcana=${arcanaID}');
  row.setAttribute('onclick', `location.href='/arcana?arcana=${arcanaID}'`);
  row.className = 'arcanaCell';

  var arcanaImageCell = document.createElement('td');
  arcanaImageCell.style.width = '66px';  
  arcanaImageCell.style.height = '66px';

  firebase.storage().ref().child(`/image/arcana/${arcanaID}/icon.jpg`).getDownloadURL().then(function(url) {
    arcanaImageCell.innerHTML = `<img data-original='${url}' class='arcanaImageIcon' id='${arcanaID}_icon'/>`;
    $('#' + `${arcanaID}_icon`).lazyload({
      placeholder: 'images/logo.png',
      effect : 'fadeIn'
    });
  }).catch(function(error) {
    console.log("Image download error.");
    arcanaImageCell.innerHTML = `<img src='/images/logo.png' width='66' height='66'>`
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

  $("#festival").append(row);

}

ChainWiki.prototype.insertCell = function(data, index) {

  // todo: find the previous <tr> with the previousIDkey? and INSERT at that point.

  const val = data.val();
  const arcanaID = data.key;
  const nameKR = val.nameKR;
  const nicknameKR = val.nicknameKR || val.nickNameKR;
  const nameJP = val.nameJP;
  const nicknameJP = val.nicknameJP || val.nickNameJP;

  // row is a <tr> element
  var row = this.arcanaList.insertRow(index);
  row.setAttribute('onclick', `location.href='/arcana?arcana=${arcanaID}'`);
  row.className = 'arcanaCell';

  var arcanaImageCell = document.createElement('td');
  arcanaImageCell.style.width = '66px';  
  arcanaImageCell.style.height = '66px';

  this.storageRef.child(`/image/arcana/${arcanaID}/icon.jpg`).getDownloadURL().then(function(url) {
    arcanaImageCell.innerHTML = `<img data-original='${url}' class='arcanaImageIcon' id='${arcanaID}_icon'/>`;
    $('#' + `${arcanaID}_icon`).lazyload({
      placeholder: 'images/placeholder.png',
      effect : 'fadeIn'
    });
  }).catch(function(error) {
    console.log("Image download error.");
    arcanaImageCell.innerHTML = `<img src='/images/logo.png' width='66' height='66'>`
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

};

function updateCell(data) {
  
  const val = data.val();
  const arcanaID = data.key;
  // find the changed arcana's cell.
  const arcanaCell = $('#' + arcanaID);
}

function setupName(name, nickname, localization) {

  const nameContainerView = document.createElement('div');
  const nameLabel = document.createElement('span');
  nameLabel.innerHTML = name;
  if (localization == 'kr') {
    nameLabel.setAttribute('class', 'nameKRLabel');
    nameLabel.setAttribute('id', 'nameKR');
  }
  else {
    nameLabel.setAttribute('class', 'nameJPLabel');
    nameLabel.setAttribute('id', 'nameJP');
  }

  nameContainerView.appendChild(nameLabel);

  if (nickname) {

    const nicknameLabel = document.createElement('span');
    nicknameLabel.innerHTML = nickname;
    if (localization == 'kr') {
      nicknameLabel.setAttribute('class', 'nicknameKRLabel');
      nameLabel.setAttribute('id', 'nicknameKR');
    }
    else {
      nicknameLabel.setAttribute('class', 'nicknameJPLabel');
      nameLabel.setAttribute('id', 'nicknameJP');
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

ChainWiki.prototype.insertNewArcana = function(data) {

  const val = data.val();
  // Insert into arcanaArray
  const arcana = {
    arcanaID: data.key,
    nameKR: val.nameKR,
    nicknameKR: val.nicknameKR,
    nameJP: val.nameJP,
    nicknameJP: val.nicknameJP,
    rarity: val.rarity,
    class: val.class,
    affiliation: val.affiliation,
    cost: val.cost,
    weapon: val.weapon,
    tavern: val.tavern,

    skillName1: val.skillName1,
    skillMana1: val.skillMana1,
    skillDesc1: val.skillDesc1,
    skillName2: val.skillName2,
    skillMana2: val.skillMana2,
    skillDesc2: val.skillDesc2,
    skillName3: val.skillName3,
    skillMana3: val.skillMana3,
    skillDesc3: val.skillDesc3,

    abilityName1: val.abilityName1,
    abilityDesc1: val.abilityDesc1,
    abilityName2: val.abilityName2,
    abilityDesc2: val.abilityDesc2,
    partyAbility: val.partyAbility,
    
    kizunaName: val.kizunaName,
    kizunaCost: val.kizunaCost,
    kizunaDesc: val.kizunaDesc
  };

  arcanaArray.splice(0, 0, arcana);

};

function searchArcana() {
  const searchInput = document.getElementById('searchArcanaText').value;
  console.log("Searching for", searchInput);
  if (searchInput) {
      window.location.href = `/search?nameKR=${searchInput}`
  }
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

$(window).scroll(function() {
    if($(window).scrollTop() == $(document).height() - $(window).height()) {
        console.log("Scrolled to bottom...");
        window.ChainWiki.fetchArcana();
    }
});

$(document).ready(function(){
  console.log("READY");
    $('#searchArcanaText').keypress(function(e){
      console.log("PRESSED");
      if(e.keyCode==13) {
        searchArcana()
        return false;
      }
    });
});