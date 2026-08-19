const { Customer } = require('../models/Customer');
const Loan = require('../models/Loan');
const ApiError = require('../utils/ApiError');

/**
 * Validates and identifies the search query type.
 * @param {string} query
 * @returns {object} { searchType: 'phone' | 'loanId', value: string }
 */
const detectSearchType = (query) => {
    const trimmedQuery = query.trim();
    // Assuming a 10-digit number is a mobile number
    if (/^\d{10}$/.test(trimmedQuery)) {
        return { searchType: 'phone', value: trimmedQuery };
    }
    // Otherwise treat as a general text query (Loan ID or Name)
    return { searchType: 'text', value: trimmedQuery };
};

/**
 * Core search function reused across all ERP modules.
 * @param {string} searchValue 
 * @returns {object} Standardized search results
 */
exports.searchLoans = async (searchValue) => {
    if (!searchValue) {
        throw new ApiError(400, 'Search value is required');
    }

    const { searchType, value } = detectSearchType(searchValue);
    let loans = [];

    if (searchType === 'phone') {
        // Find customer by phone number
        const customer = await Customer.findOne({ mobileNumber: value }).lean();
        if (customer) {
            // Find all loans for this customer
            const customerLoans = await Loan.find({ 
                $or: [{ customerId: customer.customerId }, { customerObjectId: customer._id }] 
            })
            .sort({ createdAt: -1 })
            .lean();
            
            // Attach customer object to each loan result for uniform structure
            loans = customerLoans.map(loan => ({
                loan,
                customer,
                branch: loan.branch || null,
                scheme: loan.scheme || null
            }));
        }
    } else if (searchType === 'text') {
        // First try specific loan by ID
        const loan = await Loan.findOne({ loanId: value.toUpperCase() }).lean();
        
        if (loan) {
            // Find associated customer
            const customer = await Customer.findOne({ 
                $or: [{ customerId: loan.customerId }, { _id: loan.customerObjectId }] 
            }).lean();

            loans = [{
                loan,
                customer: customer || null,
                branch: loan.branch || null,
                scheme: loan.scheme || null
            }];
        } else {
            // Try by customer name
            const customers = await Customer.find({ customerName: { $regex: new RegExp(value, 'i') } }).lean();
            if (customers.length > 0) {
                const customerIds = customers.map(c => c.customerId);
                const customerObjectIds = customers.map(c => c._id);
                const customerLoans = await Loan.find({ 
                    $or: [{ customerId: { $in: customerIds } }, { customerObjectId: { $in: customerObjectIds } }] 
                }).sort({ createdAt: -1 }).lean();
                
                loans = customerLoans.map(loan => {
                    const customer = customers.find(c => c.customerId === loan.customerId || c._id.toString() === loan.customerObjectId?.toString());
                    return {
                        loan,
                        customer: customer || null,
                        branch: loan.branch || null,
                        scheme: loan.scheme || null
                    };
                });
            }
        }
    }

    return {
        success: true,
        searchType,
        count: loans.length,
        results: loans,
        message: loans.length === 0 ? 'No matching loans found.' : 'Loans found successfully.'
    };
};
