const shortid = require("shortid");
const fs = require("fs");
const request = require("request");
const sharp = require("sharp");
const uploadDir = "./temp_convert";
const config = require("../config");
const dataURI = require('datauri').sync;


const storeUpload = async ({ stream, filename }) => {
  const id = shortid.generate();
  const path = `${uploadDir}/${id}-${filename}`;

  return new Promise((resolve, reject) =>
    stream
      .pipe(fs.createWriteStream(path))
      .on("finish", () => resolve(path))
      .on("error", reject),
  );
};

function deletePictureFromTempFolder(path){
  return new Promise((resolve, reject) => {
    var deletePath = String(path);
    if (fs.existsSync(deletePath, (err) => reject(err))){
      fs.unlinkSync(deletePath, (err) => reject(err));
    }
    resolve();
  });
}

const convertPicture = async (originPath) => {
  var destinationPath = `${originPath}.jpg`;
  // uploadPath = String(originPath);

  return new Promise((resolve, reject) => {
    sharp(originPath)
    .jpeg()
    .resize(config.image.size)
    .toFile(destinationPath)
    .then(function(){
      deletePictureFromTempFolder(originPath);
    })
    .then(function (err, info){
      if(err){
        reject(err);
      } else{
        resolve(destinationPath);
      }
    });
  });
};

const postImage = (path) => {
   return new Promise((resolve, reject) => {
    var filePath = String(path);
    const base64encoded = dataURI(filePath);

    request.post({
      url:     config.image.url,
      form: {
        "base64": base64encoded
      }
    }, function optionalCallback (err, httpResponse, body) {
      if (err) {
        reject();
      } else{
        var bodyJson = JSON.parse(body);
        var url = bodyJson.url;
        resolve(url);
      }
    });
   });
};

const createUploadFolderIfNeeded = async () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir);
    }
    resolve();
  });
};

const processUpload = async (upload) => {
  const { stream, filename } = await upload;
  await createUploadFolderIfNeeded();
  const originPath = await storeUpload({stream, filename});
  const avatarPath = await convertPicture(originPath);
  const url = await postImage(avatarPath);
  await deletePictureFromTempFolder(avatarPath);
  return url;
};

module.exports = {processUpload};