import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-red-500 mb-2">Oops!</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Something went wrong
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            We're sorry, but something unexpected happened. Please try
            refreshing the page or contact support if the problem persists.
          </p>

          <details className="text-left bg-gray-50 p-4 rounded border">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Error Details (for developers)
            </summary>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">
              {error?.statusText ||
                error?.message ||
                JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
