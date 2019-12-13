require("dotenv").config();

const env = process.env.NODE_ENV; // 'development' or 'production'

// Get app basic config settings for Prisma
const appName = process.env.APP_NAME;
const prismaHost =  process.env.PRISMA_HOST;


// OpenID provider clientID and Secret
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// Message queue username and password
const mqUser = process.env.MQ_USER;
const mqPass = process.env.MQ_PASS;


const development = {
 app: {
   port: 4000,
   multicore: false,
   tracing: true
 },
 prisma: {
  host: prismaHost + "/" + appName + "/dev",
  debug: true
},
 image:{
   url:"http://localhost:8007/api/base64.php",
   format:"jpeg",
   size:300
 },
 rabbitMQ:{
   host:"localhost",
   user: mqUser,
   password: mqPass
 },
 openId:{
   url:"https://account.da-an.ca"
 },
 client:{
   id:clientId,
   secret:clientSecret
 },
 elastic:{
   host:"http://localhost:9200"
 }
};

const production = {
 app: {
   port: 4000,
   multicore: true,
   tracing: false
 },
 prisma: {
  host: prismaHost + "/" + appName + "/prod",
  debug: true
},
 image:{
  url:"http://avatar-quantum.ca-central-1.elasticbeanstalk.com/api/base64.php",
  format:"jpeg",
  size:300
},
rabbitMQ:{
  host:"b-ae6dfc13-1270-4853-989b-be2f853ae2a6-1.mq.ca-central-1.amazonaws.com",
  user: mqUser,
  password: mqPass
},
openId:{
  url:"https://account.da-an.ca"
},
client:{
  id:clientId,
  secret:clientSecret
},
elastic:{
  host:"http://localhost:9200"
}
};

const config = {
 development,
 production
};

module.exports = config[env];
