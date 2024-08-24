const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

let tcpSimulationInterval = null;
let udpSimulationInterval = null;

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.event === 'Start Simulation') {
      if (data.protocol === 'TCP') {
        startTCPSimulation(ws);
      } else if (data.protocol === 'UDP') {
        startUDPSimulation(ws);
      }
    } else if (data.event === 'Stop Simulation') {
      stopSimulation();
      ws.send(JSON.stringify({ event: 'Simulation Stopped', detail: 'The simulation has been stopped.' }));
    }
  });
});

function startTCPSimulation(ws) {
  const duration = 120000; // 2 minutes in milliseconds
  const interval = 3000; // Interval for sending events (every 3 seconds)
  let elapsed = 0;

  tcpSimulationInterval = setInterval(() => {
    if (elapsed >= duration) {
      clearInterval(tcpSimulationInterval);
      ws.send(JSON.stringify({ event: 'TCP Simulation Ended', detail: 'The TCP simulation has ended.' }));
      return;
    }

    simulateTCP(ws);
    elapsed += interval;
  }, interval);
}

function startUDPSimulation(ws) {
  const duration = 120000; // 2 minutes in milliseconds
  const interval = 3000; // Interval for sending events (every 3 seconds)
  let elapsed = 0;

  udpSimulationInterval = setInterval(() => {
    if (elapsed >= duration) {
      clearInterval(udpSimulationInterval);
      ws.send(JSON.stringify({ event: 'UDP Simulation Ended', detail: 'The UDP simulation has ended.' }));
      return;
    }

    simulateUDP(ws);
    elapsed += interval;
  }, interval);
}

function stopSimulation() {
  if (tcpSimulationInterval) {
    clearInterval(tcpSimulationInterval);
    tcpSimulationInterval = null;
  }

  if (udpSimulationInterval) {
    clearInterval(udpSimulationInterval);
    udpSimulationInterval = null;
  }
}

let congestionWindow = 1;

function simulateTCP(ws) {
  const isOutOfOrder = Math.random() < 0.2;
  ws.send(JSON.stringify({
    event: isOutOfOrder ? 'TCP Packet Out of Order' : 'TCP Packet Sent',
    detail: isOutOfOrder ? 'Out-of-order TCP packet sent' : 'TCP packet sent',
    concept: 'TCP ensures data arrives in the correct order. Out-of-order packets are reordered.'
  }));

  const ackReceived = Math.random() < 0.9;
  if (ackReceived) {
    setTimeout(() => {
      ws.send(JSON.stringify({
        event: 'ACK',
        detail: 'ACK received',
        concept: 'TCP uses acknowledgments to ensure reliable delivery.'
      }));
      if (isOutOfOrder) {
        setTimeout(() => ws.send(JSON.stringify({
          event: 'TCP Reordered',
          detail: 'TCP packet reordered',
          concept: 'TCP reorders out-of-order packets.'
        })), 1500);
      }
    }, 1500);
  } else {
    setTimeout(() => {
      ws.send(JSON.stringify({
        event: 'Retransmission',
        detail: 'Retransmitting TCP packet',
        concept: 'TCP retransmits lost packets to ensure delivery.'
      }));
      simulateTCP(ws);
    }, 3000);
  }

  if (Math.random() < 0.2) {
    congestionWindow = Math.max(1, congestionWindow / 2);
    ws.send(JSON.stringify({
      event: 'Congestion Control',
      detail: 'TCP reduces rate due to congestion',
      concept: 'TCP adjusts sending rate to handle network congestion.'
    }));
  } else {
    congestionWindow += 1;
  }
}

function simulateUDP(ws) {
  const packetLost = Math.random() < 0.3;
  if (packetLost) {
    ws.send(JSON.stringify({
      event: 'UDP Packet Lost',
      detail: 'UDP packet lost (no ACK)',
      concept: 'UDP does not guarantee packet delivery, leading to potential packet loss.'
    }));
  } else {
    ws.send(JSON.stringify({
      event: 'UDP Packet Sent',
      detail: 'UDP packet sent',
      concept: 'UDP sends packets without establishing a connection, which is faster but less reliable.'
    }));
  }
}

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});