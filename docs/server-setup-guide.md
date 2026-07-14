# 渔路 YULU — 云服务器购买与搭建指南

> 适用条件：阿里云 · 中国大陆 · 个人开发者 · MVP 阶段 · 预算 100-300 元/月

---

## 一、购买清单（先花钱再干活）

### 1.1 需要买的东西（按顺序）

| 序号 | 项目 | 推荐配置 | 预估费用 | 必须在备案前完成 |
|------|------|----------|----------|-----------------|
| ① | 阿里云账号 + 实名认证 | 个人实名（支付宝刷脸） | 免费 | ✅ |
| ② | **ECS 云服务器** | 2核4G · 5M带宽 · 80G ESSD | **199元/年** | ✅ |
| ③ | **域名** | `.com` 或 `.cn` | **35-79元/年** | ✅ |
| ④ | ICP 备案 | 免费（阿里云代办） | 免费 | — |
| ⑤ | SSL 证书 | 阿里云免费 DV 证书 | 免费 | — |

> **首年总成本约 ¥234~278/年**，折合约 ¥20-24/月，远在预算内。

---

### 1.2 详细购买步骤

#### 第一步：注册阿里云账号 + 实名认证

1. 打开 https://www.aliyun.com
2. 点击右上角「注册」，用手机号注册
3. 登录后前往「账号中心 → 实名认证」
4. 选择「个人认证」，用支付宝扫码刷脸完成（最简单）
5. 等待认证通过（通常即时通过）

#### 第二步：购买 ECS 服务器

1. 打开 https://ecs-buy.aliyun.com
2. 选择「一键购买」（适合新手）

**推荐配置：**

| 配置项 | 推荐值 | 说明 |
|--------|--------|------|
| **实例规格** | `ecs.u1-c1m2.large`（2核4G） | 通用算力型 u1，性价比之王 |
| **付费方式** | 包年包月 | 选**1年**最划算（199元/年） |
| **地域** | 华东1（杭州）或华北2（北京） | 选离用户最近的，选有库存的 |
| **镜像** | Ubuntu 22.04 64位 | 社区文档最多，最适合新手 |
| **系统盘** | 80G ESSD Entry | 默认配置够用 |
| **带宽** | 固定带宽 5Mbps | 不限流量，MVP 足够 |

> 💡 **提示**：如果不是新用户，看不到199的价格，可以注册一个新账号。

**安全组设置（重要！）：**
购买时或购买后，在「安全组」中开放以下端口：

| 端口 | 用途 |
|------|------|
| 22 | SSH 远程登录 |
| 80 | HTTP（Web 服务） |
| 443 | HTTPS（HTTPS 服务） |
| 5432 | PostgreSQL（可选，建议仅内网） |

3. 付款后记录以下信息（很重要！）：
   - **公网 IP 地址**（如 `47.xx.xx.xx`）
   - **实例 ID**

#### 第三步：购买域名

1. 打开 https://wanwang.aliyun.com
2. 搜索你想要的域名（如 `yulu-fishing.com`、`yuluapp.cn`）
3. 域名选择建议：
   - `.com`：国际通用，~55-79元/年
   - `.cn`：国内首选，~35元/年（首年更便宜）
   - 尽量短、好记、与品牌相关
4. 加入清单 → 结算 → 购买
5. 购买后立刻完成**域名实名认证**（域名校验必须在备案之前审核通过）
6. 等待实名审核通过（通常几小时到1天）

---

## 二、ICP 备案（必须做！）

> 在中国大陆服务器上提供 Web 服务，**必须完成 ICP 备案**，否则无法通过域名访问。

### 2.1 备案前提条件

- ✅ 阿里云账号已实名
- ✅ 域名已购买且实名认证通过
- ✅ ECS 服务器已购买（≥3个月，已购1年没问题）
- ✅ ECS 地域在中国大陆

### 2.2 备案流程（全程在阿里云备案系统操作）

1. 打开 https://beian.aliyun.com
2. 点击「开始备案」→ 选「ICP备案」
3. 填写信息：
   - **主办单位信息**：填你自己的姓名、身份证号、手机号
   - **网站信息**：
     - 网站名称：如「渔路」（**注意：个人备案不能用「中国」「中华」等字样，不含经营性内容**）
     - 域名：填写刚买的域名
     - 服务类型：选「网站应用」
4. **上传材料**：
   - 身份证正反面照片（四角露出、清晰）
   - 手机号需本人实名
5. **人脸核验**：用阿里云 App 扫码完成人脸识别
6. 提交后等待审核：
   - **阿里云初审**：1-2 个工作日
   - **管局审核**：7-20 个工作日（各地不同）
   - 审核通过后会收到短信，分配备案号（如「浙ICP备2025xxxxxx号」）

