# Thorium React Client

A demonstration of how a Thorium client connects to the Thorium server using
GraphQL.

## Running

First, start up [Thorium Server](https://thoriumsim.com).

Then, start up this client:

```
yarn
yarn run start
```

Then, assign it to a flight and simulator.

## Steps

1. The Thorium Server address is entered
2. The app checks to make sure the server address is valid.
   (`./helpers/checkServerAddress`)
3. It creates a GraphQL client and renders the main app.
   (`./helpers/graphqlClient`)
4. It queries and subscribes to information about the client, specifically the
   assigned flight, simulator, and station.
5. Once the flight, simulator, and (optionally) station are assigned, the main
   UI appears. The client can then subscribe to more specific information.

Assigning a station is optional. For example, an external client built with this
framework might only ever show a single screen or perform a single action. In
that case, it only needs access to the simulator data.

Additionally, if you want to configure this to allow the flight director to
choose between different screens, you can add those as a list of strings in
`availableCards` array in the `./client/index.js`. These cards are registered
with the client when the client registers for the first time.
