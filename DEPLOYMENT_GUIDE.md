# 工程代码部署指南

本指南详细介绍了如何将设备管理平台部署到公司服务器上，包含 Linux 和 Windows 系统的部署步骤。

## 1. 服务器环境准备

### 1.1 操作系统要求
- **Linux 系统**：推荐使用 Ubuntu 18.04 或更高版本
- **Windows 系统**：推荐使用 Windows Server 2012 R2 或更高版本
- 确保服务器具有公网 IP 地址或内网可访问的 IP 地址

### 1.2 安装必要的软件

#### 1.2.1 安装 Node.js 和 npm

##### Linux 系统
```bash
# 使用 NodeSource 安装 Node.js 14.x
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v
npm -v
```

##### Windows 系统
1. 访问 [Node.js 官网](https://nodejs.org/zh-cn/) 下载 Node.js 14.x 的 Windows 安装包
2. 运行安装包，选择默认选项完成安装
3. 打开命令提示符（CMD）或 PowerShell，验证安装：
```powershell
node -v
npm -v
```

#### 1.2.2 安装 MySQL

##### Linux 系统
```bash
sudo apt install -y mysql-server

# 启动 MySQL 服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置 MySQL
sudo mysql_secure_installation
```

##### Windows 系统
1. 访问 [MySQL 官网](https://dev.mysql.com/downloads/mysql/) 下载 MySQL Community Server 的 Windows 安装包
2. 运行安装包，选择 "Custom" 安装类型，安装到自定义目录（如 `C:\MySQL`）
3. 配置 MySQL：
   - 设置 root 密码
   - 选择 "Use Legacy Authentication Method"
   - 将 MySQL 添加到系统环境变量
4. 启动 MySQL 服务：
   - 打开 "服务" 应用
   - 找到 "MySQL80" 服务，右键选择 "启动"
   - 设置为自动启动：右键选择 "属性"，将 "启动类型" 改为 "自动"

#### 1.2.3 安装 Git

##### Linux 系统
```bash
sudo apt install -y git
```

##### Windows 系统
1. 访问 [Git 官网](https://git-scm.com/download/win) 下载 Windows 安装包
2. 运行安装包，选择默认选项完成安装
3. 验证安装：
```powershell
git --version
```

#### 1.2.4 安装 PM2（用于管理 Node.js 应用）

##### Linux 系统
```bash
npm install -g pm2
```

##### Windows 系统
```powershell
npm install -g pm2

# 安装 pm2-windows-service 用于 Windows 服务管理
npm install -g pm2-windows-service

# 初始化 PM2 服务
pm2-service-install
```

#### 1.2.5 安装 Nginx（用于前端静态资源服务）

##### Linux 系统
```bash
sudo apt install -y nginx

sudo systemctl start nginx
sudo systemctl enable nginx
```

##### Windows 系统
1. 访问 [Nginx 官网](http://nginx.org/en/download.html) 下载 Windows 版本
2. 解压到自定义目录（如 `C:\nginx`）
3. 启动 Nginx：
   - 打开命令提示符（管理员权限）
   - 进入 Nginx 目录：`cd C:\nginx`
   - 启动：`nginx.exe`
4. 设置 Nginx 开机自启（可选）：
   - 创建启动脚本，使用 Windows 任务计划程序添加开机启动任务

## 2. 数据库配置

### 2.1 创建数据库和用户

##### Linux 系统
```bash
# 登录 MySQL
sudo mysql -u root -p

# 创建数据库
CREATE DATABASE equipment_maintenance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户并授权
CREATE USER 'equipment_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON equipment_maintenance.* TO 'equipment_user'@'localhost';
FLUSH PRIVILEGES;

# 退出 MySQL
EXIT;
```

##### Windows 系统
```powershell
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE equipment_maintenance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户并授权
CREATE USER 'equipment_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON equipment_maintenance.* TO 'equipment_user'@'localhost';
FLUSH PRIVILEGES;

# 退出 MySQL
EXIT;
```

### 2.2 导入数据库结构

##### Linux 系统
```bash
# 假设数据库结构文件为 equipment_maintenance.sql
mysql -u equipment_user -p equipment_maintenance < equipment_maintenance.sql
```

##### Windows 系统
```powershell
# 假设数据库结构文件为 equipment_maintenance.sql，位于 D:\backup 目录
mysql -u equipment_user -p equipment_maintenance < "D:\backup\equipment_maintenance.sql"
```

## 3. 后端部署

### 3.1 克隆代码

##### Linux 系统
```bash
cd /opt
git clone <your_repository_url> equipment-management
cd equipment-management/backend
```

##### Windows 系统
```powershell
mkdir C:\Projects
cd C:\Projects
git clone <your_repository_url> equipment-management
cd equipment-management\backend
```

### 3.2 安装依赖

##### Linux 系统
```bash
npm install
```

##### Windows 系统
```powershell
npm install
```

### 3.3 配置环境变量

##### Linux 系统
创建 `.env` 文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=equipment_user
DB_PASSWORD=your_password
DB_NAME=equipment_maintenance
PORT=3001
```

##### Windows 系统
创建 `.env` 文件：
```powershell
copy .env.example .env
```

编辑 `.env` 文件（使用文本编辑器如 Notepad++）：
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=equipment_user
DB_PASSWORD=your_password
DB_NAME=equipment_maintenance
PORT=3001
```

### 3.4 启动后端服务

##### Linux 系统
```bash
# 使用 PM2 启动服务
npm run start:prod

# 查看服务状态
pm2 list
```

##### Windows 系统
```powershell
# 使用 PM2 启动服务
npm run start:prod

# 查看服务状态
pm2 list

# 将服务添加到 PM2 自动启动
pm2 startup
```

## 4. 前端部署

### 4.1 克隆代码（如果还没有克隆）

##### Linux 系统
```bash
cd /opt
git clone <your_repository_url> equipment-management
cd equipment-management/frontend
```

##### Windows 系统
```powershell
cd C:\Projects\equipment-management\frontend
```

### 4.2 安装依赖

##### Linux 系统
```bash
npm install
```

##### Windows 系统
```powershell
npm install
```

### 4.3 配置环境变量

##### Linux 系统
创建 `.env` 文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```bash
VUE_APP_API_BASE_URL=http://your_server_ip:3001/api
```

##### Windows 系统
创建 `.env` 文件：
```powershell
copy .env.example .env
```

编辑 `.env` 文件（使用文本编辑器如 Notepad++）：
```
VUE_APP_API_BASE_URL=http://your_server_ip:3001/api
```

### 4.4 构建生产版本

##### Linux 系统
```bash
npm run build
```

##### Windows 系统
```powershell
npm run build
```

### 4.5 配置 Nginx

##### Linux 系统
创建 Nginx 配置文件：
```bash
sudo nano /etc/nginx/sites-available/equipment-management
```

添加以下内容：
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        root /opt/equipment-management/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/equipment-management /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

##### Windows 系统
1. 打开 Nginx 配置文件：`C:\nginx\conf\nginx.conf`
2. 使用文本编辑器编辑配置文件，在 `http` 块中添加以下内容：
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        root C:\Projects\equipment-management\frontend\dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
3. 测试并重新加载 Nginx 配置：
```powershell
# 进入 Nginx 目录
cd C:\nginx

# 测试配置
nginx.exe -t

# 重新加载配置
nginx.exe -s reload
```

## 5. SSL 证书配置（可选）

### Linux 系统
使用 Let's Encrypt 安装免费 SSL 证书：

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d your_domain.com
```

### Windows 系统
在 Windows 上使用 Win-ACME 安装 Let's Encrypt 证书：

1. 下载 Win-ACME 工具：
   - 访问 [Win-ACME 官网](https://www.win-acme.com/) 下载最新版本
   - 解压到 `C:\win-acme` 目录

2. 打开命令提示符（管理员权限）：
```powershell
cd C:\win-acme
```

3. 运行 Win-ACME：
```powershell
wacs.exe
```

4. 按照交互式界面提示操作：
   - 选择 "N" 为 IIS 以外的服务请求证书
   - 输入域名（如 `your_domain.com`）
   - 选择验证方式（推荐 "HTTP validation"）
   - 选择 "N" 不使用现有的网站根目录
   - 输入 Nginx 网站根目录（如 `C:\Projects\equipment-management\frontend\dist`）
   - 选择 "Yes" 安装证书
   - 选择 "Q" 退出

5. 手动更新 Nginx 配置以使用 SSL：
   - 编辑 `C:\nginx\conf\nginx.conf` 文件
   - 添加 HTTPS 服务器配置：
```nginx
server {
    listen 443 ssl;
    server_name your_domain.com;

    ssl_certificate C:\win-acme\acme-v02.api.letsencrypt.org\your_domain.com\certificate.crt;
    ssl_certificate_key C:\win-acme\acme-v02.api.letsencrypt.org\your_domain.com\private.key;

    location / {
        root C:\Projects\equipment-management\frontend\dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 重定向 HTTP 到 HTTPS
server {
    listen 80;
    server_name your_domain.com;
    return 301 https://$server_name$request_uri;
}
```

6. 重新加载 Nginx 配置：
```powershell
cd C:\nginx
nginx.exe -s reload
```

## 6. 测试和维护

### 6.1 测试应用
- 访问 `http://your_domain.com` 或 `http://your_server_ip` 测试前端
- 测试登录、设备报修、物资申领等功能

### 6.2 查看日志

##### Linux 系统
```bash
# 查看后端日志
pm2 logs equipment-backend

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

##### Windows 系统
```powershell
# 查看后端日志
pm2 logs equipment-backend

# 查看 Nginx 日志
type "C:\nginx\logs\access.log" | more
type "C:\nginx\logs\error.log" | more
```

### 6.3 定期更新

##### Linux 系统
```bash
# 更新后端代码
cd /opt/equipment-management/backend
git pull
npm install
pm2 restart equipment-backend

# 更新前端代码
cd /opt/equipment-management/frontend
git pull
npm install
npm run build
```

##### Windows 系统
```powershell
# 更新后端代码
cd C:\Projects\equipment-management\backend
git pull
npm install
pm2 restart equipment-backend

# 更新前端代码
cd C:\Projects\equipment-management\frontend
git pull
npm install
npm run build
```

## 7. 常见问题处理

### 7.1 数据库连接失败
- 检查数据库用户名和密码是否正确
- 检查数据库服务是否运行
  - Linux: `sudo systemctl status mysql`
  - Windows: 打开 "服务" 应用，检查 MySQL80 服务状态
- 检查防火墙设置

### 7.2 前端无法访问后端 API
- 检查 Nginx 配置中的代理设置
- 检查后端服务是否运行：`pm2 list`
- 检查 CORS 配置

### 7.3 服务启动失败
- 查看日志文件获取详细错误信息
- 检查端口是否被占用
  - Linux: `sudo lsof -i :3001`
  - Windows: `netstat -ano | findstr :3001`
- 检查环境变量配置

## 8. 监控和告警

### 8.1 配置 PM2 监控

##### Linux 系统
```bash
npm install pm2-logrotate -g
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
```

##### Windows 系统
```powershell
npm install pm2-logrotate -g
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
```

### 8.2 设置定时任务

##### Linux 系统
```bash
# 每天凌晨 2 点备份数据库
sudo crontab -e
```

添加以下内容：
```bash
0 2 * * * mysqldump -u equipment_user -pyour_password equipment_maintenance > /opt/equipment-management/backup/equipment_maintenance_$(date +\%Y\%m\%d).sql 
```

##### Windows 系统
1. 打开 "任务计划程序"
2. 点击 "创建基本任务"
3. 填写任务名称（如 "数据库备份"）和描述
4. 选择 "每天" 触发
5. 设置开始时间为 "02:00:00"
6. 选择 "启动程序"
7. 浏览并选择 `mysqldump.exe`（通常位于 `C:\MySQL\bin\mysqldump.exe`）
8. 在 "添加参数" 中输入：
   ```
   -u equipment_user -pyour_password equipment_maintenance > "C:\Projects\equipment-management\backup\equipment_maintenance_$(date +\%Y\%m\%d).sql"
   ```
9. 完成创建

### 8.3 定期重启服务

##### Linux 系统
添加到 crontab：
```bash
0 3 * * * pm2 restart all
```

##### Windows 系统
在 "任务计划程序" 中创建新任务，每天凌晨 3 点执行：
```powershell
pm2 restart all
```

---

部署完成后，您的设备管理平台将在公司服务器上正常运行。如需进一步帮助，请联系系统管理员。