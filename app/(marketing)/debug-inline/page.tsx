import HeroDebug from '@/components/marketing/hero-debug'

export default function DebugInlinePage() {
  return (
    <div>
      {/* Debug marker */}
      <div style={{ 
        backgroundColor: 'red', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        DEBUG PAGE - Everything uses inline styles
      </div>
      
      {/* Test basic Hero with inline styles */}
      <HeroDebug />
      
      {/* Test Features section with inline styles */}
      <section style={{ 
        padding: '8rem 1rem',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ 
          maxWidth: '1024px',
          margin: '0 auto'
        }}>
          <h2 style={{ 
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'black',
            textAlign: 'center',
            marginBottom: '4rem'
          }}>
            Software that actually helps
          </h2>
          
          <div style={{ 
            display: 'grid',
            gap: '2rem'
          }}>
            <div style={{ 
              borderLeft: '4px solid #22c55e',
              paddingLeft: '2rem'
            }}>
              <h3 style={{ 
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'black',
                marginBottom: '1rem'
              }}>
                Email Processing
              </h3>
              <p style={{ 
                fontSize: '1.125rem',
                color: '#4b5563'
              }}>
                Forward receipts to data@charityprep.uk and watch AI categorize everything automatically.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Debug marker */}
      <div style={{ 
        backgroundColor: 'green', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        END OF DEBUG PAGE - If you see this, rendering works
      </div>
    </div>
  )
}