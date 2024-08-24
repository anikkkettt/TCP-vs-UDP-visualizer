const ws = new WebSocket('ws://localhost:3000');

let tcpChart = new Chart(document.getElementById('tcpChart').getContext('2d'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'TCP Events',
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: false
    }, {
      label: 'Out of Order',
      data: [],
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 1,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: false
    }]
  },
  options: {
    animation: {
      duration: 1000,
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Rate of Packets'
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  }
});

let udpChart = new Chart(document.getElementById('udpChart').getContext('2d'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'UDP Events',
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: false
    }, {
      label: 'Lost Packets',
      data: [],
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: false
    }]
  },
  options: {
    animation: {
      duration: 1000,
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Rate of Packets'
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  }
});

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  const { event: eventName, detail, concept } = message;

  if (eventName.includes('TCP')) {
    tcpChart.data.labels.push(eventName);
    if (eventName === 'TCP Packet Out of Order') {
      tcpChart.data.datasets[1].data.push(Math.random() * 100);
      tcpChart.data.datasets[0].data.push(null);
    } else {
      tcpChart.data.datasets[0].data.push(Math.random() * 100);
      tcpChart.data.datasets[1].data.push(null);
    }
    tcpChart.update();
    displayConcept('tcpConcept', concept);
  } else if (eventName.includes('UDP')) {
    udpChart.data.labels.push(eventName);
    if (eventName === 'UDP Packet Lost') {
      udpChart.data.datasets[1].data.push(Math.random() * 100);
      udpChart.data.datasets[0].data.push(null);
    } else {
      udpChart.data.datasets[0].data.push(Math.random() * 100);
      udpChart.data.datasets[1].data.push(null);
    }
    udpChart.update();
    displayConcept('udpConcept', concept);
  }

  console.log(detail);
};

function displayConcept(elementId, concept) {
  const conceptElement = document.getElementById(elementId);
  conceptElement.textContent = concept;
  conceptElement.style.backgroundColor = '#ffeb3b';
  conceptElement.style.border = '2px solid #f44336';
  conceptElement.style.padding = '10px';
  conceptElement.style.borderRadius = '5px';
  conceptElement.style.fontWeight = 'bold';
  conceptElement.style.textAlign = 'center';
}

document.getElementById('startSimulation').addEventListener('click', () => {
  ws.send(JSON.stringify({ event: 'Start Simulation', protocol: 'TCP' }));
  ws.send(JSON.stringify({ event: 'Start Simulation', protocol: 'UDP' }));
});

document.getElementById('stopSimulation').addEventListener('click', () => {
  ws.send(JSON.stringify({ event: 'Stop Simulation' }));
});
