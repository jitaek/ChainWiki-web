/**
 * Copyright 2016 Google Inc. All Rights Reserved.
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

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const mkdirp = require('mkdirp-promise');
const gcs = require('@google-cloud/storage')();
const exec = require('child-process-promise').exec;
const LOCAL_TMP_FOLDER = '/tmp/';

exports.createUser = functions.auth.user().onCreate(event => {

  const user = event.data; // The Firebase user.
  const email = user.email; // The email of the user.
  const name = user.displayName; // The user's real name. Set automatically with login providers.

  // Set up initial user data.
  const userID = user.uid;
  console.log(userID);

  admin.database().ref(`/users/${userID}`).set({

    edit: true,
    editsCount: 0,
    email: email,
    joined: admin.database.ServerValue.TIMESTAMP,
    name: name

  });

  // sendWelcomeEmail(email, name);
  
});

function sendWelcomeEmail(email, displayName) {
  const mailOptions = {
    from: '"dtto" <noreply@firebase.com>',
    to: email
  };

  // The user unsubscribed to the newsletter.
  mailOptions.subject = `Welcome to ${APP_NAME}!`;
  mailOptions.text = `Hey ${displayName}!, Welcome to ${APP_NAME}. I hope you will enjoy our service.`;
  return mailTransport.sendMail(mailOptions).then(() => {
    console.log('New welcome email sent to:', email);
  });
}

exports.deleteUser = functions.auth.user().onDelete(event => {

  const user = event.data;
  const userID = user.uid;
  const email = user.email;
  const escapedEmail = email.replace(/\./g, ',');
  const name = user.displayName;  // TODO: name vs username.

  admin.database().ref(`/users/${userID}`).remove();
  // admin.database().ref(`/profiles/${userID}`).remove();
  // admin.database().ref(`/userEmails/${escapedEmail}`).remove();

  // TODO: Handle posts + comments

  // sendGoodbyEmail(email, name);

});

// exports.exportArcanaPreview = functions.database.ref('/loadFunction/{function}').onWrite(event => {
  
//   admin.database().ref(`/arcana`).once('value').then(snapshot => {

//     snapshot.forEach(function(child) {
//       const arcanaID = child.key;
      
//       admin.database().ref(`arcanaPreview/${arcanaID}`).set({

//         nameKR: child.val().nameKR,
//         nicknameKR: child.val().nicknameKR,
//         nameJP: child.val().nameJP,
//         nicknameJP: child.val().nicknameJP,

//         rarity: child.val().rarity,
//         class: child.val().class,
//         weapon: child.val().weapon,
//         affiliation: child.val().affiliation,

//         numberOfViews: child.val().numberOfViews,

//       })
          
//     });
//   });
// });

// If the arcana's name is changed, update /arcana/name
exports.updateArcanaName = functions.database.ref('/arcana/{arcanaID}/nicknameKR').onWrite(event => {
  const nicknameKR = event.data.val();
  const arcanaID = event.params.arcanaID;

  console.log(arcanaID);
  return admin.database().ref(`/arcana/${arcanaID}/nameKR`).once('value').then(snapshot => {
    const nameKR = snapshot.val();
    console.log(nicknameKR);
    console.log(nameKR);
    const fullName = nicknameKR + " " + nameKR;
    admin.database().ref(`/name/${arcanaID}`).set(fullName);
  });
});

// If the arcana is deleted, remove the arcana's name from /arcana/name
exports.removeArcanaName = functions.database.ref('/arcana/{arcanaID}').onWrite(event => {

  if (!event.data.exists()) {
    const arcanaID = event.params.arcanaID;
    return admin.database().ref(`/arcana/${arcanaID}`).remove();
  }
});

// exports.updateAllArcanaName = functions.database.ref('/loadFunction/{function}').onWrite(event => {
  
//   admin.database().ref(`/arcana`).once('value').then(snapshot => {

//     snapshot.forEach(function(child) {
//       const arcanaID = child.key;
//       // console.log(arcanaID);
//       var nicknameKR;
//       if (child.val().nicknameKR) {
//         nicknameKR = child.val().nicknameKR;
//       } else if (child.val().nickNameKR) {
//         nicknameKR = child.val().nickNameKR;
//       }

//       var nicknameJP;
//       if (child.val().nicknameJP) {
//         nicknameJP = child.val().nicknameJP;
//       } else if (child.val().nickNameJP) {
//         nicknameJP = child.val().nickNameJP;
//       }

//       if (nicknameKR) {
//         admin.database().ref(`/arcana/${arcanaID}/nicknameKR`).set(nicknameKR);
//         admin.database().ref(`/arcana/${arcanaID}/nickNameKR`).remove();

//       }
//       else {
//         console.log(`no nicknameKR for ${arcanaID}`);
//       }
//       if (nicknameJP) {
//         admin.database().ref(`/arcana/${arcanaID}/nicknameJP`).set(nicknameJP);
//         admin.database().ref(`/arcana/${arcanaID}/nickNameJP`).remove();
//       }
//       else {
//         console.log(`no nicknameJP for ${arcanaID}`);
//       }
          
//     });
//   });
// });


// exports.fixWhiteSpaces = functions.database.ref('/loadFunction/{function}').onWrite(event => {

//   admin.database().ref(`/arcana/-KTMPc7_EpiQgSGKpw9P`).once('value').then(snapshot => {

//       const arcanaID = snapshot.key;
//       console.log(arcanaID);
//       if (snapshot.val().skillDesc1) {
//         const testString = replaceString(snapshot.val().skillDesc1);
//         // admin.database().ref(`/arcana/${arcanaID}/skillDesc1`).set(replaceString);
//       }
//     snapshot.forEach(function(child) {
//       const arcanaID = child.key;
//       if (child.val().skillDesc1) {
//         const replaceString = replaceString(child.val().skillDesc1);
//         // admin.database().ref(`/arcana/${arcanaID}/skillDesc1`).set(replaceString);
//       }
      
//       if (child.val().skillDesc2) {
//         const replaceString = replaceString(child.val().skillDesc2);
//         admin.database().ref(`/arcana/${arcanaID}/skillDesc2`).set(replaceString);
//       }
//       if (child.val().skillDesc3) {
//         const replaceString = replaceString(child.val().skillDesc3);
//         admin.database().ref(`/arcana/${arcanaID}/skillDesc3`).set(replaceString);
//       }
//       if (child.val().abilityDesc1) {
//         const replaceString = replaceString(child.val().abilityDesc1);
//         admin.database().ref(`/arcana/${arcanaID}/abilityDesc1`).set(replaceString);
//       }
//       if (child.val().abilityDesc2) {
//         const replaceString = replaceString(child.val().abilityDesc2);
//         admin.database().ref(`/arcana/${arcanaID}/abilityDesc2`).set(replaceString);
//       }
//       if (child.val().kizunaDesc) {
//         const replaceString = replaceString(child.val().kizunaDesc);
//         admin.database().ref(`/arcana/${arcanaID}/kizunaDesc`).set(replaceString);
//       }
//     });
//   });
// });

function replaceString(string) {
  var fixNumberExp = /\d\s/g;
  console.log('replacing string...')

  var fixedString;

  while ((match = fixNumberExp.exec(string)) != null) {
    console.log("match found at " + match.index);
    fixedString = string.substr();
  }
  // var replacedString = string.replace('회복 량', '회복량');
  // replacedString = string.replace('넓어진 다', '넓어진다');
  // return replacedString;
  return "OI";
}

// File extension for the created JPEG files.
const JPEG_EXTENSION = 'jpg';

/**
 * When an image is uploaded in the Storage bucket it is converted to JPEG automatically using
 * ImageMagick.
 */

