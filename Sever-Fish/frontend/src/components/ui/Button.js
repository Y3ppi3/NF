import { jsx as _jsx } from "react/jsx-runtime";
export const Button = ({ variant = "primary", ...props }) => {
    const baseStyle = "px-4 py-2 rounded font-semibold transition";
    const variants = {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-200 text-black hover:bg-gray-300",
        danger: "bg-red-500 text-white hover:bg-red-600",
    };
    return _jsx("button", { className: `${baseStyle} ${variants[variant]}`, ...props });
};
