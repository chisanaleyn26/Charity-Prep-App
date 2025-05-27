'use client';

export default function TestClient() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Client Component CSS Test</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-500 text-white p-4 rounded">Red Box</div>
        <div className="bg-green-500 text-white p-4 rounded">Green Box</div>
        <div className="bg-blue-500 text-white p-4 rounded">Blue Box</div>
      </div>
      
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90">
          Primary Button
        </button>
        <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:opacity-90">
          Secondary Button
        </button>
      </div>
      
      <div className="text-sm">
        <p className="text-gray-500">If you see colored boxes and styled buttons above, CSS is working!</p>
      </div>
    </div>
  );
}