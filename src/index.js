const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const {GraphQLEmail} = require('graphql-custom-types')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutations')
const config = require('./config')

const resolvers = {
  Query,
  Mutation,
  Email : GraphQLEmail
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false 
  },
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: './src/generated/prisma.graphql',
      endpoint: 'http://'+config.prisma.host+':4466/profile/',
      debug: config.prisma.debug,
    }),
  }),
})
const options = {
  port: 4000,
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/playground',
}
server.start(options,() => console.log(`GraphQL server is running on http://localhost:4000`))