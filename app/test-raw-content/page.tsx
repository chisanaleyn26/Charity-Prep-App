export default function TestRawContentPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white',
      padding: '2rem',
      color: 'black'
    }}>
      <h1 style={{ fontSize: '3rem', color: 'red', marginBottom: '2rem' }}>
        TEST: Raw Content Page
      </h1>
      
      <div style={{ backgroundColor: 'yellow', padding: '2rem', marginBottom: '2rem', color: 'black' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          If you can see this yellow box, the page is rendering
        </h2>
        <p>This page uses inline styles to bypass any CSS issues.</p>
      </div>
      
      <div style={{ backgroundColor: 'lightblue', padding: '2rem', color: 'black' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Debug Information:
        </h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '2rem' }}>
          <li>This is at /test-raw-content</li>
          <li>No component imports</li>
          <li>No Tailwind classes</li>
          <li>Only inline styles</li>
        </ul>
      </div>
    </div>
  )
}