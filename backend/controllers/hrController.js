const ApiError = require('../utils/ApiError');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Counter = require('../models/Counter');
const Attendance = require('../models/Attendance');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// @desc    Create HR user (Employee + User in one transaction)
// @route   POST /api/hr/create
// @access  Private/Admin
const createHR = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            firstName, lastName, fatherName, gender, dob,
            mobile, phone, email,
            address, city, state, pincode,
            branch, department, designation,
            joiningDate, status,
            username, password, confirmPassword,
            photo
        } = req.body;

        // Validation
        if (!firstName || !email || !designation || !joiningDate) {
            throw new ApiError(400, 'First name, email, designation and joining date are required');
        }

        if (!username || !password) {
            throw new ApiError(400, 'Username and password are required');
        }

        if (password !== confirmPassword) {
            throw new ApiError(400, 'Passwords do not match');
        }

        // Check for duplicate username
        const existingUser = await User.findOne({ username: username.trim() });
        if (existingUser) {
            throw new ApiError(400, 'Username already exists. Please choose another one.');
        }

        // Check for duplicate email
        const existingEmail = await Employee.findOne({ email: email.trim() });
        if (existingEmail) {
            throw new ApiError(400, 'Email already exists.');
        }

        // Generate Employee ID
        const counter = await Counter.findByIdAndUpdate(
            'employeeId',
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true, session }
        );
        const employeeId = `BEL-${counter.seq.toString().padStart(4, '0')}`;

        // Create Employee document
        const [employee] = await Employee.create([{
            employeeId,
            firstName: firstName.trim().toUpperCase(),
            lastName: (lastName || '').trim().toUpperCase(),
            fatherName: (fatherName || '').trim().toUpperCase(),
            gender: gender || '',
            dob: dob || null,
            mobile: mobile || '',
            phone: phone || '',
            email: email.trim(),
            address: (address || '').trim().toUpperCase(),
            city: (city || '').trim().toUpperCase(),
            state: (state || '').trim().toUpperCase(),
            pincode: pincode || '',
            branch: branch || '',
            department: department || '',
            designation: (designation || '').trim().toUpperCase(),
            joiningDate,
            status: status || 'Active',
            username: username.trim(),
            role: 'HR',
            permissions: [],
            photo: photo || '',
        }], { session });

        // Hash password and create User document
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create([{
            username: username.trim(),
            password: hashedPassword,
            role: 'hr',
            employeeId: employee._id,
            status: status || 'Active'
        }], { session });

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: 'HR user created successfully',
            employee
        });
    } catch (error) {
        await session.abortTransaction();

        if (error instanceof ApiError) {
            return next(error);
        }
        console.error('Error creating HR:', error);
        next(new ApiError(400, error.message || 'Failed to create HR user'));
    } finally {
        session.endSession();
    }
};

// @desc    Get HR dashboard statistics
// @route   GET /api/hr/dashboard-stats
// @access  Private/HR
const getDashboardStats = async (req, res, next) => {
    try {
        // Total active employees
        const totalEmployees = await Employee.countDocuments({ status: 'Active' });

        // Today's date string YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // Present today
        const presentToday = await Attendance.countDocuments({
            date: today,
            status: { $in: ['Present', 'Half Day'] }
        });

        // Absent today
        const absentToday = await Attendance.countDocuments({
            date: today,
            status: 'Absent'
        });

        // New joiners this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const newJoiners = await Employee.countDocuments({
            joiningDate: { $gte: startOfMonth },
            status: 'Active'
        });

        res.json({
            success: true,
            stats: {
                totalEmployees,
                presentToday,
                absentToday,
                newJoiners
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        next(new ApiError(500, 'Failed to fetch dashboard statistics'));
    }
};

// @desc    Get logged-in HR user's profile
// @route   GET /api/hr/profile
// @access  Private/HR
const getHRProfile = async (req, res, next) => {
    try {
        const employee = req.user.employeeId;

        if (!employee) {
            return next(new ApiError(404, 'HR profile not found'));
        }

        res.json({
            success: true,
            profile: employee
        });
    } catch (error) {
        next(new ApiError(500, 'Failed to fetch HR profile'));
    }
};

module.exports = { createHR, getDashboardStats, getHRProfile };
