export default function TestTailwindPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">Tailwind CSS Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Colors Test</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-primary h-20 rounded flex items-center justify-center text-primary-foreground">Primary</div>
            <div className="bg-secondary h-20 rounded flex items-center justify-center text-secondary-foreground">Secondary</div>
            <div className="bg-accent h-20 rounded flex items-center justify-center text-accent-foreground">Accent</div>
            <div className="bg-destructive h-20 rounded flex items-center justify-center text-destructive-foreground">Destructive</div>
            <div className="bg-muted h-20 rounded flex items-center justify-center text-muted-foreground">Muted</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Typography Test</h2>
          <h1 className="text-6xl font-light">Heading 1</h1>
          <h2 className="text-4xl font-normal">Heading 2</h2>
          <h3 className="text-2xl font-medium">Heading 3</h3>
          <p className="text-base leading-relaxed mt-4">
            This is a paragraph with normal text. The Inter font should be applied with proper letter spacing.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Ethereal Colors</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-inchworm h-20 rounded flex items-center justify-center text-gunmetal">Inchworm</div>
            <div className="bg-gunmetal h-20 rounded flex items-center justify-center text-white">Gunmetal</div>
            <div className="bg-orange h-20 rounded flex items-center justify-center text-white">Orange</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Utility Classes</h2>
          <div className="space-y-4">
            <div className="p-4 border-2 border-border rounded">Border test</div>
            <div className="p-4 bg-card text-card-foreground rounded shadow-sm">Card test</div>
            <div className="p-4 bg-popover text-popover-foreground rounded">Popover test</div>
          </div>
        </div>
      </div>
    </div>
  )
}