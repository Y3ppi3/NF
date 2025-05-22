import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/apiConfig';
const ProductContext = createContext(undefined);
export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        const init = async () => {
            await fetchCategories();
            await fetchProducts();
        };
        init();
    }, []);
    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get(API_ENDPOINTS.PRODUCTS);
            setProducts(res.data);
        }
        catch (err) {
            setError('Ошибка при загрузке товаров');
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const fetchCategories = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.CATEGORIES);
            setCategories(res.data);
        }
        catch (err) {
            console.error('Ошибка при загрузке категорий:', err);
        }
    };
    const fetchProductsByCategory = async (categorySlug) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get(API_ENDPOINTS.PRODUCTS_BY_CATEGORY(categorySlug));
            setProducts(res.data);
        }
        catch (err) {
            setError('Ошибка при загрузке товаров категории');
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const fetchProductById = async (productId) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get(API_ENDPOINTS.PRODUCT_BY_ID(productId));
            return res.data;
        }
        catch (err) {
            setError('Ошибка при загрузке товара');
            console.error(err);
            return null;
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx(ProductContext.Provider, { value: {
            products,
            categories,
            selectedCategory,
            isLoading,
            error,
            setSelectedCategory,
            fetchProducts,
            fetchProductsByCategory,
            fetchProductById,
        }, children: children }));
};
export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
