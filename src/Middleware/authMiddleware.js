const { AuthenticationError } = require("apollo-server");
const { removeNullKeys, cloneObject } = require("../resolvers/helper/objectHelper");


async function getSubmitterProfile(context, args){
    return await context.prisma.query.profile({
        where:{
            gcID: args.gcID
        }
    },"{gcID, name, email, avatar, mobilePhone, officePhone, titleEn, titleFr, address{streetAddress, city, province, postalCode, country},team{id,organization{id},owner{gcID}}}");
}

const allowedToModifyProfile = async (resolve, root, args, context, info) => {

    // Only the profile owner or their current supervisor can modify a profile
    
    const submitter = getSubmitterProfile(context, args);
    if (args.gcID !== context.token.owner.gcID || context.token.owner.teamgcID !== submitter.gcID){
        throw new AuthenticationError("Must be owner or supervisor of profile to Modify");
    }
    return await resolve(root, args, context, info);
    
};

const allowedToModifyApproval = async (resolve, root, args, context, info) => {

    // Only current supervisor can modify Informational type and new supervisor can modify Membership type.

    // Approver on approval
    const approval = await context.prisma.query.approval(
        {
            where:{
                id: args.id
            }
        }, "{gcIDApprover{gcID}, gcIDSubmitter{gcID}, changeType}"
    );
    
    // Current supervisor
    const approvalSubject = await context.prisma.query.profile(
        {
            where:{
                gcID: approval.gcIDSubmitter.gcID
            }
        }, "{team:{owner:{gcID}}}"
    );

   if(approval.changeType === "Informational"){

        if(approvalSubject.team.owner){
            if(approvalSubject.team.owner.gcID !== context.token.owner.gcID){
                throw new AuthenticationError("Must be supervisor of user to modify Informational Approval");                   
            }
        }
        return await resolve(root, args, context, info);
    }

    if(approval.changeType === "Membership"){
        if(approval.gcIDApprover.gcID !== context.token.owner.gcID){
            throw new AuthenticationError("Must be supervisor of the team to accept transfer request");
        }
        return await resolve(root, args, context, info);
    }

    if(!context.token.owner.gcID === approval.gcIDApprover.gcID){
        throw new AuthenticationError("Must be Approver on Approval to modify");
    }

    return await resolve(root, args, context, info);
};

const mustbeAuthenticated = async (resolve, root, args, context, info) => {
    if (!context.token || !context.token.active){
        throw new AuthenticationError("Must be authenticaticated");
    }
    return await resolve(root, args, context, info);
};

module.exports={
    allowedToModifyProfile,
    allowedToModifyApproval,
    mustbeAuthenticated

};