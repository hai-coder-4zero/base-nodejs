const { pool } = require("../configs/database");
const bcrypt = require("bcryptjs");

class User {
  static async create(userData) {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      role = "user",
    } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)",
      [username, email, hashedPassword, first_name, last_name, role]
    );

    return await this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id, username, email, first_name, last_name, avatar, bio, role, is_active, created_at, updated_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return rows[0];
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];

    Object.keys(userData).forEach((key) => {
      if (userData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    await pool.execute(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id) {
    await pool.execute("DELETE FROM users WHERE id = ?", [id]);
  }

  static async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      "SELECT id, username, email, first_name, last_name, avatar, role, is_active, created_at FROM users LIMIT ? OFFSET ?",
      [limit, offset]
    );

    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM users"
    );
    const total = countResult[0].total;

    return {
      users: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
