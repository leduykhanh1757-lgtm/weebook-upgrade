import React from 'react';
import { createPortal } from 'react-dom';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Đồng ý', cancelText = 'Hủy' }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={onCancel}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={`btn btn-outline ${styles.cancelBtn}`} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn btn-primary ${styles.confirmBtn}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
