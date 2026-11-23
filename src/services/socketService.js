import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    const token = localStorage.getItem('urban_jwt_token');
    if (!token) return;

    this.socket = io('http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinWorkspace(workspaceId) {
    if (this.socket) {
      this.socket.emit('join_workspace', workspaceId);
    }
  }

  onNewComment(callback) {
    if (this.socket) {
      this.socket.on('new_comment', callback);
    }
  }

  offNewComment() {
    if (this.socket) {
      this.socket.off('new_comment');
    }
  }
}

export const socketService = new SocketService();
