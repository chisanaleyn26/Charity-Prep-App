import HeroFixed from '@/components/marketing/hero-fixed'

export default function TestFixedHeroPage() {
  return (
    <>
      <div className="bg-red-500 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">DEBUG: Page is rendering - this is a red header</h1>
      </div>
      <HeroFixed />
      <div className="bg-blue-500 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">DEBUG: This is a blue footer</h1>
      </div>
    </>
  )
}