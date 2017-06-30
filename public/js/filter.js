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

var arcanaArray = [];
var arcanaDictionary = {};
var initialLoad = true;
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
// this.arcanaRef.limitToLast(10).on('child_added', function(snapshot) {
  this.arcanaRef.on('child_added', function(snapshot) {
    insertArcanaData(snapshot);
    // if not initialload, insert row.
    // this.insertNewArcana(data);
    // this.insertCell(data, 0);
  });

// this.arcanaRef.limitToLast(10).once('value', function(snapshot) {
  this.arcanaRef.once('value', function(snapshot) {

    console.log("retrieved all arcana.");
    initialLoad = false;

    $('.loadingBox').fadeOut(function() {
      $('.loadingBox').remove();
      $('#filter').fadeIn();
    });
  });
};

function toggleFilter(button) {
  $('#filter').fadeToggle();
}

function filterArcana() {

  // first clear the table
  $('#arcana').empty();

  var raritySet = [];
  
  if (filterTypes['rarity'] !== undefined && filterTypes['rarity'].length > 0) {

    for (var i = 0; i < filterTypes['rarity'].length; i++) {
      for (var j = 0; j < arcanaArray.length; j++) {
        if (arcanaArray[j].val().rarity === filterTypes['rarity'][i]) {
          console.log(filterTypes['rarity'][i]);
          raritySet.push(arcanaArray[j]);
        }
      }
    }
  }

  var arcanaClassSet = [];

  if (filterTypes['class'] !== undefined && filterTypes['class'].length > 0) {

    for (var i = 0; i < filterTypes['class'].length; i++) {
      for (var j = 0; j < arcanaArray.length; j++) {
        if (arcanaArray[j].val().class === filterTypes['class'][i]) {
          console.log(filterTypes['class'][i]);
          arcanaClassSet.push(arcanaArray[j]);
        }
      }
    }
  }

  var weaponSet = [];

  if (filterTypes['weapon'] !== undefined && filterTypes['weapon'].length > 0) {

    for (var i = 0; i < filterTypes['weapon'].length; i++) {
      for (var j = 0; j < arcanaArray.length; j++) {
        if (arcanaArray[j].val().weapon === filterTypes['weapon'][i]) {
          console.log(filterTypes['weapon'][i]);
          weaponSet.push(arcanaArray[j]);
        }
      }
    }
  }

  var affiliationSet = [];

  if (filterTypes['affiliation'] !== undefined && filterTypes['affiliation'].length > 0) {

    for (var i = 0; i < filterTypes['affiliation'].length; i++) {
      for (var j = 0; j < arcanaArray.length; j++) {
        if (arcanaArray[j].val().affiliation === filterTypes['affiliation'][i]) {
          console.log(filterTypes['affiliation'][i]);
          affiliationSet.push(arcanaArray[j]);
        }
      }
    }
  }

  const combinedSets = [raritySet, arcanaClassSet, weaponSet, affiliationSet];
  var finalArray = [];

  for (var i = 0; i < combinedSets.length; i++) {

    // if (combinedSets[i].length > 0) {
      if (finalArray.length == 0) {
        // set up the first array
        if (combinedSets[i].length > 0) {
          finalArray = combinedSets[i];
          console.log(combinedSets[i].length);
        }
      }
      else {
        // already initialized, so combine
        if (combinedSets[i].length > 0) {
          finalArray = _.intersection(finalArray,combinedSets[i]);
        }
        
      }
    // }
  }

  // Now update the view with the filtered arcana.
  for (var i = 0; i < finalArray.length; i++) {
    insertCell(finalArray[i]);
  }
  
}

var filterTypes = {};

function updateFilter(cell) {

  // Set the cell to selected.
  const filter = $(cell).attr('id');
  console.log(filter);
  if ($(cell).hasClass('rarity')) {
    updateAttribute(filter, 'rarity');
  }
  else if ($(cell).hasClass('arcanaClass')) {
    updateAttribute(filter, 'class');
  }
  else if ($(cell).hasClass('weapon')) {
    updateAttribute(filter, 'weapon');
  }
  else if ($(cell).hasClass('affiliation')) {
    updateAttribute(filter, 'affiliation');
  }
  filterArcana();
}

function updateAttribute(id, filterType) {

  if (filterTypes[filterType] === undefined) {
      filterTypes[filterType] = [id];
      $('#' + id).removeClass('filterCell');
      $('#' + id).addClass('filterCellSelected');
  }
  else {
    // another rarity selected, check if the rarity already exists
    const index = filterTypes[filterType].indexOf(id);
    if (index > -1) {
      // in the array, remove this filter
      filterTypes[filterType].splice(index, 1);
      $('#' + id).removeClass('filterCellSelected');
      $('#' + id).addClass('filterCell');
    }
    else {
      // not in the array, so add this filter
      filterTypes[filterType].push(id);
      $('#' + id).addClass('filterCellSelected');
      $('#' + id).removeClass('filterCell');

    }
  }
  console.log(`filter type is ${filterType} and length is`,filterTypes[filterType].length)

}

function clearFilters() {
  filterTypes = {};
  const filterCells = $('#filterTable td')
  console.log(filterCells.length);
  for (var i = 0; i < filterCells.length; i++) {
    const id = filterCells[i].id;
    $('#' + id).removeClass('filterCellSelected');
    $('#' + id).addClass('filterCell');
  }
  filterArcana();
}

function insertCell(data) {

  // todo: find the previous <tr> with the previousIDkey? and INSERT at that point.
  const val = data.val();
  const arcanaID = data.key;
  const nameKR = val.nameKR;
  const nicknameKR = val.nicknameKR || val.nickNameKR;
  const nameJP = val.nameJP;
  const nicknameJP = val.nicknameJP || val.nickNameJP;

  // row is a <tr> element
  const arcanaTable = document.getElementById('arcana');
  const row = arcanaTable.insertRow(arcanaTable.rows.length);
  row.setAttribute('onclick', `location.href='/arcana?arcana=${arcanaID}'`);
  row.className = 'arcanaCell';
  row.setAttribute('id', arcanaID);

  var arcanaImageCell = document.createElement('td');
  arcanaImageCell.style.width = '66px';  
  arcanaImageCell.style.height = '66px';

  firebase.storage().ref().child(`/image/arcana/${arcanaID}/icon.jpg`).getDownloadURL().then(function(url) {
    arcanaImageCell.innerHTML = `<img data-original='${url}' class='arcanaImageIcon' id='${arcanaID}_icon'/>`;
    $('#' + `${arcanaID}_icon`).lazyload({
      placeholder: 'images/placeholder.png',
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

function insertArcanaData(data) {
    arcanaArray.splice(0, 0, data);
}

ChainWiki.prototype.insertNewArcana = function(data) {

  const val = data.val();
  // Insert into arcanaArray
  console.log(val.nameKR);
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
