# 课题组静态展示网站（GitHub Pages 版）

这是一个纯静态课题组网站，可直接部署到 GitHub Pages。没有 npm、Node.js、数据库或后端依赖。

## 1. 文件结构

```text
research-group-github-pages/
├─ index.html                 # 主页（站点入口，第一次打开网址就是这一页）
├─ publications.html          # 论文成果
├─ advisor.html               # 导师简介
├─ members.html               # 课题组成员
├─ patents.html               # 专利成果
├─ news.html                  # 新闻列表
├─ news-detail.html           # 新闻详情页模板
├─ equipment.html             # 实验室仪器
├─ 404.html                   # GitHub Pages 自定义 404
├─ .nojekyll                  # 告诉 GitHub Pages 不进行 Jekyll 处理
├─ .gitignore
├─ README.md
└─ assets/
   ├─ css/style.css           # 全站样式
   ├─ js/main.js              # 横幅轮播 + 期刊横滚 + 论文分页 + 图片放大 + 页脚年份
   └─ images/
      ├─ header-bg.jpg        # 顶部横幅
      ├─ logo.png             # Logo
      ├─ publications/        # 论文图文摘要
      ├─ advisor/             # 导师照片
      ├─ members/             # 成员照片
      ├─ news/                # 新闻图片
      └─ equipment/           # 仪器图片
```

## 2. 最先修改的内容

### 修改课题组名称
每个 HTML 文件顶部都有：

```html
<p class="site-title">课题组名称 / Research Group Name</p>
```

把文字改成真实名称即可。

### 替换顶部横幅和 Logo
直接覆盖：

- `assets/images/header-bg.jpg`
- `assets/images/logo.png`

保持文件名不变，不需要修改代码。

### 添加论文
编辑 `publications.html`，复制完整的：

```html
<article class="publication-item">
  ...
</article>
```

把期刊、年份、状态、标题、作者、DOI、摘要和图片路径替换为真实内容。

### 添加成员
编辑 `members.html`，复制一个：

```html
<article class="member-item">
  ...
</article>
```

成员照片放入 `assets/images/members/`。

### 添加新闻
最简单的方法：

1. 在 `news.html` 复制一个 `news-item`；
2. 复制 `news-detail.html`，例如命名为 `news-002.html`；
3. 修改列表链接为 `./news-002.html`；
4. 在新详情页中替换标题、日期、正文、图片。

### 添加仪器
编辑 `equipment.html`，复制完整的 `equipment-card`。图片放入 `assets/images/equipment/`。点击图片放大功能无需额外修改。

## 3. 本地调试（Windows 推荐）

### 方法 A：Python 本地服务器

如果电脑安装了 Python，在此项目文件夹中打开 PowerShell：

```powershell
python -m http.server 8000
```

然后浏览器打开：

```text
http://localhost:8000/
```

停止服务器：在 PowerShell 中按 `Ctrl + C`。

如果 `python` 命令不可用，可以试：

```powershell
py -m http.server 8000
```

### 方法 B：VS Code + Live Server

1. 用 VS Code 打开整个项目文件夹；
2. 安装扩展 `Live Server`；
3. 右键 `index.html`；
4. 选择 `Open with Live Server`。

不要长期使用“直接双击 index.html”的方式调试，因为 `file://` 环境和真实 HTTP 网站有差异。

## 4. GitHub Pages 部署：网页操作（最简单）

### 第一步：创建 GitHub 仓库

建议仓库名：

```text
research-group-website
```

如果是 GitHub Free，建议创建 Public 仓库用于 Pages。

### 第二步：上传文件

进入仓库后：

1. `Add file`
2. `Upload files`
3. 把本项目目录中的**所有文件和 assets 文件夹**上传到仓库根目录；
4. Commit changes。

必须保证仓库根目录直接能看到 `index.html`，不要多套一层文件夹。

正确：

```text
repo/index.html
repo/assets/...
```

常见错误：

```text
repo/research-group-github-pages/index.html
```

### 第三步：打开 GitHub Pages

仓库页面：

```text
Settings → Pages
```

在 `Build and deployment` 中设置：

```text
Source: Deploy from a branch
Branch: main
Folder: /(root)
```

然后保存。

项目仓库通常会得到类似地址：

```text
https://你的GitHub用户名.github.io/research-group-website/
```

如果仓库名本身是：

```text
你的GitHub用户名.github.io
```

则网站通常位于：

```text
https://你的GitHub用户名.github.io/
```

## 5. Git 命令行部署（可选）

第一次上传：

```powershell
git init
git add .
git commit -m "Initial research group website"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

以后修改后：

```powershell
git add .
git commit -m "Update website content"
git push
```

GitHub Pages 使用 `main` 分支根目录后，每次 push 后会自动重新发布。

## 6. 常见调试问题

### ① GitHub Pages 打开是 404

依次检查：

- `Settings → Pages` 是否已经设置 `Deploy from a branch`；
- 分支是否为 `main`；
- Folder 是否为 `/(root)`；
- 仓库根目录是否直接存在 `index.html`；
- 仓库是否刚上传但 Pages 尚未显示成功部署；
- GitHub 的 Actions / Deployments 页面是否有失败记录。

### ② 首页有内容，但 CSS / 图片全部失效

本模板全部使用相对路径，例如：

```html
./assets/css/style.css
./assets/images/logo.png
```

不要随意改成：

```html
/assets/css/style.css
```

因为项目型 GitHub Pages 通常带有 `/仓库名/` 前缀，根路径写法很容易导致资源 404。

### ③ 本地能显示，GitHub Pages 图片不显示

GitHub Pages 运行在 Linux 环境，文件名大小写敏感。

例如代码是：

```text
member-01.jpg
```

就不能把真实文件命名成：

```text
Member-01.JPG
```

文件名和扩展名大小写必须完全一致。

### ④ 修改后浏览器还是旧内容

尝试：

- Windows Chrome / Edge：`Ctrl + F5`
- 无痕窗口重新打开
- 检查 GitHub 仓库中对应文件是否真的已经 commit / push

### ⑤ 某个新闻链接 404

检查 `href` 与真实文件名是否一一对应。例如：

```html
<a href="./news-002.html">新闻标题</a>
```

仓库根目录必须存在：

```text
news-002.html
```

### ⑥ 页面顶部挡住正文

统一在 `assets/css/style.css` 中调整：

```css
--header-height: 168px;
```

以及 `.hero-strip` / `.main-nav` 高度。一般不需要修改。

## 7. 推荐维护规则

- 文件名尽量只用英文、数字、短横线，不使用空格；
- 图片压缩后再上传，普通网页图片建议控制在约 200 KB–1 MB；
- DOI 外链建议使用 `https://doi.org/...`；
- 新增新闻详情时，直接复制现有详情页比引入数据库更稳；
- GitHub Pages 是静态托管，不要把账号密码、密钥、未公开数据放进仓库。

## 8. 为什么本模板适合 GitHub Pages

- 纯 HTML + CSS + Vanilla JavaScript；
- 无 npm、无构建命令；
- 所有内部资源使用相对路径；
- 自带 `.nojekyll`；
- 自带 `404.html`；
- 桌面端、平板、手机端均有响应式规则；
- 内容与图片位置均有注释，便于后续手工维护。
