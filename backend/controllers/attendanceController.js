const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

/* =============================
   GET ATTENDANCE LIST
   GET /api/attendance?date=YYYY-MM-DD&month=YYYY-MM
============================= */
exports.getAttendance = async (req, res) => {
  try {
    const { date, month, employeeId } = req.query;
    const filter = {};

    if (date) filter.date = date;
    if (month) filter.date = { $regex: `^${month}` };
    if (employeeId) filter.employeeId = employeeId;

    const records = await Attendance.find(filter)
      .populate('employeeId', 'firstName lastName employeeId designation branchId departmentId photo')
      .sort({ date: -1, createdAt: -1 });

    return res.json({ success: true, records });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   MARK ATTENDANCE (SINGLE)
   POST /api/attendance/mark
============================= */
exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, note } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ success: false, message: 'employeeId, date and status are required' });
    }

    // Calculate working hours
    let workingHours = 0;
    if (checkIn && checkOut) {
      const [inH, inM] = checkIn.split(':').map(Number);
      const [outH, outM] = checkOut.split(':').map(Number);
      workingHours = parseFloat(((outH * 60 + outM - (inH * 60 + inM)) / 60).toFixed(2));
      if (workingHours < 0) workingHours = 0;
    }

    const record = await Attendance.findOneAndUpdate(
      { employeeId, date },
      {
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        workingHours,
        status,
        note: note || '',
        markedBy: req.user?.id || null
      },
      { upsert: true, returnDocument: 'after' }
    );

    return res.json({ success: true, message: 'Attendance marked', record });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   BULK MARK ATTENDANCE
   POST /api/attendance/bulk
============================= */
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { records } = req.body; // Array of { employeeId, date, status, checkIn, checkOut }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'records array is required' });
    }

    const ops = records.map(r => {
      let workingHours = 0;
      if (r.checkIn && r.checkOut) {
        const [inH, inM] = r.checkIn.split(':').map(Number);
        const [outH, outM] = r.checkOut.split(':').map(Number);
        workingHours = parseFloat(((outH * 60 + outM - (inH * 60 + inM)) / 60).toFixed(2));
        if (workingHours < 0) workingHours = 0;
      }

      return {
        updateOne: {
          filter: { employeeId: r.employeeId, date: r.date },
          update: {
            $set: {
              checkIn: r.checkIn || null,
              checkOut: r.checkOut || null,
              workingHours,
              status: r.status,
              note: r.note || '',
              markedBy: req.user?.id || null
            }
          },
          upsert: true
        }
      };
    });

    await Attendance.bulkWrite(ops);
    return res.json({ success: true, message: `${records.length} records updated` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   GET ATTENDANCE SUMMARY (for dashboard)
   GET /api/attendance/summary?month=YYYY-MM
============================= */
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { month } = req.query;
    const dateFilter = month ? { $regex: `^${month}` } : {};

    const summary = await Attendance.aggregate([
      { $match: { date: dateFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return res.json({ success: true, summary });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   DELETE ATTENDANCE RECORD
   DELETE /api/attendance/:id
============================= */
exports.deleteAttendance = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Attendance record deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
