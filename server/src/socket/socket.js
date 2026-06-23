const onlineUsers = new Map();

let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const getSocketIO = () => ioInstance;

export const registerUserSocket = (userId, socketId) => {
  onlineUsers.set(userId.toString(), socketId);
};

export const removeUserSocket = (socketId) => {
  for (const [userId, sId] of onlineUsers.entries()) {
    if (sId === socketId) {
      onlineUsers.delete(userId);
      break;
    }
  }
};

export const getUserSocket = (userId) => {
  return onlineUsers.get(userId.toString());
};