### 2.3 备案注意事项

- ⚠️ **备案期间网站不能通过域名访问**（可以先通过 IP 访问调试）
- ⚠️ 个人备案网站内容不能涉及：论坛、电商、支付、新闻
- ⚠️ 网站底部必须展示 ICP 备案号，并链接到 https://beian.miit.gov.cn

---

## 三、服务器环境搭建

### 3.1 连接服务器

备案审核期间可以先用 IP 连接服务器，提前搭好环境。

```bash
# 在本地终端（Mac/Linux）或 PowerShell（Windows）执行
ssh root@你的服务器IP

# 首次登录输入密码（购买时设置的，或去控制台重置）
```

> 💡 建议用 **Alibaba Cloud Cursor** 或 **VS Code Remote SSH** 远程开发，体验更好。

### 3.2 初始化系统

```bash
# 更新系统
apt update && apt upgrade -y

# 设置时区
timedatectl set-timezone Asia/Shanghai

# 安装基础工具
apt install -y curl wget git vim ufw htop nginx
```

### 3.3 配置防火墙（UFW）

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

### 3.4 安装 Node.js 20 LTS

```bash
# 安装 nvm（Node 版本管理）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# 安装 Node.js 20
nvm install 20
nvm use 20
node -v  # 确认输出 v20.x.x

# 安装 pnpm
npm install -g pnpm pm2

# 启用 pnpm
corepack enable
```

### 3.5 安装 PostgreSQL 16 + PostGIS

```bash
# 添加 PostgreSQL 官方仓库
sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg

# 安装 PostgreSQL 16 + PostGIS
apt update
apt install -y postgresql-16 postgresql-16-postgis-3 postgresql-16-postgis-3-scripts

# 启动 PostgreSQL
systemctl enable postgresql
systemctl start postgresql

# 验证安装
sudo -u postgres psql -c "SELECT version();"
```

### 3.6 配置 PostgreSQL

```bash
# 设置 postgres 用户密码
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '你的强密码';"

# 创建渔路数据库
sudo -u postgres psql -c "CREATE DATABASE yulu;"

# 在 yulu 数据库中启用 PostGIS 扩展
sudo -u postgres psql -d yulu -c "CREATE EXTENSION IF NOT EXISTS postgis;"
sudo -u postgres psql -d yulu -c "SELECT PostGIS_Version();"

# 编辑 pg_hba.conf 允许本地连接（默认已允许）
# 如果需要远程连接（不推荐），编辑 postgresql.conf
# listen_addresses = '*'  ← 不建议在 MVP 阶段开启
```

---

## 四、部署渔路后端 API

### 4.1 上传代码

```bash
# 在服务器上创建项目目录
mkdir -p /var/www/yulu
cd /var/www/yulu

# 方法1：从本地 Git clone（推荐）
git clone 你的仓库地址 .

# 方法2：从本地 scp 上传
# 在本地终端执行：
# scp -r ./yulu/* root@服务器IP:/var/www/yulu/
```

### 4.2 安装依赖 & 配置环境变量

```bash
cd /var/www/yulu

# 安装依赖
pnpm install

# 创建 .env 文件（参考 .env.example）
cat > apps/api/.env << 'EOF'
# 服务器配置
PORT=3001
NODE_ENV=production

# 数据库
DATABASE_URL=postgresql://postgres:你的数据库密码@localhost:5432/yulu

# JWT 密钥（用随机字符串！）
JWT_ACCESS_SECRET=在这里填一个随机字符串
JWT_REFRESH_SECRET=在这里填另一个随机字符串

# 前端 URL
CORS_ORIGIN=https://你的域名
EOF
```

### 4.3 运行数据库迁移 + 种子数据

```bash
# 运行迁移（创建 8 张表）
pnpm --filter @yulu/api tsx src/migrate.ts

# 运行种子数据（插入测试数据）
pnpm --filter @yulu/api tsx src/seed.ts
```

### 4.4 用 PM2 启动后端

```bash
# 启动后端 API
pm2 start "pnpm --filter @yulu/api dev" --name yulu-api

# 查看运行状态
pm2 status
pm2 logs yulu-api

# 设置开机自启
pm2 startup
pm2 save
```

### 4.5 验证 API

```bash
# 在服务器上测试
curl http://localhost:3001/api/spots
# 应该返回钓点 JSON 数据
```

---

## 五、部署 Web 落地页

```bash
cd /var/www/yulu

# 构建静态文件
pnpm --filter @yulu/web build

# Next.js 静态导出文件在 apps/web/out/ 目录
```

