import { promisePool } from "../configs/database.js";

export const getAllUsers = async () => {
  const [rows] = await promisePool.execute("SELECT * FROM users");
  return rows;
};

export const getUserById = async (id) => {
  const [rows] = await promisePool.execute("SELECT * FROM users WHERE id = ?", [
    id,
  ]);
  return rows[0];
};

export const createUser = async (userData) => {
  const { name, email } = userData;
  const [result] = await promisePool.execute(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email]
  );

  return {
    id: result.insertId,
    name,
    email,
  };
};

export const updateUser = async (id, userData) => {
  const { name, email } = userData;
  const [result] = await promisePool.execute(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return await getUserById(id);
};

export const deleteUser = async (id) => {
  const [result] = await promisePool.execute("DELETE FROM users WHERE id = ?", [
    id,
  ]);

  return result.affectedRows > 0;
};
