const Employee = require("../models/Employee");
const User = require("../models/User");
const { logAudit } = require("../services/auditService");
const getEmployees = async (req, res) => {
  try {
    let employees = await Employee.find({})
      .sort({ employeeId: 1 })
      .populate("userId", "name email role active");

    // Filter out employees whose associated User is inactive
    employees = employees.filter(emp => {
      // If there is no user associated, or if the user is explicitly inactive, hide them
      if (emp.userId && emp.userId.active === false) return false;
      return true;
    });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "userId",
      "name email role",
    );
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      department,
      designation,
      contact,
      phone,
      address,
      joinDate,
      password,
    } = req.body;
    const allowedRoles = ["Admin", "HR", "Manager", "Employee", "Sales"];
    if (!allowedRoles.includes(department)) {
      return res
        .status(400)
        .json({
          message: `Invalid department/role. Allowed departments are: ${allowedRoles.join(", ")}`,
        });
    }
    const userExists = await User.findOne({ email: contact });
    const employeeExists = await Employee.findOne({ contact });
    if (userExists || employeeExists) {
      return res
        .status(400)
        .json({ message: "Email is already in use by another user" });
    }
    // Create User (let User hooks:beforeSave handle hashed password automatically)
    const user = await User.create({
      name: `${firstName} ${lastName || ""}`.trim(),
      email: contact,
      password: password || "password123",
      role: department,
    });
    const createdEmployee = await Employee.create({
      userId: user._id,
      employeeId,
      firstName,
      lastName,
      department,
      designation,
      contact,
      phone,
      address,
      joinDate,
    });
    const { notifyHR } = require("../services/notificationService");
    await notifyHR({
      module: "Employees",
      referenceId: createdEmployee._id || createdEmployee.id,
      title: "New Employee Added",
      message: `${firstName} ${lastName || ""} has been added to the system as ${designation || "Employee"}.`,
      type: "info",
    });
    await logAudit({
      user: req.user,
      action: "CREATE",
      module: "Employee",
      targetId: createdEmployee._id,
      description: `Employee created: ${firstName} ${lastName || ""} (${employeeId})`,
      ipAddress: req.ip,
    });
    res.status(201).json(createdEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    const {
      firstName,
      lastName,
      contact,
      phone,
      department,
      designation,
      employeeId,
      salary,
      joinDate,
      address,
      password,
    } = req.body;
    console.log("--- UPDATE EMPLOYEE REQUEST ---");
    console.log("req.body:", req.body);
    console.log("employee.contact:", employee.contact);
    console.log("employee.userId:", employee.userId);
    const allowedRoles = ["Admin", "HR", "Manager", "Employee", "Sales"];
    if (department && !allowedRoles.includes(department)) {
      return res
        .status(400)
        .json({
          message: `Invalid department/role. Allowed departments are: ${allowedRoles.join(", ")}`,
        });
    }
    let user = null;
    if (employee.userId) {
      user = await User.findById(employee.userId);
    }
    if (!user && contact && contact.includes("@")) {
      const existingUser = await User.findOne({ email: contact });
      if (existingUser) {
        user = existingUser;
      } else {
        const name =
          `${firstName || employee.firstName} ${lastName || employee.lastName || ""}`.trim();
        user = await User.create({
          name: name,
          email: contact,
          password: password || "password123",
          role: department || employee.department || "Employee",
        });
      }
      employee.userId = user._id || user.id;
    }
    if (user) {
      if (contact && contact !== user.email) {
        const emailExists = await User.findOne({ email: contact });
        const empEmailExists = await Employee.findOne({ contact });
        if (
          (emailExists &&
            String(emailExists.id || emailExists._id) !==
              String(user.id || user._id)) ||
          (empEmailExists &&
            String(empEmailExists.id || empEmailExists._id) !==
              String(employee.id || employee._id))
        ) {
          console.log("--- ERROR TRIGGERED ---");
          console.log("user.id:", user.id, "user._id:", user._id);
          console.log(
            "employee.id:",
            employee.id,
            "employee._id:",
            employee._id,
          );
          console.log("emailExists.id:", emailExists ? emailExists.id : null);
          console.log(
            "empEmailExists.id:",
            empEmailExists ? empEmailExists.id : null,
          );
          console.log("Returning 400 for user email check");
          return res
            .status(400)
            .json({ message: "Email is already in use by another user" });
        }
        user.email = contact;
      }
      if (firstName || lastName) {
        user.name =
          `${firstName || employee.firstName} ${lastName || employee.lastName || ""}`.trim();
      }
      if (department) user.role = department;
      if (password && password.trim() !== "") {
        user.password = password;
      }
      await user.save();
    }
    if (firstName) employee.firstName = firstName;
    if (lastName !== undefined) employee.lastName = lastName;
    if (contact) employee.contact = contact;
    if (phone !== undefined) employee.phone = phone;
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (employeeId) employee.employeeId = employeeId;
    if (salary) employee.salary = salary;
    if (joinDate) employee.joinDate = joinDate;
    if (address !== undefined) employee.address = address;
    const updatedEmployee = await employee.save();
    const { notifyHR } = require("../services/notificationService");
    await notifyHR({
      module: "Employees",
      referenceId: updatedEmployee._id || updatedEmployee.id,
      title: "Employee Profile Updated",
      message: `Profile details for ${updatedEmployee.firstName} ${updatedEmployee.lastName || ""} have been updated.`,
      type: "info",
    });
    await logAudit({
      user: req.user,
      action: "UPDATE",
      module: "Employee",
      targetId: updatedEmployee._id,
      description: `Employee profile updated: ${updatedEmployee.firstName} ${updatedEmployee.lastName || ""}`,
      ipAddress: req.ip,
    });
    res.json(updatedEmployee);
  } catch (error) {
    console.error("Update Employee Error:", error);
    res
      .status(400)
      .json({
        message: error.message || "Internal Server Error during update",
      });
  }
};
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      const employeeName =
        `${employee.firstName} ${employee.lastName || ""}`.trim();
      const userId = employee.userId;
      await employee.deleteOne();
      if (userId) {
        try {
          // 1. Delete HR specific records
          const Attendance = require('../models/Attendance');
          const Leave = require('../models/Leave');
          const Salary = require('../models/Salary');
          const Notification = require('../models/Notification');
          const AuditLog = require('../models/AuditLog');
          
          if (Attendance) await Attendance.deleteMany({ employeeId: req.params.id });
          if (Leave) await Leave.deleteMany({ employeeId: req.params.id });
          if (Salary) await Salary.deleteMany({ employeeId: req.params.id });
          if (Notification) await Notification.deleteMany({ userId });
          if (AuditLog) await AuditLog.deleteMany({ userId });

          // 2. Nullify references in core business records to preserve business data
          const sequelize = require('../config/sequelize');
          const nullifyQueries = [
            `UPDATE Orders SET createdById = NULL WHERE createdById = ${userId}`,
            `UPDATE Orders SET updatedById = NULL WHERE updatedById = ${userId}`,
            `UPDATE Tickets SET assignedToId = NULL WHERE assignedToId = ${userId}`,
            `UPDATE Tickets SET submittedById = NULL WHERE submittedById = ${userId}`,
            `UPDATE Tasks SET assignedById = NULL WHERE assignedById = ${userId}`
          ];
          for (let q of nullifyQueries) {
            try { await sequelize.query(q); } catch (e) {} 
          }

          // 3. Force Delete the User completely (bypass remaining constraints like Social/Posts)
          await sequelize.query('PRAGMA foreign_keys = OFF;');
          await sequelize.query(`DELETE FROM User WHERE id = ${userId}`);
          await sequelize.query('PRAGMA foreign_keys = ON;');

        } catch (userErr) {
          console.error("Could not completely delete user due to constraints:", userErr);
        }
      }
      await logAudit({
        user: req.user,
        action: "DELETE",
        module: "Employee",
        targetId: req.params.id,
        description: `Employee deleted: ${employeeName}`,
        ipAddress: req.ip,
      });
      res.json({ message: "Employee removed successfully" });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getMe = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id }).populate(
      "userId",
      "name email role",
    );
    if (!employee) {
      return res
        .status(404)
        .json({ message: "Employee record not found for this user" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateMe = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    const { firstName, lastName, phone, email, address, password } = req.body;
    if (employee.userId) {
      const user = await User.findById(employee.userId);
      if (user) {
        if (email && email !== user.email) {
          const emailExists = await User.findOne({ email });
          if (emailExists && emailExists.id !== user.id)
            return res
              .status(400)
              .json({ message: "Email is already in use by another user" });
          user.email = email;
        }
        if (firstName || lastName) {
          user.name =
            `${firstName || employee.firstName} ${lastName || employee.lastName || ""}`.trim();
        }
        if (password && password.trim() !== "") user.password = password;
        await user.save();
      }
    }
    if (firstName) employee.firstName = firstName;
    if (lastName !== undefined) employee.lastName = lastName;
    if (email !== undefined) employee.contact = email;
    if (phone !== undefined) employee.phone = phone;
    if (address !== undefined) employee.address = address;
    await employee.save();
    const populatedEmployee = await Employee.findOne({
      userId: req.user._id,
    }).populate("userId", "name email role");
    res.json(populatedEmployee);
  } catch (error) {
    console.error("Update Profile Error:", error);
    res
      .status(400)
      .json({
        message: error.message || "Internal Server Error during update",
      });
  }
};
const updatePerformance = async (req, res) => {
  try {
    const {
      taskScore,
      attendanceScore,
      targetScore,
      overall,
      rating,
      appraisal,
      notes,
    } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    employee.performanceOverrides = {
      taskScore,
      attendanceScore,
      targetScore,
      overall,
      rating,
      appraisal,
      notes,
    };
    await employee.save();

    await logAudit({
      user: req.user,
      action: "UPDATE",
      module: "Employee",
      targetId: employee._id || employee.id,
      description: `Performance updated for ${employee.firstName} ${employee.lastName || ""}`,
      ipAddress: req.ip,
    });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getMe,
  updateMe,
  updatePerformance,
};
