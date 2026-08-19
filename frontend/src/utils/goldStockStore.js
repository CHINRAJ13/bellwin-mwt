export const getAllGoldStocks = () => {
    try {
        const stocks = localStorage.getItem('goldStocks');
        return stocks ? JSON.parse(stocks) : [];
    } catch (e) {
        return [];
    }
};

export const saveGoldStock = (stock) => {
    try {
        const stocks = getAllGoldStocks();
        stocks.push(stock);
        localStorage.setItem('goldStocks', JSON.stringify(stocks));
        return true;
    } catch (e) {
        return false;
    }
};
