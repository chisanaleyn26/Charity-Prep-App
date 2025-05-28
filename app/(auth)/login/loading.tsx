export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 animate-pulse">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-2">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2 mx-auto"></div>
              </div>
            </div>
            
            {/* Form skeleton */}
            <div className="space-y-4">
              {/* Label */}
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
              
              {/* Button */}
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
            </div>
            
            {/* Features skeleton */}
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer skeleton */}
            <div className="pt-4 border-t border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}