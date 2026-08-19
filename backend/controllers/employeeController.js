const ApiError = require('../utils/ApiError');
const Employee = require('../models/Employee');
const Counter = require('../models/Counter');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadFromBuffer = (buffer, folder, public_id) => {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
            { folder, public_id },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
    });
};

const initializeEmployeeIds = async () => {
    try {
        const employeesWithoutId = await Employee.find({ 
            $or: [{ employeeId: { $exists: false } }, { employeeId: null }, { employeeId: '' }]
        }).sort({ createdAt: 1 });
        
        let currentSeq = 0;
        const highestEmployee = await Employee.findOne({ employeeId: { $regex: /^BEL-\d{4,}$/ } }).sort({ employeeId: -1 });
        
        if (highestEmployee && highestEmployee.employeeId) {
            const match = highestEmployee.employeeId.match(/^BEL-(\d+)$/);
            if (match) {
                currentSeq = parseInt(match[1], 10);
            }
        }

        for (const emp of employeesWithoutId) {
            currentSeq++;
            const seqStr = currentSeq.toString().padStart(4, '0');
            emp.employeeId = `BEL-${seqStr}`;
            await emp.save();
        }

        if (currentSeq > 0) {
            await Counter.findByIdAndUpdate(
                'employeeId',
                { $max: { seq: currentSeq } },
                { returnDocument: 'after', upsert: true }
            );
        }
        // console.log('Employee IDs initialized successfully.');
    } catch (error) {
        console.error('Error initializing Employee IDs:', error);
    }
};

// @desc    Get next upcoming Employee ID
// @route   GET /api/employees/nextid (or /next-id)
// @access  Private
const getNextEmployeeId = async (req, res, next) => {
    try {
        const counter = await Counter.findById('employeeId');
        const nextSeq = counter ? counter.seq + 1 : 1;
        const nextId = `BEL-${nextSeq.toString().padStart(4, '0')}`;
        res.json({ nextId, employeeId: nextId }); // Sending both formats for compatibility
    } catch (error) {
        next(new ApiError(500, 'Server error fetching next ID' ));
    }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res, next) => {
    try {
        const { search, status, branch, page = 1, limit = 10 } = req.query;
        let query = {};
        
        if (status) query.status = new RegExp(status, 'i');
        if (branch) query.branch = new RegExp('^' + branch.trim() + '$', 'i');
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } }
            ];
        }
        
        const limitNum = parseInt(limit, 10);
        const skip = (parseInt(page, 10) - 1) * limitNum;
        
        const totalCount = await Employee.countDocuments(query);
        const employees = await Employee.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
            
        res.json({
            employees,
            totalPages: Math.ceil(totalCount / limitNum),
            currentPage: parseInt(page, 10)
        });
    } catch (error) {
        next(new ApiError(500, 'Server error' ));
    }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (employee) {
            res.json(employee);
        } else {
            next(new ApiError(404, 'Employee not found' ));
        }
    } catch (error) {
        next(new ApiError(500, 'Server error' ));
    }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createEmployee = async (req, res, next) => {
    try {
        // Check for duplicate username before proceeding
        if (req.body.username) {
            const existingUser = await User.findOne({ username: req.body.username.trim() });
            if (existingUser) {
                return next(new ApiError(400, 'Username already exists. Please choose another one.'));
            }
        }

        const counter = await Counter.findByIdAndUpdate(
            'employeeId',
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );
        const nextId = `BEL-${counter.seq.toString().padStart(4, '0')}`;

        let documentUrl = '';
        if (req.file) {
            try {
                const result = await uploadFromBuffer(req.file.buffer, 'employees');
                documentUrl = result.secure_url;
            } catch (err) {
                return next(new ApiError(500, 'Error uploading file to Cloudinary'));
            }
        }

        const employee = new Employee({
            ...req.body,
            employeeId: nextId,
            documentUrl
        });
        const createdEmployee = await employee.save();

        let password = req.body.password;
        if (!password && req.body.firstName && req.body.dob) {
            const birthYear = new Date(req.body.dob).getFullYear();
            password = `${req.body.firstName}${birthYear}`;
        }

        // Create User account if username is provided
        if (req.body.username && password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await User.create({
                username: req.body.username.trim(),
                password: hashedPassword,
                role: req.body.role === 'Admin' ? 'admin' : 'employee',
                employeeId: createdEmployee._id
            });
        }

        res.status(201).json(createdEmployee);
    } catch (error) {
        console.error(error);
        next(new ApiError(400, error.message || 'Invalid employee data'));
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (employee) {
            Object.assign(employee, req.body);
            if (req.file) {
                try {
                    const result = await uploadFromBuffer(req.file.buffer, 'employees');
                    employee.documentUrl = result.secure_url;
                } catch (err) {
                    return next(new ApiError(500, 'Error uploading file to Cloudinary'));
                }
            }
            const updatedEmployee = await employee.save();

            // Update associated User account
            if (req.body.username) {
                const user = await User.findOne({ employeeId: employee._id });
                if (user) {
                    user.username = req.body.username.trim();
                    if (req.body.password && req.body.password !== '') {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(req.body.password, salt);
                    }
                    if (req.body.role) {
                        user.role = req.body.role === 'Admin' ? 'admin' : 'employee';
                    }
                    await user.save();
                }
            }

            res.json(updatedEmployee);
        } else {
            next(new ApiError(404, 'Employee not found' ));
        }
    } catch (error) {
        next(new ApiError(400, 'Invalid employee data' ));
    }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (employee) {
            await User.deleteOne({ employeeId: employee._id });
            await Employee.deleteOne({ _id: employee._id });
            res.json({ message: 'Employee removed' });
        } else {
            next(new ApiError(404, 'Employee not found' ));
        }
    } catch (error) {
        next(new ApiError(500, 'Server error' ));
    }
};

