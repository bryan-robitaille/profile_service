// Handler for messages from different exchanges and keys
const { Prisma } = require("prisma-binding");
const { createProfile } = require("../resolvers/Mutations");
const {GraphQLError} = require("graphql");
const { publishMessageQueue } = require("./publisher_connector");
const config = require("../config");
const { getDefaults } = require("../resolvers/helper/default_setup");

var context = {
    prisma: new Prisma({
        typeDefs: "./src/generated/prisma.graphql",
        endpoint: config.prisma.host,
        debug: config.prisma.debug,
        secret: process.env.PRISMA_SERVICE_SECRET,
      }),
};

async function msgHandler(msg, success) {
    const messageBody = JSON.parse(msg.content.toString());
    context.defaults = await getDefaults();
    switch (msg.fields.routingKey){
        case "user.new":
            var args = {
                gcID: messageBody.gcID,
                name: messageBody.name,
                email: messageBody.email
            };
            try {
                await createProfile(null, args, context, "{gcID, name, email}");
                success(true);
            } catch(err){
                if (err instanceof GraphQLError){
                    let rejectMsg = {
                        args,
                        error: err
                    };
                    try{
                        await publishMessageQueue("errors", "profile.creation", rejectMsg);
                    } catch(err){
                        // eslint-disable-next-line no-console
                        console.error(err);
                    }
                    // The error has been handled and no longer need to be in queue
                    success(true);


                } else{
                    // If it's not a GraphQL Error then requeue it.
                    success(false);
                }
            }
            break;
        default:
            let rejectMsg = {
                msg: messageBody,
                key: msg.fields.routingKey,
                error: "No handler method available"
            };
            try {
                await publishMessageQueue("errors", "profile.noHandler", rejectMsg);
            } catch(err){
                // Could not forward error - will need to cache these
                // eslint-disable-next-line no-console
                console.error(err);
            }
            // eslint-disable-next-line no-console
            console.error("No handler method available - Default Policy : Drop to error");
            success(true);
            break;        
    }
}

module.exports = {
    msgHandler
};