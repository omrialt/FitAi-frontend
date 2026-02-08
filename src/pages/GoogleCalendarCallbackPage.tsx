import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleCalendar } from '../hooks/useCalendar';

const GoogleCalendarCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useGoogleCalendar();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing Google Calendar connection...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('Failed to connect Google Calendar. Access was denied.');
      setTimeout(() => navigate('/calendar'), 3000);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('Missing authorization code.');
      setTimeout(() => navigate('/calendar'), 3000);
      return;
    }

    // Handle the OAuth callback
    handleCallback(code)
      .then(() => {
        setStatus('success');
        setMessage('Google Calendar connected successfully! Redirecting...');
        setTimeout(() => navigate('/calendar'), 2000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(`Failed to connect: ${err.message}`);
        setTimeout(() => navigate('/calendar'), 3000);
      });
  }, [searchParams, handleCallback, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
      }}>
        {status === 'processing' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h2>Connecting...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2>Success!</h2>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h2>Error</h2>
          </>
        )}
        <p style={{ color: '#666', marginTop: '16px' }}>{message}</p>
      </div>
    </div>
  );
};

export default GoogleCalendarCallbackPage;
