const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type, link = null, metadata = null) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      link,
      metadata
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Notification triggers for different events
const notifyPaymentCreated = async (userId, paymentData) => {
  await createNotification(
    userId,
    'New Payment Created',
    `Payment of ₹${paymentData.amount} to ${paymentData.vendor} has been created`,
    'payment',
    'Payments',
    { paymentId: paymentData._id }
  );
};

const notifyPaymentApproved = async (userId, paymentData) => {
  await createNotification(
    userId,
    'Payment Approved',
    `Payment of ₹${paymentData.amount} to ${paymentData.vendor} has been approved`,
    'approval',
    'Payments',
    { paymentId: paymentData._id }
  );
};

const notifyInvoiceCreated = async (userId, invoiceData) => {
  await createNotification(
    userId,
    'New Invoice Created',
    `Invoice ${invoiceData.invoiceNumber} for ${invoiceData.clientName} has been created`,
    'invoice',
    'Invoice Management',
    { invoiceId: invoiceData._id }
  );
};

const notifyBillCreated = async (userId, billData) => {
  await createNotification(
    userId,
    'New Bill Created',
    `Bill ${billData.billNumber} from ${billData.vendorName} has been created`,
    'bill',
    'Bills',
    { billId: billData._id }
  );
};

const notifyBillApprovalPending = async (userId, billData) => {
  await createNotification(
    userId,
    'Bill Approval Required',
    `Bill ${billData.billNumber} from ${billData.vendorName} needs your approval`,
    'approval',
    'Approvals',
    { billId: billData._id }
  );
};

const notifyInvoiceOverdue = async (userId, invoiceData) => {
  await createNotification(
    userId,
    'Invoice Overdue',
    `Invoice ${invoiceData.invoiceNumber} for ${invoiceData.clientName} is overdue`,
    'overdue',
    'Invoice Management',
    { invoiceId: invoiceData._id }
  );
};

const notifyPaymentReceived = async (userId, collectionData) => {
  await createNotification(
    userId,
    'Payment Received',
    `Payment of ₹${collectionData.netAmount} received from ${collectionData.customer}`,
    'payment',
    'Collection Register',
    { collectionId: collectionData._id }
  );
};

module.exports = {
  createNotification,
  notifyPaymentCreated,
  notifyPaymentApproved,
  notifyInvoiceCreated,
  notifyBillCreated,
  notifyBillApprovalPending,
  notifyInvoiceOverdue,
  notifyPaymentReceived
};
