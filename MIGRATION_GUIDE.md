# Database Migration Guide

## Quick Start - Run This Now

### Option 1: Command Line (Recommended)

```bash
# From project root: C:\Users\cjala\trendle

mysql -u root -p < backend/database/schema.sql
```

**What to do:**
1. Open PowerShell or Command Prompt
2. Navigate to: `C:\Users\cjala\trendle`
3. Run the command above
4. Enter your MySQL password
5. Done! ✅

---

## How It Works

The schema.sql file contains:

```sql
-- Creates database
CREATE DATABASE IF NOT EXISTS trendle;

-- Creates 8 tables:
-- 1. users - User accounts
-- 2. posts - User posts
-- 3. communities - Groups
-- 4. user_communities - Membership
-- 5. follows - Relationships
-- 6. comments - Post comments
-- 7. likes - Like system
-- 8. messages - Direct messages
-- 9. sessions - Token tracking
```

---

## Migration Methods

### Method 1: MySQL Command (Fastest)
```bash
mysql -u root -p < backend/database/schema.sql
```
- Runs all SQL in one command
- Prompts for password
- Automatic

### Method 2: MySQL Client
```bash
# Start MySQL
mysql -u root -p

# In MySQL terminal:
source backend/database/schema.sql;
```

### Method 3: Automatic on Server Start (Now Built-in)
```bash
cd backend
npm install
npm run dev
```
- Backend automatically runs migrations
- Creates database if doesn't exist
- Updates tables if schema changes
- Logs which migrations ran

---

## Verify Migration Worked

### Check database was created:
```bash
mysql -u root -p -e "SHOW DATABASES;"
# Should list: trendle
```

### Check tables were created:
```bash
mysql -u root -p -D trendle -e "SHOW TABLES;"
# Should list: users, posts, communities, etc.
```

### Check table structure:
```bash
mysql -u root -p -D trendle -e "DESCRIBE users;"
# Should show all columns
```

---

## Troubleshooting

### Error: "Access denied for user 'root'"
- Check MySQL password is correct
- Try: `mysql -u root -p`

### Error: "Can't find file"
- Make sure you're in project root: `C:\Users\cjala\trendle`
- Check file exists: `ls backend/database/schema.sql`

### Error: "database already exists"
- This is OK! The schema has `IF NOT EXISTS`
- Existing tables won't be overwritten
- New tables will be added

### Error: "syntax error"
- Check MySQL version (need 5.7+)
- Try running one statement at a time in MySQL client

---

## Reset Database

To completely reset and start fresh:

```bash
# Delete database
mysql -u root -p -e "DROP DATABASE IF EXISTS trendle;"

# Recreate everything
mysql -u root -p < backend/database/schema.sql
```

---

## Tables Created

| Table | Purpose |
|-------|---------|
| users | User accounts, profiles |
| posts | User posts/content |
| communities | Groups/communities |
| user_communities | Who joined what |
| follows | User relationships |
| comments | Post comments |
| likes | Likes on posts/comments |
| messages | Direct messages |
| sessions | Active tokens |

---

## Next Steps

After migration:

1. **Start backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   npm run dev
   ```

3. **Test registration:**
   - Go to http://localhost:5173/signup
   - Create account
   - Check data in database:
     ```bash
     mysql -u root -p -D trendle -e "SELECT * FROM users;"
     ```

---

## Automatic Migration

The backend now automatically runs migrations on startup!

**What happens:**
1. `npm run dev` starts server
2. Server reads `backend/database/schema.sql`
3. Executes all CREATE TABLE statements
4. Logs which migrations ran
5. Server starts and API is ready

This means you don't have to manually run SQL anymore - just start the backend and database is ready!

---

## Schema Details

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,      -- bcrypt hashed
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(255),
  followers INT DEFAULT 0,
  following INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP ON UPDATE NOW(),
  INDEX idx_username (username),
  INDEX idx_email (email)
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,                -- Links to users.id
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP ON UPDATE NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Similar structures for other tables with proper relationships.

---

## Production Notes

- All tables use `IF NOT EXISTS` so migrations are safe to re-run
- Foreign keys ensure data integrity
- Indexes optimize queries
- Timestamps auto-track changes
- UNIQUE constraints prevent duplicates

Ready to migrate! 🚀
