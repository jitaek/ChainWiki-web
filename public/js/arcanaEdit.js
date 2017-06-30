var arcana = {};
var arcanaID;

window.onload = function() {
    setupCostSelection();
    setupRarityHover();
};

function setupCostSelection() {
    var costSelect = $('#cost');

    costSelect.append($('<option></option>').val(40).html(40));

    for (i=26;i>=0;i--){
        costSelect.append($('<option></option>').val(i).html(i))
    }
}

function setupRarityHover() {
    $('#rarity').hover(function() {
        $('#dropdownMenu').fadeIn(200);
    });
}

function selectRarity(rarity) {
    console.log(rarity);
    $('#rarity').val(rarity);
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

function validateArcana() {

    // validate arcana info from user input.
    console.log($('#nameKR').parsley().isValid());
    console.log($('#nameJP').parsley().isValid());

    // updateArcana();

}

function updateArcana() {

    // firebase.database().ref('test').child(arcanaID).update(arcana);

}