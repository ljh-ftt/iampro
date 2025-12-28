# Git上传指南

由于当前环境未安装Git，您需要手动执行以下步骤将工程上传到Git仓库。

## 步骤1：安装Git

如果您的计算机上尚未安装Git，请先下载并安装：
- Windows：访问 https://git-scm.com/download/win 下载安装程序
- macOS：使用Homebrew安装 `brew install git`
- Linux：使用包管理器安装，如 `sudo apt install git`（Debian/Ubuntu）或 `sudo yum install git`（CentOS/RHEL）

## 步骤2：初始化Git仓库

安装完成后，打开命令行工具，进入工程目录：

```bash
cd C:\Users\admin\Documents\trae_projects\iampro
```

初始化Git仓库：

```bash
git init
```

## 步骤3：配置用户信息

设置Git用户信息（用于提交记录）：

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 步骤4：添加文件到暂存区

```bash
git add .
```

## 步骤5：提交代码

```bash
git commit -m "Initial commit: 生产设备报修、检修、物资管理平台"
```

## 步骤6：添加远程仓库

在Git平台（如GitHub、GitLab、Gitee）上创建一个新的仓库，然后将其添加为远程仓库：

```bash
git remote add origin <远程仓库URL>
```

例如：
```bash
git remote add origin https://github.com/yourusername/equipment-maintenance.git
```

## 步骤7：推送到远程仓库

```bash
git push -u origin master
```

如果使用的是GitHub且是第一次推送，可能需要进行身份验证（输入用户名和密码或使用SSH密钥）。

## 注意事项

1. 确保您已经在Git平台上创建了一个空仓库
2. 如果使用HTTPS方式，可能需要配置Git凭据管理器
3. 如果您的工程目录中有大型文件（如超过100MB），可能需要使用Git LFS
4. 定期提交代码以保存更改

## 常用Git命令

- `git status`：查看当前仓库状态
- `git log`：查看提交历史
- `git pull`：从远程仓库拉取更新
- `git push`：推送本地更改到远程仓库
- `git branch`：查看分支列表
- `git checkout -b <branch-name>`：创建并切换到新分支

如果您在执行过程中遇到任何问题，请参考Git官方文档或相关教程。