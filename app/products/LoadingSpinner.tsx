export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    </div>
  );
}
