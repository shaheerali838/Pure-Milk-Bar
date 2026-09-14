import React from 'react';
import {
  POSContext,
  POSProvider,
  usePOSContext,
  useProductContext,
  deliveryRidersList,
} from './POSContext';

/**
 * =============================================================================
 * UNIFIED CONTEXT: ProductContext & POSContext Merged
 * =============================================================================
 * Both POS and Product Inventory states are unified in POSContext.
 * This file provides seamless re-exports so that either `useProductContext`
 * or `usePOSContext`, and `ProductProvider` or `POSProvider` can be used
 * anywhere in the application with 100% shared state.
 */

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
