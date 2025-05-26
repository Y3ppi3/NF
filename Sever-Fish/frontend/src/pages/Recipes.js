import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
const Recipes = () => {
    const recipes = [
        {
            id: 1,
            title: 'Горячий салат с копченым лососем',
            description: 'Изысканный вкус копченого лосося от Север-Рыбы идеально дополняет свежие овощи и легкую заправку. Отличный выбор для тех, кто ценит здоровое питание и премиальное качество',
            image: '/recipes/smoked-salmon-salad.jpg',
            slug: 'hot-smoked-salmon-salad'
        },
        {
            id: 2,
            title: 'Севиче из свежей рыбы',
            description: 'Свежесть и изысканность севиче от Север-Рыбы раскрывают оттенки вкуса рыбы, дополненные лимонным соком и тропическими акцентами. Попробуйте приготовить этот рецепт и убедитесь в качестве нашей продукции',
            image: '/recipes/fish-ceviche.jpg',
            slug: 'fresh-fish-ceviche'
        },
        {
            id: 3,
            title: 'Тартар из лосося с авокадо',
            description: 'Нежный тартар из свежего лосося с кремовым авокадо создаёт изысканное сочетание текстур и вкусов. Идеальная закуска для особых случаев или гурманов, ищущих утончённые вкусы',
            image: '/recipes/salmon-tartare-avocado.jpg',
            slug: 'salmon-tartare-avocado'
        },
        {
            id: 4,
            title: 'Паста с морепродуктами в сливочном соусе',
            description: 'Сочные креветки и кальмары в сливочном соусе с пастой аль денте создают идеальное сочетание. Быстрое и вкусное блюдо, которое покорит всех любителей морепродуктов',
            image: '/recipes/seafood-pasta.jpg',
            slug: 'creamy-seafood-pasta'
        }
    ];
    return (_jsxs(_Fragment, { children: [_jsx("section", { className: "bg-blue-900 text-white py-20", children: _jsxs("div", { className: "container mx-auto px-4 text-center", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-6 text-white", children: "\u0412\u043A\u0443\u0441\u043D\u044B\u0435 \u0431\u043B\u044E\u0434\u0430 \u0438\u0437 \u0440\u044B\u0431\u044B" }), _jsx("p", { className: "text-xl max-w-3xl mx-auto", children: "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0434\u043B\u044F \u0441\u0435\u0431\u044F \u043B\u0443\u0447\u0448\u0438\u0435 \u0441\u043E\u0447\u0435\u0442\u0430\u043D\u0438\u044F!" })] }) }), _jsx("section", { className: "py-16", children: _jsx("div", { className: "container mx-auto px-4", children: _jsx("div", { className: "grid md:grid-cols-2 gap-10", children: recipes.map((recipe) => (_jsxs("div", { className: "bg-white rounded-lg shadow-lg overflow-hidden", children: [_jsx("div", { className: "w-full h-80 bg-gray-200", children: _jsx("img", { src: recipe.image, alt: recipe.title, className: "w-full h-full object-cover", onError: (e) => {
                                            const fallbackImages = [
                                                '/images/products/fish-category.jpg',
                                                '/images/products/seafood-category.jpg'
                                            ];
                                            e.target.src = fallbackImages[recipe.id % 2];
                                        } }) }), _jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-blue-900 mb-4", children: recipe.title }), _jsx("p", { className: "text-gray-700 mb-4", children: recipe.description }), _jsx(Link, { to: `/recipes/${recipe.slug}`, className: "text-blue-800 font-medium hover:text-blue-600", children: "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435" })] })] }, recipe.id))) }) }) }), _jsx("section", { className: "py-16 bg-gray-50", children: _jsxs("div", { className: "container mx-auto px-4 text-center", children: [_jsx("h2", { className: "text-3xl font-bold text-blue-900 mb-6", children: "\u041F\u0440\u0438\u0433\u043E\u0442\u043E\u0432\u044C\u0442\u0435 \u0438\u0437\u044B\u0441\u043A\u0430\u043D\u043D\u044B\u0435 \u0431\u043B\u044E\u0434\u0430 \u0438\u0437 \u043D\u0430\u0448\u0435\u0439 \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u0438" }), _jsx("p", { className: "text-lg mb-8 max-w-3xl mx-auto", children: "\u041E\u0446\u0435\u043D\u0438\u0442\u0435 \u0432\u044B\u0441\u043E\u0447\u0430\u0439\u0448\u0435\u0435 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u0438 \u00AB\u0421\u0435\u0432\u0435\u0440-\u0420\u044B\u0431\u0430\u00BB \u0432 \u0441\u0432\u043E\u0438\u0445 \u043A\u0443\u043B\u0438\u043D\u0430\u0440\u043D\u044B\u0445 \u0448\u0435\u0434\u0435\u0432\u0440\u0430\u0445. \u041D\u0430\u0448\u0438 \u0440\u044B\u0431\u0430 \u0438 \u043C\u043E\u0440\u0435\u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442 \u0432\u0441\u0435 \u043F\u043E\u043B\u0435\u0437\u043D\u044B\u0435 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u0430 \u0438 \u043F\u0440\u0438\u0440\u043E\u0434\u043D\u044B\u0439 \u0432\u043A\u0443\u0441." }), _jsx(Link, { to: "/products", className: "btn-primary", children: "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u0438" })] }) })] }));
};
export default Recipes;
