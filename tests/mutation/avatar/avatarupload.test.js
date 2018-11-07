const {graphql} = require('graphql');
const {makeExecutableSchema} = require('graphql-tools');
const {processUpload} = require('../../../src/resolvers/File-Upload.js')
const fs = require('fs');

const temp_schema= `
  scalar Upload

  type File {
    id: ID!
    filename:String!
    path: String!
  }
  
  type Query {
    uploads: [File]
  }

  type Mutation {
    singleUpload (file: Upload!): File!
    multipleUpload (files: [Upload!]!): [File!]!
  }
`;

const resolvers = {
  Query: {
    uploads: () => db.get('uploads').value(),
  },
  Mutation: {
    singleUpload: (obj, { file }) => {return processUpload(file)},
    multipleUpload: (obj, { files }) => Promise.all(files.map(processUpload)),
  }
}

describe('Link avatar to profile', ()=>{
  it('Upload the picture to the image-server', async () =>{
    let schema = makeExecutableSchema({
      typeDefs: temp_schema,
      resolvers
    });


    var uploadedFile = uploadFile(__dirname + '/../../pictureconversion/pics/avatar.png', 'avatar.png');

    var query = `mutation($file:Upload!)
    {
      singleUpload(file:$file){filename}
    }`;

    await graphql(schema, query, null, null, {"file":uploadedFile}).then(async (result) => {
        var errors = result.errors
        console.error(errors)
    });
  })
})

function uploadFile(path, filename)
{
  var stream = fs.readFileSync(path);
  return {stream,
    filename,
    id:"something",
    mimetype:"image/jpg",
    encoding:"jpg"
  }
}