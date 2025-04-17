// client.js
const WebSocket = require('ws');

// Connect to the WebSocket server at the correct path
const socket = new WebSocket('ws://localhost:3000/chat');

socket.on('open', () => {
  console.log('Connected to WebSocket server');

  // Subscribe to a conversation
  const subscribeMessage = JSON.stringify({
    conversationId: 'my-convo-1',
    type: 'subscribe',
  });

  socket.send(subscribeMessage);
  console.log('Sent subscribe message:', subscribeMessage);
});

socket.on('message', (data) => {
  console.log('Received message from server:', data);
});

socket.on('close', () => {
  console.log('Disconnected from WebSocket server');
});

socket.on('error', (err) => {
  console.error('WebSocket error:', err);
});
