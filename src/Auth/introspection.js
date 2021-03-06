const fetch = require("node-fetch");
const config = require("../config");
const { Prisma } = require("prisma-binding");
const { throwExceptionIfProfileIsNotDefined } = require("../resolvers/helper/profileHelper");

async function getTokenOwner(tokenData){

  const prisma = await new Prisma({
    typeDefs: "./src/generated/prisma.graphql",
    endpoint: config.prisma.host,
    debug: config.prisma.debug,
    secret: process.env.PRISMA_SERVICE_SECRET,
  });

  try {
    tokenData.owner = await prisma.query.profile(
      {
          where: {
              gcID: tokenData.sub
          }            
      },"{gcID, name, email, team{id, owner{gcID}, organization{id}}}");
  } catch(e){
    throw new Error("Profile does not exist");
  }
    await throwExceptionIfProfileIsNotDefined(tokenData.owner);
    return tokenData;
}

async function verifyToken(request){

  var token;
  var tokenData;

  //see if token provided in request
  if(await request.req.headers.hasOwnProperty("authorization")){
    //remove "bearer" from token
    var splitReq = request.req.headers.authorization.split(" ");
    token = splitReq[1];
  } else {
    return false;
  }

  //base64 encode client_id:client_secret for authorization
  let auth = config.client.id + ":" + config.client.secret;
  let base64auth = Buffer.from(auth).toString("base64");

  const url = config.openId.url + "/openid/introspect/";
  const postOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + base64auth
    },
    body: "token=" + token
  };

  await fetch(url, postOptions)
  .then((response) => response.json())
  .then(function(data){ 
    tokenData = data;
  })
  .catch((error) => {
    const errorMsg = {
      "active": false,
      "message": error.message
    };
    tokenData = errorMsg;
  });

  if (tokenData.active){
    tokenData = await getTokenOwner(tokenData);
  }

  return tokenData;
}

module.exports = {
  verifyToken,
};
