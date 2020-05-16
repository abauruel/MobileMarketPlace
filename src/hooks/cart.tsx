import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const response = await AsyncStorage.getItem('@GoMarketplace:product');
      if (response) {
        setProducts(JSON.parse(response));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = products.map(item => {
        let newItem;
        item.id === id
          ? (newItem = { ...item, quantity: item.quantity + 1 })
          : (newItem = { ...item });

        return newItem;
      });
      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:product',
        JSON.stringify(newProducts),
      );
      return;
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const existItem = products.find(item => item.id === product.id);
      if (existItem) {
        return increment(existItem.id);
      }

      setProducts([...products, { ...product, quantity: 1 }]);

      await AsyncStorage.setItem(
        '@GoMarketplace:product',
        JSON.stringify(products),
      );
    },
    [products, increment],
  );
  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      let newProducts;
      const returnProduct = products.find(item => item.id === id);

      if (returnProduct?.quantity === 1) {
        newProducts = products.filter(item => item.id !== id);
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:product',
          JSON.stringify(newProducts),
        );
        return;
      }

      newProducts = products.map(item => {
        let newItem;
        item.id === id
          ? (newItem = { ...item, quantity: item.quantity - 1 })
          : (newItem = { ...item });
        return newItem;
      });

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:product',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
