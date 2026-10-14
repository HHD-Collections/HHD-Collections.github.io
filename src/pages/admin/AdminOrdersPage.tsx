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
  Trash2,
  Mail,
  MessageSquare,
  Users,
  Copy,
  Check,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus, ContactInquiry, InquiryStatus, NewsletterSubscriber } from '../../types';
import { getOrders, updateOrderStatus, deleteOrder } from '../../services/orderService';
import {
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
  getNewsletterSubscribers,
} from '../../services/inquiryService';
import { formatPrice, formatDate } from '../../utils/formatters';

export const AdminOrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inquiries' | 'subscribers'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Inquiries State
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [selectedInquiryStatus, setSelectedInquiryStatus] = useState<string>('all');

  // Subscribers State
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (e) {
      console.error('Failed to load orders from Firestore:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const data = await getInquiries();
      setInquiries(data);
    } catch (e) {
      console.error('Failed to load inquiries from Firestore:', e);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const loadSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const data = await getNewsletterSubscribers();
      setSubscribers(data);
    } catch (e) {
      console.error('Failed to load subscribers from Firestore:', e);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    loadOrders();
    loadInquiries();
    loadSubscribers();
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

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order from Firestore? This cannot be undone.')) {
      return;
    }
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (activeOrder && activeOrder.id === orderId) {
        setActiveOrder(null);
      }
    } catch (e) {
      alert('Failed to delete order');
    }
  };

  const handleInquiryStatusChange = async (inquiryId: string, status: InquiryStatus) => {
    try {
      await updateInquiryStatus(inquiryId, status);
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? { ...i, status } : i))
      );
    } catch (e) {
      alert('Failed to update inquiry status');
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this customer inquiry from Firestore?')) {
      return;
    }
    try {
      await deleteInquiry(inquiryId);
      setInquiries((prev) => prev.filter((i) => i.id !== inquiryId));
    } catch (e) {
      alert('Failed to delete inquiry');
    }
  };

  const handleCopySubscribers = () => {
    const emails = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  const handleWhatsAppCustomer = (order: Order) => {
    const cleanNumber = order.customer.phone.replace(/[^0-9]/g, '');
    const msg = `Hello ${order.customer.fullName}! This is HHD Collections regarding your order ${order.orderNumber} for total Rs. ${order.total.toLocaleString()}. Your order is currently: ${order.status.toUpperCase()}.`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleWhatsAppInquiry = (inquiry: ContactInquiry) => {
    if (!inquiry.phone) return;
    const cleanNumber = inquiry.phone.replace(/[^0-9]/g, '');
    const msg = `Hello ${inquiry.name}! This is HHD Collections responding to your inquiry: "${inquiry.subject}". How can we help you?`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === 'all') return true;
    return o.status === selectedStatus;
  });

  const filteredInquiries = inquiries.filter((i) => {
    if (selectedInquiryStatus === 'all') return true;
    return i.status === selectedInquiryStatus;
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

  const getInquiryStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'unread':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'read':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'replied':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'archived':
      default:
        return 'bg-charcoal-100 text-charcoal-800 dark:bg-charcoal-800 dark:text-charcoal-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
            Customer Orders & Communications
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Real-time management for orders, customer messages, and subscribers connected to Cloud Firestore
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center p-1 rounded-xl bg-charcoal-100 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white shadow-sm'
                : 'text-charcoal-500 hover:text-charcoal-800 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'inquiries'
                ? 'bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white shadow-sm'
                : 'text-charcoal-500 hover:text-charcoal-800 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Inquiries ({inquiries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'subscribers'
                ? 'bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white shadow-sm'
                : 'text-charcoal-500 hover:text-charcoal-800 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Newsletter ({subscribers.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: ORDERS                                              */}
      {/* ========================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal-500 font-semibold">
              Showing {filteredOrders.length} placed orders in Cloud Firestore
            </span>

            {/* Filter bar */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 text-xs text-charcoal-800 dark:text-charcoal-200 font-semibold"
            >
              <option value="all">All Orders ({orders.length})</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 overflow-hidden shadow-sm">
            {loadingOrders ? (
              <div className="p-12 text-center text-xs text-charcoal-400">Loading orders from Firestore...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-charcoal-400">
                No orders found under this status.
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-charcoal-100 dark:border-charcoal-800 text-charcoal-400 bg-charcoal-50/50 dark:bg-charcoal-800/30">
                        <th className="py-3 px-4 font-semibold">Order Ref</th>
                        <th className="py-3 px-4 font-semibold">Customer</th>
                        <th className="py-3 px-4 font-semibold">Items</th>
                        <th className="py-3 px-4 font-semibold">Total</th>
                        <th className="py-3 px-4 font-semibold">Payment</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800/60">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-charcoal-50/50 dark:hover:bg-charcoal-800/40">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-charcoal-900 dark:text-white block">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] text-charcoal-400">
                              {formatDate(order.createdAt)}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-charcoal-900 dark:text-white block">
                              {order.customer.fullName}
                            </span>
                            <span className="text-[11px] text-charcoal-500 block">
                              {order.customer.phone}
                            </span>
                            <span className="text-[10px] text-charcoal-400">
                              {order.customer.city}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-charcoal-700 dark:text-charcoal-300">
                            {order.items.length} items
                          </td>

                          <td className="py-3 px-4 font-serif font-bold text-charcoal-900 dark:text-white">
                            {formatPrice(order.total)}
                          </td>

                          <td className="py-3 px-4 text-charcoal-600 dark:text-charcoal-300 uppercase text-[10px] font-bold">
                            {order.paymentMethod === 'cod'
                              ? 'COD'
                              : order.paymentMethod === 'bank_transfer'
                              ? 'Bank'
                              : 'WhatsApp'}
                          </td>

                          <td className="py-3 px-4">
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
                            <div className="flex items-center justify-end space-x-1.5">
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
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                                title="Delete order from Firestore"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Orders Card View */}
                <div className="md:hidden divide-y divide-charcoal-100 dark:divide-charcoal-800">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-xs text-charcoal-900 dark:text-white block">
                            {order.orderNumber}
                          </span>
                          <span className="text-[10px] text-charcoal-400">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>

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
                      </div>

                      <div className="text-xs space-y-0.5">
                        <div className="font-semibold text-charcoal-900 dark:text-white">
                          {order.customer.fullName}
                        </div>
                        <div className="text-[11px] text-charcoal-500">
                          {order.customer.phone} • {order.customer.city}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-charcoal-100 dark:border-charcoal-800/60">
                        <div>
                          <span className="text-[10px] text-charcoal-400 block">Total</span>
                          <span className="font-bold text-xs text-charcoal-900 dark:text-white font-serif">
                            {formatPrice(order.total)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleWhatsAppCustomer(order)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold flex items-center space-x-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            onClick={() => setActiveOrder(order)}
                            className="p-1.5 rounded-lg text-charcoal-600 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 border border-charcoal-200 dark:border-charcoal-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: INQUIRIES & CONTACT MESSAGES                        */}
      {/* ========================================================== */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal-500 font-semibold">
              Showing {filteredInquiries.length} customer messages in Cloud Firestore
            </span>

            {/* Filter bar */}
            <select
              value={selectedInquiryStatus}
              onChange={(e) => setSelectedInquiryStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 text-xs text-charcoal-800 dark:text-charcoal-200 font-semibold"
            >
              <option value="all">All Inquiries ({inquiries.length})</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 overflow-hidden shadow-sm">
            {loadingInquiries ? (
              <div className="p-12 text-center text-xs text-charcoal-400">Loading messages from Firestore...</div>
            ) : filteredInquiries.length === 0 ? (
              <div className="p-12 text-center text-xs text-charcoal-400">
                No customer inquiries under this filter.
              </div>
            ) : (
              <div className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
                {filteredInquiries.map((inq) => (
                  <div key={inq.id} className="p-4 sm:p-5 space-y-3 hover:bg-charcoal-50/40 dark:hover:bg-charcoal-800/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-sm text-charcoal-900 dark:text-white">
                          {inq.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getInquiryStatusBadge(inq.status)}`}>
                          {inq.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <select
                          value={inq.status}
                          onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value as InquiryStatus)}
                          className="px-2.5 py-1 rounded-lg bg-charcoal-100 dark:bg-charcoal-800 text-[11px] font-semibold border-0 text-charcoal-700 dark:text-charcoal-300"
                        >
                          <option value="unread">Mark Unread</option>
                          <option value="read">Mark Read</option>
                          <option value="replied">Mark Replied</option>
                          <option value="archived">Mark Archived</option>
                        </select>

                        {inq.phone && (
                          <button
                            onClick={() => handleWhatsAppInquiry(inq)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}

                        <a
                          href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject)}`}
                          className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/60"
                          title="Reply via Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-500">
                      <span>Email: <strong className="text-charcoal-800 dark:text-charcoal-200">{inq.email}</strong></span>
                      {inq.phone && <span>Phone: <strong className="text-charcoal-800 dark:text-charcoal-200">{inq.phone}</strong></span>}
                      <span>Date: {formatDate(inq.createdAt)}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-50 dark:bg-charcoal-800/60 border border-charcoal-100 dark:border-charcoal-700/60 space-y-1">
                      <span className="text-xs font-bold text-charcoal-900 dark:text-white block">
                        Subject: {inq.subject}
                      </span>
                      <p className="text-xs text-charcoal-700 dark:text-charcoal-300 whitespace-pre-wrap leading-relaxed">
                        {inq.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: NEWSLETTER SUBSCRIBERS                              */}
      {/* ========================================================== */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal-500 font-semibold">
              {subscribers.length} VIP newsletter subscribers stored in Cloud Firestore
            </span>

            <button
              onClick={handleCopySubscribers}
              disabled={subscribers.length === 0}
              className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              {copiedEmails ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Emails Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All Emails</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 overflow-hidden shadow-sm">
            {loadingSubscribers ? (
              <div className="p-12 text-center text-xs text-charcoal-400">Loading subscribers...</div>
            ) : subscribers.length === 0 ? (
              <div className="p-12 text-center text-xs text-charcoal-400">
                No newsletter subscribers yet. Subscriptions from the footer form will appear here.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal-100 dark:border-charcoal-800 text-charcoal-400 bg-charcoal-50/50 dark:bg-charcoal-800/30">
                    <th className="py-3 px-4 font-semibold">Email Address</th>
                    <th className="py-3 px-4 font-semibold">Subscribed Date</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800/60">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-charcoal-50/50 dark:hover:bg-charcoal-800/40">
                      <td className="py-3 px-4 font-semibold text-charcoal-900 dark:text-white">
                        {sub.email}
                      </td>
                      <td className="py-3 px-4 text-charcoal-500">
                        {formatDate(sub.subscribedAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

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
