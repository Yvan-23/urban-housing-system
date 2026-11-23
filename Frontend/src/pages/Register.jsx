import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../store/authSlice';
import { User, Mail, ShieldAlert, CheckCircle, KeyRound } from 'lucide-react';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Stakeholder');
  const [justification, setJustification] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !justification) {
      setError('Please fill in all input fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    dispatch(registerUser({ name, email, password, role }))
      .unwrap()
      .then(() => {
        setIsSubmitted(true);
      })
      .catch((err) => {
        setError(err || 'Registration failed. Please try again.');
      });
  };

  if (isSubmitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at bottom, #111827 0%, #030712 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div className="card-glass" style={{ width: '100%', maxWidth: '460px', padding: '36px', textAlign: 'center' }}>
          <CheckCircle size={56} style={{ color: 'var(--accent)', margin: '0 auto 20px auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
            Registration Successful!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
            Your account has been registered successfully. You can now log in using your credentials.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at bottom, #111827 0%, #030712 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="card-glass" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
            Register Platform Account
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Submit credentials and role requests for authorization.
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ background: 'var(--danger-glow)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                className="form-input"
                style={{ paddingLeft: '38px', width: '100%' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                id="email"
                type="email"
                placeholder="name@organization.org"
                className="form-input"
                style={{ paddingLeft: '38px', width: '100%' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '38px', width: '100%' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Requested System Role</label>
            <select
              id="role"
              className="form-input"
              style={{ width: '100%', background: 'var(--bg-secondary)', cursor: 'pointer' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Administrator">Administrator (IT Operations)</option>
              <option value="Urban Planner">Urban Planner (GIS & Planning)</option>
              <option value="Data Analyst">Data Analyst (ETL & Analytics)</option>
              <option value="Government Official">Government Official (Decisions)</option>
              <option value="Stakeholder">Stakeholder (External Observer)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="justification">Justification & Access Reason</label>
            <textarea
              id="justification"
              placeholder="Detail your department, project assignment, or authorization credentials..."
              className="form-input"
              style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Submit Registration Request
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log In</Link>
        </div>

      </div>
    </div>
  );
}

export default Register;
