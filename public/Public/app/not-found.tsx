import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#1a1a2e',
      color: '#ffffff',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Page not found</p>
      <Link href="/" style={{
        padding: '0.75rem 1.5rem',
        background: '#667eea',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        display: 'inline-block'
      }}>
        Return Home
      </Link>
    </div>
  );
}
