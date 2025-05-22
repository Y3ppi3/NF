import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchProducts, 
  fetchProductById, 
  fetchCategories,
  fetchProductsByCategory,
  setCurrentPage
} from '../store/products/productsSlice';
import { ProductFilter } from '../types/products';

export const useProducts = () => {
  const dispatch: AppDispatch = useDispatch();
  const { 
    products, 
    currentProduct, 
    categories, 
    loading, 
    error,
    totalItems,
    currentPage,
    itemsPerPage,
    totalPages
  } = useSelector((state: RootState) => state.products);

  const getProducts = useCallback(
    (filters?: ProductFilter, page?: number, limit?: number) => {
      dispatch(fetchProducts({ filters, page, limit }));
    },
    [dispatch]
  );

  const getProductById = useCallback(
    (id: number) => {
      dispatch(fetchProductById(id));
    },
    [dispatch]
  );

  const getCategories = useCallback(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const getProductsByCategory = useCallback(
    (categoryId: number, page?: number, limit?: number) => {
      dispatch(fetchProductsByCategory({ categoryId, page, limit }));
    },
    [dispatch]
  );

  const changePage = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
    },
    [dispatch]
  );

  return {
    products,
    currentProduct,
    categories,
    loading,
    error,
    totalItems,
    currentPage,
    itemsPerPage,
    totalPages,
    getProducts,
    getProductById,
    getCategories,
    getProductsByCategory,
    changePage
  };
};