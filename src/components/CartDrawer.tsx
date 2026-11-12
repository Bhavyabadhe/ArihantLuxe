import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice';
import { Link } from 'react-router-dom';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <>
      {open && <div className="drawer-overlay" onClick={onClose} />}
      <div className={`cart-drawer ${open ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2 className="serif">Shopping Bag</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p style={{ letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Your bag is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-info">
                    <div>
                      <p className="cart-item-name">{item.name}</p>
                      <p className="cart-item-price">Rs.{item.price.toFixed(2)}</p>
                      <p className="cart-item-size">Size: {item.size}</p>
                      <p className="cart-item-color">Color: {item.color}</p>
                    </div>
                    <div className="qty-controls">
                      <button onClick={() => dispatch(updateQuantity({ id: item.id, size: item.size, color: item.color, quantity: Math.max(1, item.quantity - 1) }))}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => dispatch(updateQuantity({ id: item.id, size: item.size, color: item.color, quantity: item.quantity + 1 }))}>+</button>
                      <button
                        style={{ marginLeft: 'auto', border: 'none', textDecoration: 'underline', fontSize: '0.7rem', color: 'var(--text-muted)' }}
                        onClick={() => dispatch(removeFromCart({ id: item.id, size: item.size, color: item.color }))}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total">
                <span>Subtotal</span>
                <span>Rs.{total.toFixed(2)}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Shipping and taxes calculated at checkout.</p>
              <Link to="/checkout" className="checkout-btn" onClick={onClose}>Checkout</Link>
              <button
                className="clear-btn"
                style={{ marginTop: '1rem', width: '100%', border: 'none' }}
                onClick={() => dispatch(clearCart())}
              >
                Clear Bag
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