// @desc    Toggle employee status
// @route   PATCH /api/employees/toggle-status/:id
// @access  Private
const toggleEmployeeStatus = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return next(new ApiError(404, 'Employee not found'));
        }
        employee.status = employee.status === 'Active' ? 'Inactive' : 'Active';
        await employee.save();
        res.json({ success: true, status: employee.status });
    } catch (error) {
        next(new ApiError(500, 'Server error toggling status'));
    }
};

// @desc    Reset employee password
// @route   POST /api/employees/reset-password
// @access  Private/Admin
const resetPassword = async (req, res, next) => {
    try {
        const { id, newPassword } = req.body;
        if (!newPassword || newPassword === '') {
            return next(new ApiError(400, 'Password is required'));
        }

        const employee = await Employee.findById(id);
        if (!employee) {
            return next(new ApiError(404, 'Employee not found'));
        }

        const user = await User.findOne({ employeeId: employee._id });
        if (user) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            res.json({ message: 'Password reset successfully' });
        } else {
            return next(new ApiError(404, 'User account not found for this employee'));
        }
    } catch (error) {
        next(new ApiError(500, 'Server error' ));
    }
};

// @desc    Promote or Demote employee
// @route   PATCH /api/employees/:id/promote
// @access  Private/Admin
const promoteEmployee = async (req, res, next) => {
    try {
        const { role, salary, reason } = req.body;
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return next(new ApiError(404, 'Employee not found'));
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    ...(role ? { role } : {}),
                    ...(salary !== undefined ? { salary: Number(salary) } : {})
                },
                $push: {
                    promotionHistory: {
                        role: role || employee.role,
                        salary: salary !== undefined ? Number(salary) : employee.salary,
                        reason: reason || 'Not specified'
                    }
                }
            },
            { returnDocument: 'after' }
        );

        // Update associated User account role if role changed
        if (role) {
            const user = await User.findOne({ employeeId: employee._id });
            if (user) {
                user.role = role === 'Admin' ? 'admin' : 'employee';
                await user.save();
            }
        }

        res.json(updatedEmployee);
    } catch (error) {
        next(new ApiError(500, 'Server error promoting employee'));
    }
};

const getEmployeeStats = async (req, res, next) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        const activeEmployees = await Employee.countDocuments({ status: 'Active' });
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newThisMonth = await Employee.countDocuments({ createdAt: { $gte: startOfMonth } });

        const distinctRoles = await Employee.distinct('role');
        const totalRoles = distinctRoles.length;

        res.json({
            totalEmployees,
            activeEmployees,
            newThisMonth,
            totalRoles
        });
    } catch (error) {
        next(new ApiError(500, 'Server error fetching employee stats'));
    }
};

module.exports = {
    getEmployees,
    getEmployeeStats,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    initializeEmployeeIds,
    getNextEmployeeId,
    toggleEmployeeStatus,
    resetPassword,
    promoteEmployee
};
