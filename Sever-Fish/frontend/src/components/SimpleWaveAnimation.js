import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const SimpleWaveAnimation = ({ className = '' }) => {
    return (_jsxs("div", { className: `relative w-full h-24 overflow-hidden ${className}`, children: [_jsx("div", { className: "absolute w-full h-full", children: _jsxs("svg", { className: "w-full h-full", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 1200 120", preserveAspectRatio: "none", children: [_jsx("defs", { children: _jsx("pattern", { id: "wavePattern", x: "0", y: "0", width: "1200", height: "120", patternUnits: "userSpaceOnUse", patternTransform: "translate(0 0)", children: _jsx("path", { d: "M0,120 V73.71C47.79,51.51,103.59,41.54,158,45.71c70.36,5.37,136.33,33.31,206.8,37.5C438.64,87.57,512.34,66.33,583,47.95c69.27-18,138.3-24.88,209.4-13.08,36.15,6,69.85,17.84,104.45,29.34C989.49,95,1113,134.29,1200,67.53V120Z", fill: "#f9fafb" }) }) }), _jsx("rect", { x: "0", y: "0", width: "2400", height: "120", fill: "url(#wavePattern)", className: "animated-pattern" })] }) }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 h-2 bg-[#f9fafb]" }), _jsx("style", { children: `
                @keyframes movePattern {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-1200px); }
                }

                .animated-pattern {
                    animation: movePattern 20s linear infinite;
                    animation-fill-mode: forwards;
                    transform-origin: 0 0;
                }
                ` })] }));
};
export default SimpleWaveAnimation;
