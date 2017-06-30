import React, { Component } from 'react';
import logo from './images/logo.png';
import './App.css';
import './skeleton.css';
import * as firebase from 'firebase';

var arcanaRef;
var storageRef;

var Localization = {
  kr: 'kr',
  jp: 'jp',
};

class App extends Component {

  constructor() {
    super();
    this.state = {
      arcanaArray: []
    };
  }

  componentWillMount() {
    this.arcanaRef = firebase.database().ref().child('arcana');
    this.storageRef = firebase.storage().ref();
    var arcanaArray = [];
    this.arcanaRef.limitToLast(3).on('child_added', snap => {
      
      let key = this.insertArcana(snap);
      arcanaArray.push(key);

      this.setState({
        arcanaArray: arcanaArray
      });

    });

  }

  insertArcana(snap) {

    const arcanaID = snap.key;
    const val = snap.val();
    const nameKR = val.nameKR;
    const nicknameKR = val.nicknameKR || val.nickNameKR;
    const nameJP = val.nameJP;
    const nicknameJP = val.nicknameJP || val.nickNameJP;

    const arcanaImageView = this.setupImage(arcanaID);
    const nameKRContainerView = this.setupName(nameKR, nicknameKR, Localization.kr);

    return (
      <div className='arcanaCell' key={arcanaID}>
        {arcanaImageView}
        {/*{nameKRContainerView}*/}
      </div>
    )

  }

  setupImage(arcanaID) {

    this.storageRef.child(`/image/arcana/${arcanaID}/icon.jpg`).getDownloadURL().then(function(url) {

      const arcanaImage = <span>OI</span>;
      return arcanaImage;
      // return (
      //   <div>
      //     "OII"
      //     <img className='arcanaImageIcon' src={url} key='{arcanaID}_icon' alt='arcanaImage'/>
      //   </div>
      // )
    });
  }

  setupName(name, nickname, localization) {

    const nameContainerView = <div></div>;
    const nameLabel = <span><b>{name}</b> {nickname}</span>;
    return nameLabel;
    // if (localization == 'kr') {
    //   nameLabel.setAttribute('class', 'nameKRLabel');
    //   nameLabel.setAttribute('id', 'nameKR');
    // }
    // else {
    //   nameLabel.setAttribute('class', 'nameJPLabel');
    //   nameLabel.setAttribute('id', 'nameJP');
    // }

    // nameContainerView.appendChild(nameLabel);

    // if (nickname) {

    //   const nicknameLabel = document.createElement('span');
    //   nicknameLabel.innerHTML = nickname;
    //   if (localization == 'kr') {
    //     nicknameLabel.setAttribute('class', 'nicknameKRLabel');
    //     nameLabel.setAttribute('id', 'nicknameKR');
    //   }
    //   else {
    //     nicknameLabel.setAttribute('class', 'nicknameJPLabel');
    //     nameLabel.setAttribute('id', 'nicknameJP');
    //   }
    //   nameContainerView.appendChild(nicknameLabel);
    // }

    // return nameContainerView;
  }

  render() {
    return (
      <div className='container u-full-width' style={{marginTop:'20px'}}>
        {this.state.arcanaArray}
      </div>
      // <div className="App">
      //   <h1>{this.state.keys[1]}</h1>
      // </div>
    );
  }
  

}

export default App;
