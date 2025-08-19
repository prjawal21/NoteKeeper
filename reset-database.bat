@echo off
echo ========================================
echo NoteKeeper Database Reset
Echo WARNING: This will delete all data in the database!
echo ========================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorlevel% == 0 (
    echo Running with administrator privileges
) else (
    echo Please run this script as administrator
    pause
    exit /b 1
)

:: Check if MySQL is running
net start | findstr /i "mysql" >nul
if %errorlevel% neq 0 (
    echo Starting MySQL service...
    net start mysql >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Failed to start MySQL service
        pause
        exit /b 1
    )
)

echo Dropping existing database...
mysql -u root -e "DROP DATABASE IF EXISTS notekeeper;"

:: Create a temporary file with the SQL commands
set "tempfile=%temp%\notekeeper_reset_%random%.sql"

(
  echo USE mysql;
  echo DROP USER IF EXISTS 'notekeeper'@'localhost';
  echo FLUSH PRIVILEGES;
  echo CREATE DATABASE IF NOT EXISTS notekeeper;
  echo USE notekeeper;
  echo CREATE TABLE IF NOT EXISTS users ^(
  echo     id BIGINT AUTO_INCREMENT PRIMARY KEY,
  echo     email VARCHAR(255) NOT NULL UNIQUE,
  echo     password VARCHAR(255) NOT NULL,
  echo     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  echo     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  echo     INDEX idx_email (email)
  echo );
  echo CREATE TABLE IF NOT EXISTS notes ^(
  echo     id BIGINT AUTO_INCREMENT PRIMARY KEY,
  echo     title VARCHAR(500) NOT NULL,
  echo     content TEXT,
  echo     tags JSON,
  echo     owner_id BIGINT NOT NULL,
  echo     is_private BOOLEAN DEFAULT FALSE,
  echo     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  echo     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  echo     FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  echo     INDEX idx_owner_id (owner_id),
  echo     INDEX idx_created_at (created_at),
  echo     INDEX idx_updated_at (updated_at),
  echo     FULLTEXT idx_search (title, content)
  echo );
  echo CREATE USER IF NOT EXISTS 'notekeeper'@'localhost' IDENTIFIED BY 'password';
  echo GRANT ALL PRIVILEGES ON notekeeper.* TO 'notekeeper'@'localhost';
  echo FLUSH PRIVILEGES;
  echo INSERT INTO users (email, password) VALUES ('demo@notekeeper.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
  echo SET @user_id = LAST_INSERT_ID();
  echo INSERT INTO notes (title, content, tags, owner_id, is_private, created_at) VALUES 
  echo ('✨ Welcome to Your Digital Notebook', '# Welcome to NoteKeeper! 🎉\n\n## Getting Started\n- ✏️ **Edit** this note by clicking anywhere\n- 🔍 **Search** through all your notes instantly\n- 🏷️ **Tag** your notes for better organization\n- 🔒 **Secure** private notes with passwords\n- 📱 **Access** your notes from anywhere\n\n## Quick Tips\n- Use `#` for headings\n- Try `-` or `*` for bullet points\n- Number lists with `1.` `2.` `3.`\n- `**Bold**` and `*italic*` text formatting\n\n> "The best way to have a good idea is to have lots of ideas." — Linus Pauling', '["welcome", "getting-started", "tutorial"]', @user_id, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
  echo ('🚀 Project Ideas & Brain Dump', '# 💡 Project Ideas\n\n## Web Development\n- [ ] Build a personal knowledge base\n- [ ] Create a habit tracker with analytics\n- [ ] Develop a recipe manager with AI suggestions\n\n## Learning Goals\n- [ ] Master React Hooks\n- [ ] Learn TypeScript\n  - [ ] Complete TypeScript course\n  - [ ] Convert existing projects\n- [ ] Explore WebAssembly\n\n## Side Projects\n- [ ] Open source contribution\n- [ ] Technical blog post series\n- [ ] Developer tooling utility\n\n## Resources\n- [freeCodeCamp](https://www.freecodecamp.org/)\n- [MDN Web Docs](https://developer.mozilla.org/)\n- [Dev.to](https://dev.to/)', '["projects", "ideas", "learning", "development"]', @user_id, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
  echo ('📅 Weekly Review & Planning', CONCAT('# Week of ', DATE_FORMAT(CURDATE(), '%M %d, %Y'), '\n\n## This Week''s Goals\n- [ ] Complete project proposal\n- [ ] Schedule team sync\n- [ ] Review PRs\n\n## Meeting Notes\n### Team Standup\n- Discussed Q3 roadmap\n- Addressed performance issues\n- New team member onboarding\n\n### Client Call\n- Requirements gathering\n- Timeline adjustments\n- Next steps confirmed\n\n## Action Items\n- [ ] Follow up with design team\n- [ ] Update documentation\n- [ ] Schedule code review'), '["meeting", "planning", "work"]', @user_id, FALSE, NOW()),
  echo ('🔒 Private: Personal Journal', CONCAT('# Personal Reflections ', DATE_FORMAT(CURDATE(), '%Y-%m-%d'), '\n\n## Today''s Highlights\n- Started using NoteKeeper\n- Had a productive work session\n- Made progress on personal goals\n\n## Ideas & Thoughts\n- Consider writing about my learning journey\n- Explore new productivity techniques\n- Plan a tech talk topic\n\n## Gratitude\n1. Supportive team at work\n2. Learning opportunities\n3. Work-life balance'), '["journal", "personal", "reflections"]', @user_id, TRUE, NOW());
) > "%tempfile%"

:: Execute the SQL commands
echo Creating database and importing data...
mysql -u root < "%tempfile%"

:: Clean up
del "%tempfile%" >nul 2>&1

echo.
echo ========================================
echo Database reset complete!
echo.
echo Login with:
echo Email: demo@notekeeper.com
echo Password: password
echo.
echo ========================================
pause
