import { useState, useCallback } from 'react';
import posService from '@/services/posService.js';

export function usePOSProducts({ setCart } = {}) {
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const res = await posService.getProducts({ limit: 1000 });
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.products)
        ? res.products
        : Array.isArray(res?.data)
        ? res.data
        : [];
      if (Array.isArray(list) && list.length > 0) {
        const normalizedList = list.map((p) => ({
          ...p,
          id: p.id || p._id?.toString() || p.sku,
          sku: p.sku || p.id || p._id?.toString(),
          cost: p.costPrice !== undefined ? p.costPrice : p.cost,
          unit: p.unit === 'KG' ? 'per kg' : p.unit === 'LITER' ? 'per liter' : p.unit === 'PACKET' ? 'per packet' : p.unit === 'PIECE' ? 'per piece' : p.unit || 'per kg',
        }));
        setProducts(normalizedList);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.warn('POS live products API notice:', err.message);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Add Product
  const addProduct = (newProduct) => {
    let createdItem = null;
    setProducts((prevProducts) => {
      const nextNumber = prevProducts.length + 1;
      const generatedSku = `PRD-${String(nextNumber).padStart(3, '0')}`;

      createdItem = {
        id: newProduct.id ? newProduct.id.trim() : generatedSku,
        sku: newProduct.sku ? newProduct.sku.trim() : generatedSku,
        name: newProduct.name || 'Unnamed Product',
        category: newProduct.category || 'Milk',
        unit: newProduct.unit || 'per kg',
        source: newProduct.source || 'Farm',
        price: newProduct.price !== undefined && newProduct.price !== null && newProduct.price !== '' ? Number(newProduct.price) : 0,
        cost: newProduct.cost !== undefined && newProduct.cost !== null && newProduct.cost !== '' ? Number(newProduct.cost) : 0,
        status: newProduct.status || 'Active',
        barcode: newProduct.barcode || `890100${100 + nextNumber}`,
        storage: newProduct.storage || 'Refrigerated Chiller (0 - 4 °C)',
        frequency: newProduct.frequency || 'Daily Morning & Evening Batches',
        description: newProduct.description || '',
      };

      return [createdItem, ...prevProducts];
    });

    // Sync to backend
    try {
      if (posService && posService.createProduct) {
        const payload = {
          sku: createdItem.sku,
          name: createdItem.name,
          category: createdItem.category,
          unit: String(createdItem.unit).toUpperCase().includes('KG') ? 'KG' : String(createdItem.unit).toUpperCase().includes('LITER') ? 'LITER' : String(createdItem.unit).toUpperCase().includes('PACKET') ? 'PACKET' : 'PIECE',
          price: createdItem.price,
          costPrice: createdItem.cost,
          currentStock: Number(createdItem.stock) || 0,
        };
        posService.createProduct(payload).then((backendProduct) => {
          if (backendProduct && (backendProduct._id || backendProduct.id)) {
            const realId = backendProduct._id || backendProduct.id;
            setProducts((prev) => prev.map(p => (p.id === createdItem.id ? { ...p, id: realId, _id: realId } : p)));
          }
        }).catch((err) => {
          console.warn('Failed to sync new product to backend:', err);
        });
      }
    } catch (err) {}

    return createdItem;
  };

  // Edit / Update Product
  const updateProduct = (updatedProduct) => {
    setProducts((prevProducts) => {
      return prevProducts.map((item) => {
        if (item.id === updatedProduct.id) {
          return {
            ...item,
            ...updatedProduct,
            source: updatedProduct.source || item.source || 'Farm',
            price: updatedProduct.price !== undefined && updatedProduct.price !== null && updatedProduct.price !== '' ? Number(updatedProduct.price) : item.price,
            cost: updatedProduct.cost !== undefined && updatedProduct.cost !== null && updatedProduct.cost !== '' ? Number(updatedProduct.cost) : item.cost,
          };
        }
        return item;
      });
    });
    setEditingProduct(null);

    // Also update price and name in active cart if present
    if (setCart) {
      setCart((prev) =>
        prev.map((cartItem) => {
          if (cartItem.id === updatedProduct.id) {
            return {
              ...cartItem,
              name: updatedProduct.name || cartItem.name,
              price: updatedProduct.price !== undefined && updatedProduct.price !== null && updatedProduct.price !== '' ? Number(updatedProduct.price) : cartItem.price,
              unit: updatedProduct.unit || cartItem.unit,
              category: updatedProduct.category || cartItem.category,
            };
          }
          return cartItem;
        })
      );
    }

    // Sync to backend
    try {
      if (posService && posService.updateProduct && updatedProduct.id) {
        const payload = {
          ...updatedProduct,
          price: updatedProduct.price !== undefined && updatedProduct.price !== null && updatedProduct.price !== '' ? Number(updatedProduct.price) : undefined,
          costPrice: updatedProduct.cost !== undefined && updatedProduct.cost !== null && updatedProduct.cost !== '' ? Number(updatedProduct.cost) : undefined,
        };
        if (updatedProduct.unit) {
          payload.unit = String(updatedProduct.unit).toUpperCase().includes('KG') ? 'KG' : String(updatedProduct.unit).toUpperCase().includes('LITER') ? 'LITER' : String(updatedProduct.unit).toUpperCase().includes('PACKET') ? 'PACKET' : 'PIECE';
        }
        posService.updateProduct(updatedProduct.id, payload).catch((err) => {
          console.warn('Failed to sync product update to backend:', err);
        });
      }
    } catch (err) {}
  };

  // Batch Update Products
  const batchUpdateProducts = (updaterOrList) => {
    setProducts((prevProducts) => {
      if (typeof updaterOrList === 'function') {
        return updaterOrList(prevProducts);
      } else if (Array.isArray(updaterOrList)) {
        return updaterOrList;
      }
      return prevProducts;
    });
  };

  // Delete Product
  const deleteProduct = (productId) => {
    setProducts((prevProducts) => prevProducts.filter((item) => item.id !== productId));

    if (editingProduct && editingProduct.id === productId) {
      setEditingProduct(null);
    }

    // Remove from cart if present
    if (setCart) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
    }

    // Sync to backend
    try {
      if (posService && posService.deleteProduct) {
        posService.deleteProduct(productId).catch((err) => {
          console.warn('Failed to sync product deletion to backend:', err);
        });
      }
    } catch (err) {}
  };

  return {
    products,
    setProducts,
    isLoadingProducts,
    loadProducts,
    editingProduct,
    setEditingProduct,
    addProduct,
    updateProduct,
    batchUpdateProducts,
    deleteProduct,
  };
}
