const Salary = require('../models/Salary');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

/* =============================
   GET SALARY LIST
   GET /api/salary?month=YYYY-MM&employeeId=...
============================= */
exports.getSalaries = async (req, res) => {
  try {
    const { month, employeeId } = req.query;
    const filter = {};
    if (month) filter.month = month;
    if (employeeId) filter.employeeId = employeeId;

    const salaries = await Salary.find(filter)
      .populate('employeeId', 'firstName lastName employeeId designation branchId departmentId photo')
      .sort({ month: -1, createdAt: -1 });

    return res.json({ success: true, salaries });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   GET SINGLE SALARY (PAYSLIP)
   GET /api/salary/:id
============================= */
exports.getSalaryById = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id)
      .populate('employeeId', 'firstName lastName employeeId designation branchId departmentId mobile email photo joiningDate');

    if (!salary) return res.status(404).json({ success: false, message: 'Salary record not found' });

    return res.json({ success: true, salary });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   GENERATE SALARY
   POST /api/salary/generate
============================= */
exports.generateSalary = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      basicSalary,
      allowances,
      deductions,
      workingDays,
      remarks
    } = req.body;

    if (!employeeId || !month || !basicSalary) {
      return res.status(400).json({ success: false, message: 'employeeId, month and basicSalary are required' });
    }

    // Calculate attendance (present days in the month)
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: { $regex: `^${month}` },
      status: { $in: ['Present', 'Half Day'] }
    });

    const presentDays = attendanceRecords.reduce((sum, r) => {
      return sum + (r.status === 'Present' ? 1 : 0.5);
    }, 0);

    // Calculate totals
    const totalAllowances = Object.values(allowances || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const totalDeductions = Object.values(deductions || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const netSalary = parseFloat((basicSalary + totalAllowances - totalDeductions).toFixed(2));

    const salary = await Salary.findOneAndUpdate(
      { employeeId, month },
      {
        basicSalary: Number(basicSalary),
        allowances: {
          hra: Number(allowances?.hra || 0),
          transport: Number(allowances?.transport || 0),
          medical: Number(allowances?.medical || 0),
          other: Number(allowances?.other || 0)
        },
        deductions: {
          pf: Number(deductions?.pf || 0),
          esi: Number(deductions?.esi || 0),
          tax: Number(deductions?.tax || 0),
          other: Number(deductions?.other || 0)
        },
        totalAllowances,
        totalDeductions,
        netSalary,
        workingDays: Number(workingDays || 26),
        presentDays,
        status: 'Generated',
        generatedBy: req.user?.id,
        remarks: remarks || ''
      },
      { upsert: true, returnDocument: 'after' }
    );

    return res.json({ success: true, message: 'Salary generated', salary });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   MARK SALARY AS PAID
   PATCH /api/salary/:id/pay
============================= */
exports.markAsPaid = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      { status: 'Paid', paidOn: new Date() },
      { returnDocument: 'after' }
    );

    if (!salary) return res.status(404).json({ success: false, message: 'Salary record not found' });

    return res.json({ success: true, message: 'Marked as Paid', salary });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   DELETE SALARY RECORD
   DELETE /api/salary/:id
============================= */
exports.deleteSalary = async (req, res) => {
  try {
    await Salary.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Salary record deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
