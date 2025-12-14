import bcrypt from "bcryptjs";
import pool from "../config/database.js";
import { generateToken } from "../middleware/auth.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const connection = await pool.getConnection();
    
    const [existingUser] = await connection.execute(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await connection.execute(
      "INSERT INTO users (username, email, password, display_name) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, username]
    );

    connection.release();

    const userId = result.insertId;
    const token = generateToken(userId);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: userId,
        username,
        email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Get user
    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      "SELECT id, username, email, password FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ error: "Invalid email or password" });
    }

    connection.release();

    const token = generateToken(user.id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const me = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      "SELECT id, username, email, display_name, bio, avatar_url, followers, following FROM users WHERE id = ?",
      [req.userId]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};
