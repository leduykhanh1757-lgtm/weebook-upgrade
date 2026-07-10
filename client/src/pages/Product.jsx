import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { booksAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const Product = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await booksAPI.getBookById(id);
        if (res.book) {
          setBook(res.book);
          const relRes = await booksAPI.getBooks({ subcategory: res.book.subcategory, limit: 4 });
          setRelatedBooks(relRes.books?.filter(b => String(b.id) !== String(id)) || []);
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (book) {
      dispatch(addToCart({ bookId: book.id, quantity, book }));
      alert('Đã thêm vào giỏ hàng!');
    }
  };

  if (loading) return <div className="container"><p>Đang tải...</p></div>;
  if (!book) return <div className="container"><p>Không tìm thấy sản phẩm!</p></div>;

  return (
    <div className="container product-detail-page">
      <div className="product-detail-container">
        <div className="product-images">
          <div className="main-image">
            <img src={book.images?.[0] || '/src/assets/images/placeholder.jpg'} alt={book.title} />
          </div>
        </div>
        <div className="product-info">
          <h1 className="product-title">{book.title}</h1>
          <p className="product-author">{book.author}</p>
          <div className="product-price">
            <span className="current-price">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
            </span>
          </div>
          <div className="product-description">
            <p>{book.description}</p>
          </div>
          <div className="add-to-cart-section">
            <div className="quantity-selector">
              <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="number" className="qty-input" value={quantity} readOnly />
              <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
              <i className="fas fa-shopping-cart"></i> Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
      
      {relatedBooks.length > 0 && (
        <section className="product-showcase">
          <h2>Sản phẩm liên quan</h2>
          <div className="product-grid">
            {relatedBooks.map(b => <ProductCard key={b.id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default Product;
