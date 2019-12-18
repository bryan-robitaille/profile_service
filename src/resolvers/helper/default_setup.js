const config = require("../../config");
const { Prisma } = require("prisma-binding");
const mutations = require("../Mutations");
const querys = require("../Query");

const ctx = {
    prisma: new Prisma({
        typeDefs: "./src/generated/prisma.graphql",
        endpoint: config.prisma.host,
        debug: config.prisma.debug,
        secret: process.env.PRISMA_SERVICE_SECRET,
    }) 
}; 

var defaultData = {};


async function createDefaultOrg() {

    // Create default organization

    const args = {
        data:{
            nameEn: "Global Organization",
            nameFr: "Organization Global",
            acronymEn: "DO",
            acronymFr: "OPD",
            teams:{
                create:{
                    nameEn:"Global Team",
                    nameFr:"Équipe Global"
                }
            }
        }
    };

    let org = await ctx.prisma.mutation.createOrganization(args, "{id, teams{id}}");
    
    return org;
            
}

async function getDefaults(){
    var org = await querys.organizations({},{nameEn:"Global Organization", nameFr:"Organization Global"}, ctx, "{id,teams{id}}");

    if (org.length < 1 ){
        defaultData.org = await createDefaultOrg();
    } else {
         defaultData.org = org[0];
    }   

    return defaultData;

    
}



module.exports = {
    getDefaults
};