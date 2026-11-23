import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare, Users, Calendar, Plus, Search, MoreVertical,
  CheckCircle2, Clock, Paperclip, Send, Video, Hash, Star, Lock, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import { socketService } from '../services/socketService';
import api from '../services/api';

const Collaboration = () => {
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const [channels, setChannels]           = useState([]);
  const [tasks, setTasks]                 = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [chatMessages, setChatMessages]   = useState({});
  const [message, setMessage]             = useState('');
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingTasks, setLoadingTasks]   = useState(true);
  const [error, setError]                 = useState(null);
  const messagesEndRef = useRef(null);

  // ─── Load channels (workspaces) and tasks ──────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, tRes] = await Promise.all([
          api.get('/collaboration/workspaces'),
          api.get('/collaboration/tasks'),
        ]);
        const workspaces = wRes.data?.data || [];
        setChannels(workspaces);
        if (workspaces.length > 0) setActiveChannelId(workspaces[0].id);
        setTasks(tRes.data?.data || []);
      } catch (err) {
        setError('Failed to load collaboration data.');
        console.error(err);
      } finally {
        setLoadingChannels(false);
        setLoadingTasks(false);
      }
    };
    fetchData();
  }, []);

  // ─── Load messages when channel changes ────────────────────────────────────
  useEffect(() => {
    if (!activeChannelId) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await api.get(`/collaboration/workspaces/${activeChannelId}/messages`);
        const msgs = (res.data?.data || []).map(m => ({
          id: m.id,
          user: m.authorName || m.author?.name || 'Unknown',
          initial: (m.authorName || m.author?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
          color: 'bg-primary-100 text-primary-700',
          time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          text: m.content,
          isMe: m.authorId === user?.id || m.author?.id === user?.id,
        }));
        setChatMessages(prev => ({ ...prev, [activeChannelId]: msgs }));
      } catch {
        // Messages endpoint may not exist yet — start with empty
        setChatMessages(prev => ({ ...prev, [activeChannelId]: prev[activeChannelId] || [] }));
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [activeChannelId]);

  // ─── WebSocket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeChannelId) return;
    socketService.connect();
    socketService.joinWorkspace(activeChannelId);
    socketService.onNewComment((comment) => {
      const newMsg = {
        id: comment.id || Date.now(),
        user: comment.authorName || 'User',
        initial: (comment.authorName || 'U')[0].toUpperCase(),
        color: 'bg-primary-100 text-primary-700',
        time: new Date(comment.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: comment.content,
        isMe: false,
      };
      setChatMessages(prev => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
      }));
    });
    return () => {
      socketService.offNewComment();
      socketService.disconnect();
    };
  }, [activeChannelId]);

  // ─── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChannelId]);

  // ─── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await api.post('/collaboration/comments', {
        content: message,
        targetType: 'Workspace',
        targetId: activeChannelId,
      });
      const newMsg = {
        id: Date.now(),
        user: user?.name || 'You',
        initial: (user?.name || 'Y').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        color: 'bg-secondary-900 text-white',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: message,
        isMe: true,
      };
      setChatMessages(prev => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
      }));
      setMessage('');
    } catch {
      showNotification('Failed to send message.', 'error');
    }
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6">
      {/* Channels Sidebar */}
      <div className="w-72 shrink-0 flex flex-col gap-6 h-full overflow-y-auto pr-1">
        <div className="card !p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Channels</h3>
            <button
              onClick={() => showNotification('Channel creation module activated.', 'info')}
              className="p-1 hover:bg-secondary-100 rounded-md active:scale-90"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1 flex-1 overflow-y-auto">
            {loadingChannels ? (
              Array(4).fill(null).map((_, i) => (
                <div key={i} className="h-10 bg-secondary-100 dark:bg-secondary-800 rounded-xl animate-pulse mb-2" />
              ))
            ) : channels.length === 0 ? (
              <p className="text-xs text-secondary-400 text-center py-4">No channels yet.</p>
            ) : (
              channels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChannelId(c.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                    activeChannelId === c.id
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'hover:bg-secondary-50 text-secondary-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Hash size={16} className={activeChannelId === c.id ? 'text-primary-500' : 'text-secondary-400'} />
                    <span className="text-sm truncate w-32 text-left">{c.name}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Direct Messages — show other users */}
          <div className="mt-8">
            <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-4">Direct Messages</h3>
            <div className="space-y-4">
              {loadingChannels ? (
                Array(3).fill(null).map((_, i) => (
                  <div key={i} className="h-8 bg-secondary-100 dark:bg-secondary-800 rounded-lg animate-pulse" />
                ))
              ) : channels.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => showNotification(`Opening private chat for ${c.name}`, 'info')}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-200 dark:bg-secondary-700 flex items-center justify-center text-[10px] font-bold">
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm text-secondary-600 dark:text-secondary-400 group-hover:text-primary-600 transition-colors truncate w-28">{c.name}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-secondary-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col card !p-0 overflow-hidden shadow-2xl">
        {/* Chat Header */}
        <div className="p-4 border-b border-secondary-100 dark:border-secondary-800 flex justify-between items-center bg-white dark:bg-secondary-900 sticky top-0 z-10">
          {activeChannel ? (
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600">
                <Hash size={20} />
              </div>
              <div>
                <h3 className="font-bold text-secondary-900 dark:text-white">{activeChannel.name}</h3>
                <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-wider">
                  {activeChannel.description || 'Workspace channel'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-secondary-400 text-sm">Select a channel</div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => showNotification('Initializing secure video bridge…', 'info')} className="p-2 hover:bg-secondary-100 rounded-lg text-secondary-500">
              <Video size={20} />
            </button>
            <button onClick={() => showNotification('Opening shared file repository.', 'info')} className="p-2 hover:bg-secondary-100 rounded-lg text-secondary-500">
              <Paperclip size={20} />
            </button>
            <button className="p-2 hover:bg-secondary-100 rounded-lg text-secondary-500">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-secondary-50/30 dark:bg-transparent">
          {loadingMessages ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
          ) : !activeChannelId ? (
            <div className="flex flex-col items-center justify-center h-full text-secondary-400 gap-2">
              <MessageSquare size={40} className="opacity-20" />
              <p className="text-sm">Select a channel to start messaging.</p>
            </div>
          ) : (chatMessages[activeChannelId] || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-secondary-400 gap-2">
              <MessageSquare size={40} className="opacity-20" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            (chatMessages[activeChannelId] || []).map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${msg.color}`}>
                  {msg.initial}
                </div>
                <div className={`space-y-1 ${msg.isMe ? 'items-end flex flex-col' : ''}`}>
                  <div className="flex items-center gap-2">
                    {!msg.isMe && <span className="font-bold text-sm">{msg.user}</span>}
                    <span className="text-[10px] text-secondary-400">{msg.time}</span>
                    {msg.isMe && <span className="font-bold text-sm">You</span>}
                  </div>
                  <div className={`p-4 rounded-2xl border ${
                    msg.isMe
                      ? 'bg-primary-600 text-white rounded-tr-none shadow-lg shadow-primary-500/20 border-primary-500'
                      : 'bg-white dark:bg-secondary-800 rounded-tl-none border-secondary-100 dark:border-secondary-700 max-w-lg'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-secondary-900 border-t border-secondary-100 dark:border-secondary-800">
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={activeChannel ? `Message #${activeChannel.name}…` : 'Select a channel first…'}
              disabled={!activeChannelId}
              className="w-full pl-4 pr-12 py-4 bg-secondary-50 dark:bg-secondary-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!message.trim() || !activeChannelId}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 active:scale-90 transition-all disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Tasks Sidebar */}
      <div className="w-80 shrink-0 flex flex-col gap-6 h-full">
        <div className="card !p-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest">
              Shared Tasks {!loadingTasks && `(${tasks.length})`}
            </h3>
            <button onClick={() => showNotification('Task allocation board opened.', 'info')} className="p-1 hover:bg-secondary-100 rounded-md active:scale-90">
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[400px]">
            {loadingTasks ? (
              Array(3).fill(null).map((_, i) => (
                <div key={i} className="h-16 bg-secondary-100 dark:bg-secondary-800 rounded-xl animate-pulse" />
              ))
            ) : tasks.length === 0 ? (
              <p className="text-xs text-secondary-400 text-center py-4">No tasks assigned yet.</p>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => showNotification(`Task: ${t.title}`, 'info')}
                  className="p-3 rounded-xl border border-secondary-100 dark:border-secondary-800 hover:border-primary-500/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`text-xs font-bold ${t.status === 'Done' ? 'line-through text-secondary-400' : 'group-hover:text-primary-600'}`}>
                      {t.title}
                    </h4>
                    {t.status === 'Done'
                      ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      : <Clock size={14} className="text-amber-500 shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 bg-secondary-100 dark:bg-secondary-700 rounded-md font-bold">
                      {t.assignedTo?.name || 'Unassigned'}
                    </span>
                    <span className="text-secondary-400">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card !p-4 bg-secondary-900 text-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-3 mb-4">
            <Star size={18} className="text-amber-400" />
            <h3 className="font-bold text-sm">System Tip</h3>
          </div>
          <p className="text-xs text-secondary-400 leading-relaxed">
            Mention team members with <span className="text-primary-400">@name</span> to trigger priority system notifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Collaboration;
