export default function TestColorContrastPage() {
  return (
    <div className="min-h-screen p-8">
      {/* Test with explicit background colors */}
      <div className="space-y-4">
        <div className="bg-white p-4 border-2 border-black">
          <h2 className="text-2xl font-bold mb-2">White background tests:</h2>
          <p className="text-foreground">text-foreground on white</p>
          <p className="text-muted-foreground">text-muted-foreground on white</p>
          <p className="text-ethereal">text-ethereal on white</p>
          <p style={{ color: 'hsl(155, 20%, 18%)' }}>Direct HSL foreground color</p>
        </div>
        
        <div className="bg-gray-50 p-4 border-2 border-black">
          <h2 className="text-2xl font-bold mb-2">Gray-50 background tests:</h2>
          <p className="text-foreground">text-foreground on gray-50</p>
          <p className="text-muted-foreground">text-muted-foreground on gray-50</p>
          <p className="text-black">text-black on gray-50</p>
        </div>
        
        <div className="bg-gray-100 p-4 border-2 border-black">
          <h2 className="text-2xl font-bold mb-2">Gray-100 background tests:</h2>
          <p className="text-foreground">text-foreground on gray-100</p>
          <p className="text-muted-foreground">text-muted-foreground on gray-100</p>
          <p className="text-black">text-black on gray-100</p>
        </div>
        
        <div className="bg-background p-4 border-2 border-black">
          <h2 className="text-2xl font-bold mb-2">bg-background tests:</h2>
          <p className="text-foreground">text-foreground on bg-background</p>
          <p className="text-muted-foreground">text-muted-foreground on bg-background</p>
          <p className="text-black">text-black on bg-background</p>
        </div>
      </div>
      
      {/* Check computed styles */}
      <div className="mt-8 bg-yellow-100 p-4 border-2 border-black">
        <h2 className="text-2xl font-bold mb-2 text-black">CSS Variable Values:</h2>
        <div className="space-y-2 text-black">
          <p>Check browser DevTools → Computed Styles to see actual values of:</p>
          <ul className="list-disc list-inside">
            <li>--foreground: should be hsl(155, 20%, 18%)</li>
            <li>--background: should be hsl(0, 0%, 100%)</li>
            <li>--muted-foreground: should be hsl(215.4, 16.3%, 46.9%)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}