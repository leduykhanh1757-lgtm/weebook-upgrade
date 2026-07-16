// ========== ORDER STATUS CONSTANTS ========== //
const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

const VALID_STATUSES = Object.values(ORDER_STATUS);

// Vietnamese labels for frontend display
const STATUS_LABELS = Object.freeze({
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
  [ORDER_STATUS.SHIPPED]: 'Đang giao',
  [ORDER_STATUS.COMPLETED]: 'Hoàn thành',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
});

module.exports = { ORDER_STATUS, VALID_STATUSES, STATUS_LABELS };
