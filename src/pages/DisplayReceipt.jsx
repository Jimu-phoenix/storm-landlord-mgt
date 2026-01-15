import React from "react";

export default function displayReceipt(apiResponse, paymentData, selectedService) {
    // Get current date and time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    // Get service name
    const serviceName = selectedService === "electricity" ? "ESCOM Electricity" : "Water Board";
    
    // Format amounts
    const formattedAmount = new Intl.NumberFormat('en-US').format(paymentData.amount);
    const formattedPreviousBalance = new Intl.NumberFormat('en-US').format(apiResponse.payment?.previousBalance || 0);
    const formattedNewBalance = new Intl.NumberFormat('en-US').format(apiResponse.payment?.newBalance || 0);
    
    // Payment method display name
    const paymentMethodDisplay = paymentData.paymentMethod?.replace('_', ' ')?.toUpperCase() || 
        (paymentData.paymentMethod === 'airtel_money' ? 'AIRTEL MONEY' : 
         paymentData.paymentMethod === 'tnm_mpamba' ? 'TNM MPAMBA' : 
         paymentData.paymentMethod?.toUpperCase() || 'PAYMENT');
    
    // Create receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Receipt - SmartLoad</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
              
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: "Poppins", sans-serif;
                  background: #f9f9f9;
                  color: #09090b;
                  min-height: 100vh;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  padding: 16px;
                  line-height: 1.5;
              }
              
              .receipt {
                  width: 100%;
                  max-width: 500px;
                  background: white;
                  border-radius: 12px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
                  border: 1px solid #e5e7eb;
              }
              
              /* Header */
              .header {
                  background: #16a34a;
                  color: white;
                  padding: 32px 24px;
                  text-align: center;
              }
              
              .header h1 {
                  font-size: 24px;
                  font-weight: 600;
                  margin-bottom: 8px;
              }
              
              .header p {
                  opacity: 0.9;
                  font-size: 14px;
              }
              
              /* Content */
              .content {
                  padding: 32px 24px;
              }
              
              /* Transaction ID */
              .transaction-id {
                  background: #f3f4f6;
                  padding: 12px 16px;
                  border-radius: 8px;
                  margin-bottom: 24px;
                  font-size: 14px;
                  text-align: center;
                  border: 1px solid #e5e7eb;
              }
              
              /* Service Info */
              .service-info {
                  display: flex;
                  align-items: center;
                  gap: 16px;
                  margin-bottom: 24px;
                  padding-bottom: 16px;
                  border-bottom: 1px solid #e5e7eb;
              }
              
              .service-icon {
                  width: 48px;
                  height: 48px;
                  background: #f9f9f9;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 24px;
                  border: 2px solid ${selectedService === "electricity" ? "#F2A444" : "#1E96FC"};
              }
              
              .service-details h3 {
                  font-size: 18px;
                  font-weight: 600;
                  margin-bottom: 4px;
              }
              
              .service-details p {
                  color: #52525b;
                  font-size: 14px;
              }
              
              /* Details */
              .details {
                  margin-bottom: 24px;
              }
              
              .detail-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 12px 0;
                  border-bottom: 1px solid #e5e7eb;
                  font-size: 14px;
              }
              
              .detail-row:last-child {
                  border-bottom: none;
              }
              
              .detail-label {
                  color: #52525b;
              }
              
              .detail-value {
                  font-weight: 600;
              }
              
              /* Amount */
              .amount-box {
                  background: #f9f9f9;
                  border-radius: 8px;
                  padding: 24px;
                  margin-bottom: 24px;
                  border: 1px solid #e5e7eb;
                  text-align: center;
              }
              
              .amount-label {
                  color: #52525b;
                  font-size: 14px;
                  margin-bottom: 8px;
              }
              
              .amount-value {
                  font-size: 32px;
                  font-weight: 700;
                  color: #09090b;
              }
              
              /* Balance Info */
              .balance-info {
                  background: #f0fdf4;
                  border-radius: 8px;
                  padding: 20px;
                  margin-bottom: 24px;
                  border: 1px solid #bbf7d0;
              }
              
              .balance-info h4 {
                  font-size: 16px;
                  font-weight: 600;
                  margin-bottom: 16px;
                  color: #16a34a;
                  display: flex;
                  align-items: center;
                  gap: 8px;
              }
              
              .balance-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 8px;
                  font-size: 14px;
              }
              
              .balance-row:last-child {
                  margin-top: 12px;
                  padding-top: 12px;
                  border-top: 1px solid #bbf7d0;
                  font-weight: 600;
                  color: #16a34a;
              }
              
              /* Footer */
              .footer {
                  border-top: 2px dashed #e5e7eb;
                  padding: 24px;
                  text-align: center;
              }
              
              .thank-you {
                  font-size: 18px;
                  font-weight: 600;
                  margin-bottom: 16px;
              }
              
              .footer-note {
                  color: #52525b;
                  font-size: 13px;
                  line-height: 1.5;
                  margin-bottom: 24px;
              }
              
              .actions {
                  display: flex;
                  gap: 12px;
                  justify-content: center;
              }
              
              button {
                  padding: 12px 24px;
                  border: none;
                  border-radius: 8px;
                  font-family: "Poppins", sans-serif;
                  font-weight: 600;
                  cursor: pointer;
                  font-size: 14px;
                  transition: all 0.2s ease;
                  display: flex;
                  align-items: center;
                  gap: 8px;
              }
              
              .print-btn {
                  background: #09090b;
                  color: white;
              }
              
              .print-btn:hover {
                  background: #18181b;
              }
              
              .close-btn {
                  background: white;
                  color: #09090b;
                  border: 1px solid #e5e7eb;
              }
              
              .close-btn:hover {
                  background: #f9f9f9;
              }
              
              /* Responsive */
              @media (max-width: 768px) {
                  .receipt {
                      max-width: 100%;
                  }
                  
                  .header {
                      padding: 24px 20px;
                  }
                  
                  .content {
                      padding: 24px 20px;
                  }
                  
                  .actions {
                      flex-direction: column;
                  }
                  
                  button {
                      width: 100%;
                      justify-content: center;
                  }
              }
              
              /* Print Styles */
              @media print {
                  body {
                      background: white;
                      padding: 0;
                  }
                  
                  .receipt {
                      box-shadow: none;
                      border: none;
                      max-width: 100%;
                  }
                  
                  .actions {
                      display: none;
                  }
              }
          </style>
      </head>
      <body>
          <div class="receipt">
              <!-- Header -->
              <div class="header">
                  <h1>Payment Successful</h1>
                  <p>Your bill payment has been processed</p>
              </div>
              
              <!-- Content -->
              <div class="content">
                  <!-- Transaction ID -->
                  <div class="transaction-id">
                      Invoice: ${apiResponse.transaction?.transactionId || "N/A"}
                  </div>
                  
                  <!-- Service Info -->
                  <div class="service-info">
                      <div class="service-icon">
                          ${selectedService === "electricity" ? "⚡" : "💧"}
                      </div>
                      <div class="service-details">
                          <h3>${serviceName}</h3>
                          <p>Account: ${paymentData.customerAccountNumber}</p>
                      </div>
                  </div>
                  
                  <!-- Transaction Details -->
                  <div class="details">
                      <div class="detail-row">
                          <span class="detail-label">Payment Time</span>
                          <span class="detail-value">${formattedTime} ${formattedDate}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Payment Method</span>
                          <span class="detail-value">${paymentMethodDisplay}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Customer</span>
                          <span class="detail-value">${apiResponse.user?.fullName || paymentData.fullName}</span>
                      </div>
                  </div>
                  
                  <!-- Amount -->
                  <div class="amount-box">
                      <div class="amount-label">Amount Paid</div>
                      <div class="amount-value">MWK ${formattedAmount}</div>
                  </div>
                  
                  <!-- Balance Information -->
                  <div class="balance-info">
                      <h4>💰 Wallet Balance</h4>
                      <div class="balance-row">
                          <span>Previous Balance</span>
                          <span>MWK ${formattedPreviousBalance}</span>
                      </div>
                      <div class="balance-row">
                          <span>Amount Deducted</span>
                          <span>MWK ${formattedAmount}</span>
                      </div>
                      <div class="balance-row">
                          <span>Current Balance</span>
                          <span>MWK ${formattedNewBalance}</span>
                      </div>
                  </div>
              </div>
              
              <!-- Footer -->
              <div class="footer">
                  <div class="thank-you">Thank you for your payment!</div>
                  <p class="footer-note">
                      This is an official receipt. Keep this for your records. 
                      Payment will be processed within 24 hours.
                  </p>
                  
                  <div class="actions">
                      <button class="print-btn" onclick="window.print()">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                              <path d="M6 14h12v8H6z"/>
                          </svg>
                          Print Receipt
                      </button>
                      <button class="close-btn" onclick="window.close()">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                          Close
                      </button>
                  </div>
              </div>
          </div>
          
          <script>
              // Optional: Auto-print after 1 second
              // window.onload = function() {
              //     setTimeout(function() {
              //         window.print();
              //     }, 1000);
              // };
          </script>
      </body>
      </html>
    `;
    
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
        receiptWindow.document.write(receiptHTML);
        receiptWindow.document.close();
        
        // Focus on the new window
        receiptWindow.focus();
    } else {
        alert("Please allow pop-ups to view the receipt.");
    }
}