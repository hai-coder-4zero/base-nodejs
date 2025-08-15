const { pool } = require("../configs/database");

class Post {
  static async create(postData) {
    const {
      title,
      slug,
      content,
      excerpt,
      featured_image,
      author_id,
      category_id,
      tags,
      meta_title,
      meta_description,
      status = "draft",
    } = postData;

    const [result] = await pool.execute(
      `INSERT INTO posts (title, slug, content, excerpt, featured_image, author_id, category_id, tags, meta_title, meta_description, status, published_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        content,
        excerpt,
        featured_image,
        author_id,
        category_id,
        JSON.stringify(tags),
        meta_title,
        meta_description,
        status,
        status === "published" ? new Date() : null,
      ]
    );

    return await this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name, c.slug as category_slug
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows[0]) {
      rows[0].tags = JSON.parse(rows[0].tags || "[]");
    }

    return rows[0];
  }

  static async findBySlug(slug) {
    const [rows] = await pool.execute(
      `SELECT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name, c.slug as category_slug
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ?`,
      [slug]
    );

    if (rows[0]) {
      rows[0].tags = JSON.parse(rows[0].tags || "[]");
      // Increment view count
      await this.incrementViews(rows[0].id);
    }

    return rows[0];
  }

  static async getAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      status = "published",
      category,
      author,
      search,
    } = filters;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    let params = [];

    if (status) {
      whereClause += " AND p.status = ?";
      params.push(status);
    }

    if (category) {
      whereClause += " AND c.slug = ?";
      params.push(category);
    }

    if (author) {
      whereClause += " AND u.username = ?";
      params.push(author);
    }

    if (search) {
      whereClause += " AND (p.title LIKE ? OR p.content LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(
      `SELECT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name, c.slug as category_slug
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    return {
      posts: rows.map((post) => ({
        ...post,
        tags: JSON.parse(post.tags || "[]"),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async update(id, postData) {
    const fields = [];
    const values = [];

    Object.keys(postData).forEach((key) => {
      if (postData[key] !== undefined) {
        if (key === "tags") {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(postData[key]));
        } else if (key === "status" && postData[key] === "published") {
          fields.push(`${key} = ?`);
          fields.push("published_at = ?");
          values.push(postData[key]);
          values.push(new Date());
        } else {
          fields.push(`${key} = ?`);
          values.push(postData[key]);
        }
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    await pool.execute(
      `UPDATE posts SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id) {
    await pool.execute("DELETE FROM posts WHERE id = ?", [id]);
  }

  static async incrementViews(id) {
    await pool.execute(
      "UPDATE posts SET view_count = view_count + 1 WHERE id = ?",
      [id]
    );
  }

  static async getPopular(limit = 5) {
    const [rows] = await pool.execute(
      `SELECT p.*, u.username as author_name, c.name as category_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.status = 'published'
       ORDER BY p.view_count DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map((post) => ({
      ...post,
      tags: JSON.parse(post.tags || "[]"),
    }));
  }
}

module.exports = Post;
