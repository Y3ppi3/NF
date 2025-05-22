import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginAction, register as registerAction, logout as logoutAction, fetchCurrentUser } from '../store/auth/authSlice';
import { clearRedirectPath, getRedirectPath } from '../utils/storage';
import { useNavigate } from 'react-router-dom';
export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);
    const login = useCallback(async (credentials) => {
        try {
            await dispatch(loginAction(credentials)).unwrap();
            const redirectPath = getRedirectPath();
            clearRedirectPath();
            navigate(redirectPath);
            return true;
        }
        catch (error) {
            return false;
        }
    }, [dispatch, navigate]);
    const register = useCallback(async (userData) => {
        try {
            await dispatch(registerAction(userData)).unwrap();
            navigate('/');
            return true;
        }
        catch (error) {
            return false;
        }
    }, [dispatch, navigate]);
    const logout = useCallback(() => {
        dispatch(logoutAction());
        navigate('/auth');
    }, [dispatch, navigate]);
    const checkAuth = useCallback(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);
    return {
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        checkAuth
    };
};
