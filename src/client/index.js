import React, { Component } from "react";
import { Query, withApollo } from "react-apollo";
import gql from "graphql-tag";
import randomWords from "random-words";
import SubscriptionHelper from "../helpers/subscriptionHelper";
import SimulatorData from "./simulatorData";

const queryData = `
id
flight {
  id
  name
  date
}
simulator {
  id
  name
}
station {
  name
}
`;

const QUERY = gql`
  query Client($clientId: ID!) {
    clients(clientId: $clientId) {
${queryData}
    }
  }
`;
const SUBSCRIPTION = gql`
  subscription ClientUpdate($clientId: ID!) {
    clientChanged(client: $clientId) {
${queryData}
    }
  }
`;

const availableCards = [];

class ClientData extends Component {
  constructor(props) {
    super(props);
    let clientId = localStorage.getItem("thorium_clientId");
    // Create a new clientID if there isn't one in localstorage
    if (!clientId) {
      clientId = randomWords(3).join("-");
      localStorage.setItem("thorium_clientId", clientId);
    }
    this.state = {
      clientId
    };
  }
  componentDidMount() {
    const { clientId } = this.state;
    const { client } = this.props;

    // Register the client for the first time.
    setTimeout(() => {
      client.mutate({
        mutation: gql`
          mutation RegisterClient($client: ID!, $cards: [String]) {
            clientConnect(client: $client, mobile: true, cards: $cards)
          }
        `,
        variables: { client: clientId, cards: availableCards }
      });
    }, 100);

    // Disconnect the client when the browser closes.
    window.onbeforeunload = () => {
      client.mutate({
        mutation: gql`
          mutation RemoveClient($id: ID!) {
            clientDisconnect(client: $id)
          }
        `,
        variables: { id: clientId }
      });
      return null;
    };
  }

  updateClientId = clientId => {
    const oldClientId = this.state.clientId;
    localStorage.setItem("thorium_clientId", clientId);
    this.setState({ clientId });
    this.props.client.mutate({
      mutation: gql`
        mutation RemoveClient($id: ID!) {
          clientDisconnect(client: $id)
        }
      `,
      variables: { id: oldClientId }
    });
    this.props.client
      .mutate({
        mutation: gql`
          mutation RegisterClient($client: ID!, $cards: [String]) {
            clientConnect(client: $client, mobile: true, cards: $cards)
          }
        `,
        variables: { client: clientId, cards: availableCards }
      })
      .then(() => {
        window.location.reload();
      });
  };

  render() {
    const { clientId } = this.state;
    if (!clientId) return null;

    return (
      <Query query={QUERY} variables={{ clientId }}>
        {({ loading, data, subscribeToMore }) => {
          const { clients } = data;
          if (loading || !clients) return null;
          const [client] = clients;
          return (
            <SubscriptionHelper
              subscribe={() =>
                subscribeToMore({
                  document: SUBSCRIPTION,
                  variables: { clientId },
                  updateQuery: (previousResult, { subscriptionData }) => {
                    return Object.assign({}, previousResult, {
                      clients: subscriptionData.data.clientChanged
                    });
                  }
                })
              }
            >
              {!client || !client.simulator || !client.station ? (
                <div>
                  <h1>Conected to Thorium</h1>
                  <h2>Awaiting Station Assignment</h2>
                  <h2>Client ID: {clientId}</h2>
                  {client && client.flight && (
                    <h2>Flight: {client.flight.name}</h2>
                  )}
                  {client && client.simulator && (
                    <h2>Simulator:{client.simulator.name}</h2>
                  )}
                  {client && client.station && (
                    <h2>Station:{client.station.name}</h2>
                  )}
                </div>
              ) : (
                <SimulatorData
                  {...this.props}
                  {...clients[0]}
                  clientId={clientId}
                  updateClientId={this.updateClientId}
                  client={clients[0]}
                />
              )}
            </SubscriptionHelper>
          );
        }}
      </Query>
    );
  }
}
export default withApollo(ClientData);
