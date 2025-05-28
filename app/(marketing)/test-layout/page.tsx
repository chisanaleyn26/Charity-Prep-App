export default function TestLayoutPage() {
  return (
    <div className="min-h-screen p-8">
      <div style={{ backgroundColor: 'yellow', padding: '2rem', marginBottom: '2rem', border: '3px solid black' }}>
        <h1 style={{ fontSize: '2rem', color: 'black', marginBottom: '1rem' }}>
          Marketing Layout Test
        </h1>
        <p style={{ color: 'black' }}>
          This page is inside the (marketing) route group.
        </p>
        <p style={{ color: 'black' }}>
          It should have a header above and footer below from the marketing layout.
        </p>
      </div>
      
      <div style={{ backgroundColor: 'lightgreen', padding: '2rem', color: 'black' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          What you should see:
        </h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '2rem' }}>
          <li>Site header with logo and navigation at the top</li>
          <li>This content in the middle</li>
          <li>Site footer at the bottom</li>
        </ul>
      </div>
    </div>
  )
}