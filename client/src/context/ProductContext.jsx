import React from 'react';
import {
  POSContext,
  POSProvider,
  usePOSContext,
  useProductContext,
  deliveryRidersList,
} from './POSContext';


// Aliases for unified usage
export const ProductContext = POSContext;
export const ProductProvider = POSProvider;

// Re-export hooks and provider
export {
  POSContext,
  POSProvider,
  usePOSContext,
  useProductContext,
  deliveryRidersList,
};

export default ProductProvider;