---

## 六、配置 Nginx 反向代理

### 6.1 创建 Nginx 配置

```bash
cat > /etc/nginx/sites-available/yulu << 'EOF'
# 后端 API 反向代理
server {
    listen 80;
    server_name api.你的域名.com;  # ← 改成你的域名

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web 落地页静态文件
server {
    listen 80;
    server_name 你的域名.com www.你的域名.com;  # ← 改成你的域名

    root /var/www/yulu/apps/web/out;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/yulu /etc/nginx/sites-enabled/
nginx -t  # 测试配置
systemctl reload nginx
```

### 6.2 配置域名 DNS 解析

在阿里云「域名控制台 → 解析」中添加以下记录：

| 记录类型 | 主机记录 | 记录值 | 说明 |
|----------|---------|--------|------|
| A | `@` | 你的服务器公网IP | 主域名 |
| A | `www` | 你的服务器公网IP | www 子域 |
| A | `api` | 你的服务器公网IP | API 子域 |

> DNS 解析通常几分钟内生效。

---

## 七、配置 HTTPS（SSL 证书）

> 备案通过后再做这步。

### 7.1 申请阿里云免费 SSL 证书

1. 打开 https://yundun.console.aliyun.com/?p=cas
2. 点击「创建证书」→「证书申请」
3. 选择「DV 单域名证书」（免费）
4. 填写域名，验证方式选「DNS 自动验证」
5. 等待签发（通常几分钟）

### 7.2 下载并配置证书

```bash
# 下载 Nginx 格式的证书文件，上传到服务器
mkdir -p /etc/nginx/ssl
# 上传 .pem 和 .key 文件到 /etc/nginx/ssl/

# 更新 Nginx 配置添加 HTTPS
```

```nginx
# HTTPS 配置（加到之前的 server 块中）
server {
    listen 443 ssl;
    server_name 你的域名.com;

    ssl_certificate /etc/nginx/ssl/你的域名.pem;
    ssl_certificate_key /etc/nginx/ssl/你的域名.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/yulu/apps/web/out;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTP 跳转 HTTPS
server {
    listen 80;
    server_name 你的域名.com;
    return 301 https://$host$request_uri;
}
```

```bash
nginx -t && systemctl reload nginx
```

---

## 八、最终验证清单

备案通过后，逐项检查：

- [ ] `https://你的域名.com` 能打开落地页
- [ ] `https://api.你的域名.com/api/spots` 能返回 JSON 数据
- [ ] 网站底部有 ICP 备案号和工信部链接
- [ ] HTTP 自动跳转 HTTPS
- [ ] PM2 进程正常运行（`pm2 status`）
- [ ] PostgreSQL 服务正常运行（`systemctl status postgresql`）
- [ ] 数据库迁移和种子数据已执行
- [ ] 防火墙只开放 22/80/443 端口

---

## 九、费用总结

| 项目 | 首年费用 | 续费费用 |
|------|---------|---------|
| ECS 2核4G（u1实例） | ¥199/年 | ¥199/年（续费同价） |
| 域名 .com | ~¥55-79/年 | ~¥79/年 |
| 域名 .cn | ~¥35/年（首年） | ~¥35-69/年 |
| SSL 证书 | 免费 | 免费 |
| ICP 备案 | 免费 | 一次性 |
| **合计** | **约 ¥234-278/年** | **约 ¥234-278/年** |
| **折合每月** | **约 ¥19-23/月** | — |

---

## 十、日常运维命令速查

```bash
# 查看服务状态
pm2 status                    # Node.js 服务
systemctl status postgresql   # 数据库
systemctl status nginx        # Nginx

# 查看日志
pm2 logs yulu-api             # API 日志
tail -f /var/log/nginx/error.log  # Nginx 错误日志

# 重启服务
pm2 restart yulu-api
systemctl restart nginx
systemctl restart postgresql

# 更新代码后重新部署
cd /var/www/yulu
git pull origin main
pnpm install
pnpm --filter @yulu/web build
pm2 restart yulu-api

# 查看服务器资源使用
htop                          # CPU/内存
df -h                         # 磁盘空间
```

---

## 十一、安全加固（建议尽快做）

```bash
# 1. 禁用 root SSH 登录，创建普通用户
adduser yulu
usermod -aG sudo yulu

# 2. 配置 SSH 密钥登录（禁密码）
# 在本地生成密钥后上传到服务器

# 3. 修改 SSH 默认端口（可选，如改为 2222）

# 4. 安装 fail2ban 防暴力破解
apt install -y fail2ban
systemctl enable fail2ban

# 5. 设置自动安全更新
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```
