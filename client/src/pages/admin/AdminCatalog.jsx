import React, { useState } from 'react';
import AdminBooks from './AdminBooks';
import AdminCategories from './AdminCategories';
import AdminAuthors from './AdminAuthors';
import AdminReviews from './AdminReviews';
import styles from './AdminPages.module.css';

const AdminCatalog = () => {
  const [activeTab, setActiveTab] = useState('books');

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Quản lý Kho sách (Catalog & Inventory)</h1>
      </div>

      {/* Horizontal Tabs */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'books' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('books')}
        >
          <i className="fa-solid fa-book"></i> Danh sách Sản phẩm
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'categories' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <i className="fa-solid fa-layer-group"></i> Danh mục
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'authors' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('authors')}
        >
          <i className="fa-solid fa-pen-nib"></i> Tác giả & NXB
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <i className="fa-solid fa-star"></i> Đánh giá
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'books' && <AdminBooks />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'authors' && <AdminAuthors />}
        {activeTab === 'reviews' && <AdminReviews />}
      </div>
    </div>
  );
};

export default AdminCatalog;
