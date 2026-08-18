import { Server } from 'socket.io';
import https from 'https';
import { constantFactory } from '../consts/const.js';
// SOCKETS
const createSocket = () => {
  const { CORS_OPTIONS } = constantFactory;
  let socket: Server;
  const setSocket = (apiServer: https.Server) => {
    socket = new Server(apiServer, CORS_OPTIONS);
  };
  const getSocket = () => socket;
  const socketEvents = () => {
    socket.on('connection', (connection) => {
      console.info('client connected: ', connection.id);
      connection.on('join', ({ userId }) => {
        connection.join(userId);
      });
      connection.on('disconnet', (socket) => {
        console.info('client disconnected: ', socket.id);
      });
      connection.on('connection_error', (err) => {
        console.info(err.message);
        console.info(err.context);
      });
    });
  };
  return { getSocket, setSocket, socketEvents };
};
export const socketFactory = createSocket();
