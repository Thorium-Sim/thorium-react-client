import React, { Component } from "react";
import { ApolloProvider } from "react-apollo";
import checkServerAddress from "./helpers/checkServerAddress";
import { getClient, clearClient } from "./helpers/graphqlClient";
import Client from "./client";
import Connect from "./connect";
class App extends Component {
  state = {
    connection: null
  };
  componentDidMount() {
    this.setConnection();
  }

  // If we aren't connected directly to Thorium's HTTP server, we have to
  // provide the server's IP address or hostname to properly connect.
  setConnection = (addr, prt) => {
    if (addr) {
      return this.createClient(addr, prt);
    }
    this.setState({ loading: true });
    const value = window.localStorage.getItem("@Thorium:serverAddress");
    if (!value) {
      this.setState({ loading: false });
      return;
    }
    checkServerAddress(value)
      .then(addressPort => {
        if (!addressPort) {
          return;
        }
        const { address, port } = addressPort;
        if (address) {
          this.createClient(address, port);
        } else {
          clearClient();
          this.client = null;
          this.setState({ connection: false, loading: false });
          localStorage.removeItem("@Thorium:serverAddress");
        }
      })
      .catch(err => console.log("error", err));
  };

  createClient = (address, port) => {
    this.client = getClient(address, port);
    this.setState({ connection: true, loading: false });
  };

  render() {
    const { connection, loading } = this.state;
    if (loading)
      return (
        <div
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black"
          }}
        >
          <h1>Connecting to server...</h1>
          <button onClick={() => this.setState({ loading: false })}>
            Abort
          </button>
        </div>
      );
    return connection ? (
      <ApolloProvider client={this.client}>
        <Client />
      </ApolloProvider>
    ) : (
      <div>
        <h1>Enter Thorium Server Address</h1>
        <Connect connect={this.setConnection} />
      </div>
    );
  }
}

export default App;
