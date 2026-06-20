export async function initiateMockMpesaPayment(paymentDetails) {
  const checkoutRequestId = `MOCK-STK-${Date.now()}`

  return {
    success: true,
    provider: 'mpesa',
    mode: 'mock',
    checkoutRequestId,
    merchantRequestId: `MOCK-MERCHANT-${Date.now()}`,
    message:
      'Mock M-Pesa STK Push initiated successfully. Real Safaricom credentials will be connected later.',
    data: {
      phoneNumber: paymentDetails.phoneNumber,
      amount: Number(paymentDetails.amount),
      accountReference: paymentDetails.accountReference,
      transactionDescription: paymentDetails.transactionDescription,
    },
  }
}

export async function verifyMockMpesaPayment(checkoutRequestId) {
  return {
    success: true,
    provider: 'mpesa',
    mode: 'mock',
    checkoutRequestId,
    status: 'paid',
    message: 'Mock M-Pesa payment verified successfully.',
  }
}