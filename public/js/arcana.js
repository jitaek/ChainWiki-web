/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var arcanaID;
var edit;
window.onload = function() {
  window.ChainWiki = new ChainWiki();
};

// Initializes ChainWiki.
function ChainWiki() {
  // Shortcuts to DOM Elements.
  this.arcanaList = document.getElementById('arcana');
  this.initFirebase();
  arcanaID = getParameterByName('arcana');
  edit = getParameterByName('edit');
  if (edit) {
    // set up edit UI
  }
  else {
      this.loadArcana();
  }
  if (location.hostname !== "localhost" && location.hostname != "172.91.86.210") {
    incrementViewCount();
  }
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
ChainWiki.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storageRef = firebase.storage().ref();
};

function incrementViewCount() {
  firebase.database().ref(`arcana/${arcanaID}/numberOfViews`).transaction(function(count) {
    if (count) {
      console.log('count was', count);
      count++;
    }
    return count;
  });

}

ChainWiki.prototype.loadArcana = function() {
  console.log(arcanaID);
  
  this.arcanaRef = this.database.ref(`arcana/${arcanaID}`);
  // Make sure we remove all previous listeners.
  this.arcanaRef.off();

  var setupImage = function(arcanaID) {
    this.loadImage(arcanaID);
  }.bind(this);

  var setupBaseInfo = function(val) {
    this.setupBaseInfo(val);
  }.bind(this);

  this.arcanaRef.once('value').then(function(snapshot) {

    const val = snapshot.val();
    const arcanaID = snapshot.key;
    document.title = val.nameKR;
    setupImage(arcanaID);
    setupBaseInfo(val);
  });
};

ChainWiki.prototype.setupBaseInfo = function(val) {

  var fullName;
  if (val.nicknameKR) {
    fullName = `${val.nicknameKR} ${val.nameKR}`;
  }
  else {
    fullName = val.nameKR;
  }
  document.getElementById('nameKR').innerHTML = fullName;
  document.getElementById('rarity').innerHTML = val.rarity;
  document.getElementById('group').innerHTML = val.class;
  document.getElementById('affiliation').innerHTML = val.affiliation;
  document.getElementById('cost').innerHTML = val.cost;
  document.getElementById('weapon').innerHTML = val.weapon;
  document.getElementById('tavern').innerHTML = val.tavern;

  document.getElementById('skillName1').innerHTML = val.skillName1;
  document.getElementById('skillMana1').innerHTML = val.skillMana1;
  document.getElementById('skillDesc1').innerHTML = val.skillDesc1;

  if (val.skillDesc2) {
    addSkill(val.skillName2, val.skillMana2, val.skillDesc2, 2);
  }

  if (val.skillDesc3) {
    addSkill(val.skillName3, val.skillMana3, val.skillDesc3, 3);
  }

  if (val.abilityDesc1) {
    addAbility(val.abilityName1, val.abilityDesc1, 1);
  }

  if (val.abilityDesc2) {
    addAbility(val.abilityName2, val.abilityDesc2, 2);
  }

  if (val.partyAbility) {
    addAbility(val.partyAbility, val.partyAbility, 3);
  }

  document.getElementById('kizunaName').innerHTML = val.kizunaName;
  document.getElementById('kizunaCost').innerHTML = val.kizunaCost;
  document.getElementById('kizunaDesc').innerHTML = val.kizunaDesc;

  var linkJP = 'https://チェインクロニクル.gamerch.com/';
  if (val.nicknameJP) {
    linkJP += val.nicknameJP
  }
  else if (val.nickNameJP) {
    linkJP += val.nickNameJP;
  }
  linkJP += val.nameJP;

  $('#wikiJPLink').attr('href', linkJP);
  $('#arcanaEditLink').attr('href', '/');

};

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function addSkill(skillName, skillMana, skillDesc, count) {

  // create the one row table.
    
    const table = document.createElement('table');
    table.setAttribute('class', 'arcanaSkillTable');

    const row = table.insertRow(0);

    const headerCell = document.createElement('th');
    headerCell.setAttribute('class', 'headerCell');

    const bodyCell = document.createElement('td');
    bodyCell.setAttribute('class', 'bodyCell');

    row.appendChild(headerCell);
    row.appendChild(bodyCell);

    const skillContainerView = document.createElement('div');
    // skillContainerView.setAttribute('class', 'container');
    
    const skillNameCell = document.createElement('div');
    skillNameCell.className = 'skillNameCell';
    skillNameCell.innerHTML = skillName;

    const skillManaLabelCell = document.createElement('div');
    skillManaLabelCell.className = 'manaLabelCell';
    skillManaLabelCell.innerHTML = '마나';

    const skillManaCell = document.createElement('div');
    skillManaCell.className = 'manaCell';
    skillManaCell.innerHTML = skillMana;

    bodyCell.appendChild(skillContainerView);
    skillContainerView.appendChild(skillNameCell);
    skillContainerView.appendChild(skillManaLabelCell);
    skillContainerView.appendChild(skillManaCell);

    // setup the skillDesc below the table
    const skillDescDiv = document.createElement('div');
    skillDescDiv.setAttribute('class', 'skillAbilityDescCell');
    skillDescDiv.innerHTML = skillDesc;

    var previousDiv;
    if (count == 2) {
      console.log('adding skill2');
      skillDescDiv.setAttribute('id', 'skillDesc2');
      headerCell.innerHTML = '스킬 2';      
      previousDiv = document.getElementById('skillDesc1');
    }
    else if (count == 3) {
      console.log('adding skill3');
      skillDescDiv.setAttribute('id', 'skillDesc3');
      headerCell.innerHTML = '스킬 3';
      previousDiv = document.getElementById('skillDesc2');
    }
    insertAfter(previousDiv, table);
    insertAfter(table, skillDescDiv);
}

