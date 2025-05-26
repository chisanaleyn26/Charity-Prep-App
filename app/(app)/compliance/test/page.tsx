export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-primary mb-4">CSS Test Page</h1>
      <p className="text-muted-foreground mb-4">
        This page tests if Tailwind CSS is loading correctly.
      </p>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-primary text-primary-foreground p-4 rounded">Primary</div>
        <div className="bg-secondary text-secondary-foreground p-4 rounded">Secondary</div>
        <div className="bg-accent text-accent-foreground p-4 rounded">Accent</div>
      </div>
      <div className="mt-8 p-4 bg-muted rounded">
        <p className="text-muted-foreground">If you can see styled boxes above with different colors, CSS is working.</p>
      </div>
    </div>
  )
}