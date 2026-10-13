import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Eye,
  MessageCircle,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  X,
  User,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { formatPrice, formatDate } from '../../utils/formatters';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (activeOrder && activeOrder.id === orderId) {
        setActiveOrder(updated);
      }
    } catch (e) {
      alert('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === 'all') return true;
    return o.status === selectedStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    }
  };

  const handleWhatsAppCustomer = (order: Order) => {
    const cleanNumber = order.customer.phone.replace(/[^0-9]/g, '');
    const msg = `Hello ${order.customer.fullName}! This is HHD Collections regarding your order ${order.orderNumber} for total Rs. ${order.total.toLocaleString()}. Your order is currently: ${order.status.toUpperCase()}.`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
            Customer Orders & Enquiries
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Review placed orders, customer delivery addresses, and manage dispatch status
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 text-xs text-charcoal-800 dark:text-charcoal-200 font-semibold"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-400">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-400">
            No orders found under this status.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-50 dark:bg-charcoal-800/60 border-b border-charcoal-200 dark:border-charcoal-800 text-charcoal-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order Ref</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">City</th>
                  <th className="py-3 px-4 font-semibold">Items</th>
                  <th className="py-3 px-4 font-semibold">Total</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-charcoal-50/50 dark:hover:bg-charcoal-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-charcoal-900 dark:text-white">
                      {order.orderNumber}
                      <span className="block text-[10px] text-charcoal-400 font-sans font-normal">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-charcoal-900 dark:text-white">
                        {order.customer.fullName}
                      </div>
                      <span className="text-[11px] text-charcoal-400 block">
                        {order.customer.phone}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-charcoal-600 dark:text-charcoal-300">
                      {order.customer.city}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-charcoal-800 dark:text-charcoal-200">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-charcoal-900 dark:text-white">
                      {formatPrice(order.total)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border-0 cursor-pointer ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleWhatsAppCustomer(order)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                          title="Message customer on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveOrder(order)}
                          className="p-1.5 rounded-lg text-charcoal-600 dark:text-charcoal-300 hover:text-brand-500 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-100 dark:border-charcoal-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 block">
                  Order Details
                </span>
                <h3 className="font-serif text-xl font-bold text-charcoal-900 dark:text-white">
                  Ref: {activeOrder.orderNumber}
                </h3>
              </div>
              <button onClick={() => setActiveOrder(null)}>
                <X className="w-5 h-5 text-charcoal-400 hover:text-charcoal-700" />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="p-4 rounded-2xl bg-charcoal-50 dark:bg-charcoal-800/50 space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-brand-500" />
                <span className="font-bold text-charcoal-900 dark:text-white">
                  {activeOrder.customer.fullName} ({activeOrder.customer.phone})
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-600 dark:text-charcoal-300">
                  {activeOrder.customer.address}, {activeOrder.customer.city},{' '}
                  {activeOrder.customer.province}
                </span>
              </div>
              {activeOrder.customer.notes && (
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px]">
                  <strong>Notes:</strong> {activeOrder.customer.notes}
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
                Purchased Items ({activeOrder.items.length})
              </h4>
              <div className="space-y-2">
                {activeOrder.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-charcoal-100 dark:border-charcoal-800 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={it.image}
                        alt={it.productName}
                        className="w-10 h-10 rounded-lg object-cover bg-charcoal-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = './assets/logo.png';
                        }}
                      />
                      <div>
                        <span className="font-semibold text-charcoal-900 dark:text-white block line-clamp-1">
                          {it.productName}
                        </span>
                        <span className="text-[11px] text-charcoal-400">Qty: {it.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-charcoal-900 dark:text-white">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-2xl bg-charcoal-50 dark:bg-charcoal-800/50 space-y-1.5 text-xs">
              <div className="flex justify-between text-charcoal-500">
                <span>Subtotal</span>
                <span>{formatPrice(activeOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal-500">
                <span>Shipping</span>
                <span>{formatPrice(activeOrder.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-charcoal-900 dark:text-white pt-2 border-t border-charcoal-200 dark:border-charcoal-700">
                <span>Grand Total</span>
                <span className="font-serif text-brand-600 dark:text-brand-400">
                  {formatPrice(activeOrder.total)}
                </span>
              </div>
            </div>

            {/* Status change actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleWhatsAppCustomer(activeOrder)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Customer</span>
              </button>

              <button
                onClick={() => setActiveOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-charcoal-900 text-white dark:bg-charcoal-800 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
