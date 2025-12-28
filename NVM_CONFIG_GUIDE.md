# NVM 环境变量配置指南

## 问题分析

您在普通命令行窗口中可以成功运行 `nvm -v` 命令，但在 Trae AI 终端中无法找到该命令，这是由于系统环境变量配置不完整导致的。

## 配置步骤

### 步骤 1：找到 nvm 的实际安装位置

1. 打开普通命令行窗口（CMD）
2. 运行以下命令：
   ```cmd
   where nvm
   ```
3. 记录返回的路径，例如：`C:\Users\admin\AppData\Roaming\nvm\nvm.cmd`

### 步骤 2：配置系统环境变量

1. **打开系统属性**：
   - 右键点击「此电脑」→「属性」→「高级系统设置」→「环境变量」

2. **配置用户变量**：
   - 在「用户变量」区域找到 `Path` 变量，点击「编辑」
   - 确保包含 nvm 安装目录（例如：`C:\Users\admin\AppData\Roaming\nvm`）
   - 如果没有，点击「新建」并添加该路径

3. **配置系统变量**：
   - 在「系统变量」区域找到 `Path` 变量，点击「编辑」
   - 确保包含 nvm 安装目录
   - 同时确保包含 Node.js 快捷方式目录（通常是：`C:\Program Files\nodejs`）

4. **添加 NVM_HOME 变量**：
   - 在「系统变量」区域点击「新建」
   - 变量名：`NVM_HOME`
   - 变量值：nvm 安装目录（例如：`C:\Users\admin\AppData\Roaming\nvm`）

5. **添加 NVM_SYMLINK 变量**：
   - 在「系统变量」区域点击「新建」
   - 变量名：`NVM_SYMLINK`
   - 变量值：Node.js 快捷方式目录（通常是：`C:\Program Files\nodejs`）

### 步骤 3：验证配置

1. 关闭所有终端窗口
2. 重新打开 Trae AI 终端
3. 运行以下命令验证：
   ```bash
   nvm -v
   ```
4. 如果显示版本号（例如：1.2.2），则配置成功

## 安装和使用 Node.js

### 安装兼容版本

```bash
# 安装 Node.js v18.20.4（Vue 2.x 最兼容版本）
nvm install 18.20.4

# 使用安装的版本
nvm use 18.20.4

# 验证版本
node -v  # 应该显示 v18.20.4
npm -v   # 应该显示 9.x.x
```

### 启动前端服务

```bash
cd frontend
npm install
npm run serve
```

## 注意事项

1. **重启终端**：配置环境变量后，必须关闭并重新打开所有终端窗口
2. **以管理员身份运行**：在某些情况下，需要以管理员身份运行命令行窗口
3. **检查防火墙**：确保防火墙没有阻止 nvm 或 Node.js 的运行

如果按照上述步骤配置后仍然遇到问题，请尝试重新安装 nvm 并确保在安装过程中勾选「Add to PATH」选项。