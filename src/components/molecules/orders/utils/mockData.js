// Mock Data Generator Functions

/**
 * Generate mock driver data for testing
 */
export function generateMockDriver(index, orderId) {
  const names = ["أحمد محمد", "سعيد علي", "عبدالله خالد", "فيصل حسن", "محمد عبدالعزيز"];
  const vehicles = ["سيارة صغيرة", "سيارة كبيرة", "فان", "بيك أب"];
  const phones = ["+966500123456", "+966501234567", "+966502345678", "+966503456789", "+966504567890"];
  
  return {
    id: `offer-${Date.now()}-${index}`,
    driver_id: `driver-${1000 + index}`,
    driver: {
      name: names[index % names.length],
      rating: (4.5 + Math.random() * 0.5).toFixed(1),
      completed_orders: Math.floor(1000 + Math.random() * 500),
      total_orders: Math.floor(1200 + Math.random() * 300),
      vehicle_type: vehicles[index % vehicles.length],
      phone: phones[index % phones.length]
    },
    delivery_duration_minutes: Math.floor(15 + Math.random() * 45),
    price: (50 + Math.random() * 150).toFixed(2),
    status: "pending",
    created_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    order_id: orderId
  };
}

