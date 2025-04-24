// src/components/News/NewsLoading.tsx
const NewsLoading = () => {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex gap-3 animate-pulse">
          <div className="bg-gray-700 w-16 h-16 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="flex justify-between mt-2">
              <div className="h-3 bg-gray-700 rounded w-16"></div>
              <div className="h-3 bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsLoading;