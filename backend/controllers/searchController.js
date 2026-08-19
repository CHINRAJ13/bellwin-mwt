const loanSearchService = require('../services/loanSearchService');
const ApiError = require('../utils/ApiError');

// @desc    Global search for loans by Loan ID or Phone Number
// @route   GET /api/search/loan/:searchValue
// @access  Private
exports.searchLoans = async (req, res, next) => {
    try {
        const { searchValue } = req.params;

        if (!searchValue) {
            return next(new ApiError(400, 'Search value is required'));
        }

        const result = await loanSearchService.searchLoans(searchValue);

        // Optional logging for debugging (as requested by user)
        // console.log(`[Search API] User: ${req.user?._id || 'Unknown'}, Type: ${result.searchType}, Value: ${searchValue}, Count: ${result.count}`);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in searchLoans controller:', error);
        next(error);
    }
};