function addAbility(abilityName, abilityDesc, type) {

    // create the one row table.
    const table = document.createElement('table');
    table.setAttribute('class', 'arcanaSkillTable');

    const row = table.insertRow(0);

    const headerCell = document.createElement('th');
    headerCell.setAttribute('class', 'headerCell');

    const bodyCell = document.createElement('td');
    bodyCell.setAttribute('class', 'bodyCell');
    bodyCell.innerHTML = abilityName;

    row.appendChild(headerCell);
    row.appendChild(bodyCell);

    // setup the abilityDesc below the table, if it's not partyAbility
    const abilityDescDiv = document.createElement('div');
    abilityDescDiv.setAttribute('class', 'skillAbilityDescCell');
    abilityDescDiv.innerHTML = abilityDesc;

    var previousDiv;
    if (type == 1) {
      // add ability1 div to page.
      console.log("adding ability1");
      headerCell.innerHTML = '어빌 1';

      // add after the last skill.
      if ($('#skillDesc3').length) {
        previousDiv = document.getElementById('skillDesc3');
      }
      else if ($('#skillDesc2').length) {
        previousDiv = document.getElementById('skillDesc2');
      }
      else {
        previousDiv = document.getElementById('skillDesc1');
      }

      abilityDescDiv.setAttribute('id', 'abilityDesc1');

    }
    else if (type == 2) {
      headerCell.innerHTML = '어빌 2';
      previousDiv = document.getElementById('abilityDesc1');
      abilityDescDiv.setAttribute('id', 'abilityDesc2');
    }
    else {
      headerCell.innerHTML = '파티 어빌';
      previousDiv = document.getElementById('abilityDesc2');
    }
    insertAfter(previousDiv, table);
    if (type != 3) {
      insertAfter(table, abilityDescDiv);
    }
}

ChainWiki.prototype.loadImage = function(arcanaID) {

  const arcanaImage = document.getElementById('arcanaImage');
  this.storageRef.child(`/image/arcana/${arcanaID}/main.jpg`).getDownloadURL().then(function(url) {
    arcanaImage.innerHTML = `<img data-original='${url}' class='arcanaImageMain' id='${arcanaID}_main'/>`;
    $('#' + `${arcanaID}_main`).lazyload({
      placeholder: '/images/placeholder.png',
      effect : 'fadeIn'
    });
  }).catch(function(error) {
    console.log("Image download error.");
  });
};

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
