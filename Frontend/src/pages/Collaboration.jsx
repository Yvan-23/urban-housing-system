import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addComment, setActiveWorkspace, createWorkspace, fetchWorkspaces, fetchComments } from '../store/collaborationSlice';
import { MessageSquare, Users, FileText, Send, Plus, Upload, FolderSync } from 'lucide-react';

function Collaboration() {
  const dispatch = useDispatch();
  const { workspaces, comments, activeWorkspaceId } = useSelector((state) => state.collaboration);
  const { user } = useSelector((state) => state.auth);

  // Load workspaces and comments
  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchComments(activeWorkspaceId));
    }
  }, [dispatch, activeWorkspaceId]);

  // States
  const [commentText, setCommentText] = useState('');
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');

  // Active workspace info
  const activeWs = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || { name: 'No Active Board', description: 'Create or select a board to begin collaborating.' };

  // Filter comments for active workspace
  const workspaceComments = comments.filter(c => c.workspaceId === activeWorkspaceId);

  // Submit comment
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    dispatch(addComment({
      workspaceId: activeWorkspaceId,
      user: user?.name || 'Marcus Vance',
      role: user?.role || 'Urban Planner',
      text: commentText
    }));
    setCommentText('');
  };

  // Create new workspace
  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!newWsName || !newWsDesc) return;

    dispatch(createWorkspace({
      name: newWsName,
      description: newWsDesc,
      owner: user?.name || 'Administrator'
    }));

    setNewWsName('');
    setNewWsDesc('');
    setShowWorkspaceForm(false);
  };

  // Shared workspace files (future feature: upload real files)
  const mockFiles = [];

  return (
    <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Collaboration Workspace</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Structured boards for housing authorities, developers, NGOs, and district representatives to coordinate plans.
          </p>
        </div>
        <button onClick={() => setShowWorkspaceForm(!showWorkspaceForm)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          <Plus size={16} />
          {showWorkspaceForm ? 'Close panel' : 'New Board'}
        </button>
      </div>

      {/* Workspace Creation Panel */}
      {showWorkspaceForm && (
        <form onSubmit={handleCreateWorkspace} className="card-glass animated-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Workspace Board Name</label>
            <input
              type="text"
              placeholder="e.g. District C Planning Panel"
              className="form-input"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">Objectives / Description</label>
            <input
              type="text"
              placeholder="Detail planning board scope..."
              className="form-input"
              value={newWsDesc}
              onChange={(e) => setNewWsDesc(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ marginTop: 'auto', alignSelf: 'flex-end', padding: '8px 16px' }}>
              Create Board
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: '24px' }}>
        
        {/* Left Column: Workspaces Board List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: 'var(--primary)' }} />
              Active Coordination Boards
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => dispatch(setActiveWorkspace(ws.id))}
                  style={{
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: ws.id === activeWorkspaceId ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)',
                    borderColor: ws.id === activeWorkspaceId ? 'var(--primary)' : 'var(--border-color)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: ws.id === activeWorkspaceId ? 'white' : 'var(--text-primary)' }}>
                    {ws.name}
                  </strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.3 }}>
                    {ws.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                    <span>Owner: {ws.owner}</span>
                    <span>{ws.members} Members</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Shared Files Widget */}
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                Workspace Resources
              </h3>
              <button onClick={() => alert('Uploading mock file...')} style={{ color: 'var(--primary)', cursor: 'pointer' }}>
                <Upload size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mockFiles.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No files uploaded yet.</p>
              ) : mockFiles.map((file, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{file.name}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{file.size} | By {file.uploadedBy}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>{file.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Discussion Feed */}
        <div className="card-glass" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Active Discussion</span>
            <h3 style={{ fontSize: '1.2rem', marginTop: '6px', fontWeight: 700 }}>{activeWs.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>{activeWs.description}</p>
          </div>

          {/* Comment Messages viewport */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '340px', paddingRight: '6px' }}>
            {workspaceComments.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No posts in this workspace yet. Start the conversation below!
              </div>
            ) : (
              workspaceComments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                  
                  {/* Left avatar */}
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}>
                    {c.user.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{c.user}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', marginLeft: '8px', fontWeight: 500 }}>{c.role}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c.text}</p>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Typing Panel Form */}
          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <input
              type="text"
              placeholder={`Write feedback for the ${activeWs.name}...`}
              className="form-input"
              style={{ flex: 1, borderRadius: '24px' }}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', borderRadius: '50%' }}>
              <Send size={16} />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}

export default Collaboration;
