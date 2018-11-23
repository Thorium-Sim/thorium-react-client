import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { ApolloLink, split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
import { onError } from "apollo-link-error";
import { WebSocketLink } from "apollo-link-ws";
import { Hermes } from "apollo-cache-hermes";
import randomWords from "random-words";

let clientId = localStorage.getItem("@Thorium:clientId");
if (!clientId) {
  clientId = randomWords(3).join("-");
  // Just to test out the webpack
  localStorage.setItem("@Thorium:clientId", clientId);
}

// Set up the client as a loose singleton pattern

let client;
export function clearClient() {
  client = null;
}

export function getClient(address, port) {
  try {
    if (client) {
      return client;
    }
    if (!address || !port) {
      return false;
    }
    const wsLink = new WebSocketLink({
      uri: `ws://${address}:${parseInt(port, 10) + 1}/subscriptions`,
      options: {
        reconnect: true
      },
      webSocketImpl: global.Websocket
    });

    const httpLink = ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.map(({ message, locations, path }) =>
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          );
        if (networkError) console.log(`[Network error]: ${networkError}`);
      }),
      new HttpLink({
        uri: `http://${address}:${parseInt(port, 10)}/graphql`,
        headers: { clientId },
        opts: {
          mode: "cors"
        }
      })
    ]);

    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === "OperationDefinition" && operation === "subscription";
      },
      wsLink,
      httpLink
    );

    const cache = new Hermes({
      entityIdForNode(node) {
        if (node.id && node.__typename && node.count) {
          return node.__typename + node.id + node.count;
        }
        if (node.id && node.__typename) {
          return node.__typename + node.id;
        }
        return null;
      }
    });

    client = new ApolloClient({
      link,
      cache
    });
    return client;
  } catch (err) {
    console.log("There was an error");
    console.log(err);
  }
}
