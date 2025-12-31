'use client';

interface Order {
  id: number;
  orderDate: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  status: string;
}

interface OrderHistoryModalProps {
  onClose: () => void;
}

export default function OrderHistoryModal({ onClose }: OrderHistoryModalProps) {
  // 임시 주문 내역 데이터
  const orders: Order[] = [
    {
      id: 1,
      orderDate: '2024-01-15',
      items: [
        { name: '상품 1', quantity: 2, price: 15000 },
        { name: '상품 2', quantity: 1, price: 25000 },
      ],
      totalPrice: 55000,
      status: '배송 완료',
    },
    {
      id: 2,
      orderDate: '2024-01-10',
      items: [
        { name: '상품 3', quantity: 3, price: 30000 },
      ],
      totalPrice: 90000,
      status: '배송 중',
    },
    {
      id: 3,
      orderDate: '2024-01-05',
      items: [
        { name: '상품 1', quantity: 1, price: 15000 },
      ],
      totalPrice: 15000,
      status: '주문 완료',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case '배송 완료':
        return 'bg-green-100 text-green-800';
      case '배송 중':
        return 'bg-blue-100 text-blue-800';
      case '주문 완료':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">주문 내역</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* 주문 내역 리스트 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">주문일</p>
                    <p className="text-lg font-medium">{order.orderDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">주문 상태</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center mb-2">
                      <div className="flex-1">
                        <p className="text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">수량: {item.quantity}</p>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {(item.price * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">총 결제 금액</p>
                    <p className="text-xl font-bold text-gray-900">
                      {order.totalPrice.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

