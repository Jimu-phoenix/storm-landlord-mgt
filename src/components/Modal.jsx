import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import '../styles/Modal.css';

export default function Modal({ isOpen, onClose, type = 'info', title, message, onConfirm, confirmText = 'OK', showCancel = false }) {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle size={48} />,
    error: <AlertCircle size={48} />,
    info: <Info size={48} />,
    warning: <AlertCircle size={48} />
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className={`modal-container ${type}`}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-icon">
          {icons[type]}
        </div>

        <div className="modal-content">
          {title && <h3 className="modal-title">{title}</h3>}
          <p className="modal-message">{message}</p>
        </div>

        <div className="modal-actions">
          {showCancel && (
            <button className="modal-btn modal-cancel-btn" onClick={onClose}>
              Cancel
            </button>
          )}
          <button 
            className="modal-btn modal-confirm-btn" 
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}