// exports.imageToJPG = functions.storage.object().onChange(event => {
//   const object = event.data;
//   const filePath = object.name;
//   const filePathSplit = filePath.split('/');
//   const fileName = filePathSplit.pop();
//   const fileNameSplit = fileName.split('.');
//   const fileExtension = fileNameSplit.pop();
//   const baseFileName = fileNameSplit.join('.');
//   const fileDir = filePathSplit.join('/') + (filePathSplit.length > 0 ? '/' : '');
//   const JPEGFilePath = `${fileDir}${baseFileName}.${JPEG_EXTENSION}`;//
//   const tempLocalDir = `${LOCAL_TMP_FOLDER}${fileDir}`;
//   const tempLocalFile = `${tempLocalDir}${fileName}`;//
//   const tempLocalJPEGFile = `${LOCAL_TMP_FOLDER}${JPEGFilePath}`;//

//   // Exit if this is triggered on a file that is not an image.
//   if (!object.contentType.startsWith('image/')) {
//     console.log('This is not an image.');
//     return;
//   }

//   // Exit if the image is already a JPEG.
//   if (object.contentType.startsWith('image/jpeg')) {
//     console.log('Already a JPEG.');
//     return;
//   }

//   // Exit if this is a move or deletion event.
//   if (object.resourceState === 'not_exists') {
//     console.log('This is a deletion event.');
//     return;
//   }

//   // Create the temp directory where the storage file will be downloaded.
//   return mkdirp(tempLocalDir).then(() => {
//     // Download file from bucket.
//     const bucket = gcs.bucket(object.bucket);
//     return bucket.file(filePath).download({
//       destination: tempLocalFile
//     }).then(() => {
//       console.log('The file has been downloaded to', tempLocalFile);
//       // Convert the image to JPEG using ImageMagick.
//       return exec(`convert "${tempLocalFile}" "${tempLocalJPEGFile}"`).then(() => {
//         console.log('JPEG image created at', tempLocalJPEGFile);
//         // Uploading the JPEG image.
//         return bucket.upload(tempLocalJPEGFile, {
//           destination: JPEGFilePath
//         }).then(() => {
//           console.log('JPEG image uploaded to Storage at', filePath);
//         });
//       });
//     });
//   });
// });