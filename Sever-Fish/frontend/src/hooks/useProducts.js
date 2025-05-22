import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchProductById, fetchCategories, fetchProductsByCategory, setCurrentPage } from '../store/products/productsSlice';
export const useProducts = () => {
    const dispatch = useDispatch();
    const { products, currentProduct, categories, loading, error, totalItems, currentPage, itemsPerPage, totalPages } = useSelector((state) => state.products);
    const getProducts = useCallback((filters, page, limit) => {
        dispatch(fetchProducts({ filters, page, limit }));
    }, [dispatch]);
    const getProductById = useCallback((id) => {
        dispatch(fetchProductById(id));
    }, [dispatch]);
    const getCategories = useCallback(() => {
        dispatch(fetchCategories());
    }, [dispatch]);
    const getProductsByCategory = useCallback((categoryId, page, limit) => {
        dispatch(fetchProductsByCategory({ categoryId, page, limit }));
    }, [dispatch]);
    const changePage = useCallback((page) => {
        dispatch(setCurrentPage(page));
    }, [dispatch]);
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
