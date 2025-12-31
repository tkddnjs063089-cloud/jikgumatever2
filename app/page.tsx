export default function Home() {
  // 임시 데이터 - 나중에 실제 데이터로 교체
  const items = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `상품 ${i + 1}`,
  }));

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white"
          >
            <div className="aspect-square bg-gray-100 rounded mb-4 flex items-center justify-center">
              <span className="text-gray-400">이미지</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
