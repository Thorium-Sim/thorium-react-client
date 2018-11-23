import React from "react";

export default ({ flight, station, clientId, simulator }) => {
  return (
    <div>
      <h1>Connected to Thorium</h1>
      <h2>Client ID: {clientId}</h2>

      {flight && <h2>Flight: {flight.name}</h2>}
      {simulator && <h2>Simulator:{simulator.name}</h2>}
      {station && <h2>Station:{station.name}</h2>}
    </div>
  );
};
