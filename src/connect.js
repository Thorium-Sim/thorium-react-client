import React, { Component } from "react";
import checkServerAddress from "./helpers/checkServerAddress";

export default class Connect extends Component {
  state = { address: "", checking: false };
  checkAddress = async () => {
    this.setState({ checking: true });
    const { address } = this.state;
    checkServerAddress(address)
      .then(finalAddress => {
        this.setState({ checking: false });
        if (!finalAddress) {
          window.alert(
            "Error accessing server",
            "No Thorium server exists at that address."
          );
          return;
        }
        const { address: otherAddress, port } = finalAddress;
        window.localStorage.setItem("@Thorium:serverAddress", otherAddress);
        this.props.connect(
          otherAddress,
          port
        );
      })
      .catch(err => {
        console.log("I caught an error.");
        console.log(err);
        this.setState({ checking: false });
      });
  };

  render() {
    const { checking } = this.state;
    return (
      <div>
        {checking ? (
          <h2>Checking Server Address...</h2>
        ) : (
          <div>
            <input
              value={this.state.address}
              onChange={e => this.setState({ address: e.target.value })}
            />
            <button onClick={this.checkAddress} color="#841584">
              Go
            </button>
          </div>
        )}
      </div>
    );
  }
}
