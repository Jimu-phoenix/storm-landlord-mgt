import React, { useState } from "react";
import { Zap, Droplet, Smartphone, Landmark,CreditCard, LightbulbIcon, ShieldAlertIcon, UserLockIcon, HandCoinsIcon, PhoneForwarded, LockIcon } from "lucide-react";
import "../styles/PayBills.css";

export default function PayBills() {
  const [paymentMethod, setPaymentMethod] = useState("airtel");
  const [selectedService, setSelectedService] = useState("electricity");
  const [customerNumber, setCustomerNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const services = [
    { id: "electricity", name: "ESCOM", description: "Electricity Bill", icon: <Zap size={24} color="#F2A444"/>, color: "#FF6B35" },
    { id: "water", name: "Water Board", description: "Water Bill", icon: <Droplet size={24} color="blue"/>, color: "#1E96FC" },
  ];

  const paymentOptions = [
    { id: "airtel", name: "Airtel Money", icon: <Smartphone size={24}/> },
    { id: "tnm", name: "TNM Mpamba", icon: <Smartphone size={24}/> },
    { id: "bank", name: "Bank Transfer", icon: <Landmark size={24}/> },
    { id: "card", name: "Card Payment", icon: <CreditCard/> },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const serviceName = selectedService === "electricity" ? "ESCOM" : "Water Board";
    const methodName = paymentOptions.find(p => p.id === paymentMethod)?.name;
    alert(`Payment of MWK ${amount} to ${serviceName} via ${methodName} submitted!`);
  };

  return (
    <div className="paybills-simple">
      {/* Header */}
      <div className="paybills-header">
        <h1>Pay Bills</h1>
        <p>Pay your utility bills securely</p>
      </div>

      <div className="paybills-content">
        {/* Left Side - Form */}
        <div className="paybills-form">
          {/* Service Selection */}
          <div className="service-select">
            <h3>Select Service</h3>
            <div className="service-options">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className={`service-btn ${selectedService === service.id ? 'active' : ''}`}
                  onClick={() => setSelectedService(service.id)}
                  style={{
                    backgroundColor: selectedService === service.id ? service.color + '15' : 'transparent',
                    borderColor: selectedService === service.id ? service.color : 'var(--border-color)'
                  }}
                >
                  <span className="service-icon">{service.icon}</span>
                  <div>
                    <strong>{service.name}</strong>
                    <span>{service.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bill Form */}
          <form onSubmit={handleSubmit} className="bill-form-simple">
            <div className="form-group">
              <label><UserLockIcon size={20}/> Account Number</label>
              <input
                type="text"
                placeholder="Enter your account number"
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label><HandCoinsIcon size={20}/> Amount (MWK)</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label><PhoneForwarded size={20}/> Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+265 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div className="payment-method-select">
              <h3>Payment Method</h3>
              <div className="payment-options">
                {paymentOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`pay-option ${paymentMethod === option.id ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(option.id)}
                  >
                    <span className="pay-icon">{option.icon}</span>
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Details if Card selected */}
            {paymentMethod === 'card' && (
              <div className="card-details-simple">
                <div className="form-group">
                  <label>Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456" maxLength="19" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" maxLength="5" />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="text" placeholder="123" maxLength="4" />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn">
              <LockIcon size={24}/> Pay MWK {amount || "0.00"}
            </button>

            <div className="security-note">
              <ShieldAlertIcon size={20}/> Secure payment • Encrypted connection
            </div>
          </form>
        </div>

        {/* Right Side - Summary */}
        <div className="paybills-summary">
          <div className="summary-card-simple">
            <h3>Payment Summary</h3>
            
            <div className="summary-service">
              <span className="summary-service-icon">
                {selectedService === "electricity" ? "⚡" : "💧"}
              </span>
              <div>
                <h4>{selectedService === "electricity" ? "ESCOM" : "Water Board"}</h4>
                <p>{selectedService === "electricity" ? "Electricity Bill" : "Water Bill"}</p>
              </div>
            </div>

            <div className="summary-details">
              <div className="summary-item">
                <span>Account Number</span>
                <span>{customerNumber || "Not provided"}</span>
              </div>
              <div className="summary-item">
                <span>Amount</span>
                <span className="amount">MWK {amount || "0.00"}</span>
              </div>
              <div className="summary-item">
                <span>Payment Method</span>
                <span>{paymentOptions.find(p => p.id === paymentMethod)?.name}</span>
              </div>
            </div>

            <div className="summary-total">
              <div className="summary-item">
                <span>Total</span>
                <span className="total">MWK {amount || "0.00"}</span>
              </div>
            </div>

            <div className="summary-info">
              <p><LightbulbIcon size={24}/> Your payment will be processed within 24 hours</p>
              <p><Smartphone size={20}/> Save your receipt for reference</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
