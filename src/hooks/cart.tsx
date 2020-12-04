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
      const prods = await AsyncStorage.getItem('@GoMarketPlace:products');
      if (prods) {
        setProducts(JSON.parse(prods));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const newProducts = products.map(
        ({ id: index, quantity, ...rest }: Product) => {
          if (index === id) {
            return {
              id: index,
              quantity: quantity + 1,
              ...rest,
            };
          }
          return { id: index, quantity, ...rest };
        },
      );

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = products.map(
        ({ id: index, quantity, ...rest }: Product) => {
          if (index === id && quantity > 1) {
            return {
              id: index,
              quantity: quantity - 1,
              ...rest,
            };
          }
          return { id: index, quantity, ...rest };
        },
      );

      setProducts(newProducts);
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async ({ id, image_url, title, price }: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      const findProduct = products.find(product => product.id === id);

      if (!findProduct) {
        const product: Product = {
          id,
          image_url,
          title,
          price,
          quantity: 1,
        };
        setProducts([...products, product]);
      } else {
        increment(findProduct.id);
      }
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products, increment],
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
