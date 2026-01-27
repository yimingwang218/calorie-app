# 卡路里记录 App - 部署指南

这是一个苹果原生风格的卡路里记录应用，支持搜索食物、记录营养摄入。

## 🚀 快速部署到 Vercel（推荐，免费）

### 方法一：通过 Vercel 网站（最简单）

1. **上传代码到 GitHub**
   - 访问 [github.com](https://github.com)
   - 创建新仓库（New Repository）
   - 将 `calorie-app` 文件夹的所有内容上传

2. **部署到 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
   - 点击 "Deploy"
   - 等待 1-2 分钟即可完成！

3. **获取你的网址**
   - 部署完成后会得到一个网址，如：`your-app.vercel.app`
   - 在任何设备上访问这个网址即可使用

### 方法二：通过命令行（需要 Node.js）

```bash
# 1. 安装依赖
cd calorie-app
npm install

# 2. 本地测试
npm run dev
# 在浏览器打开 http://localhost:5173

# 3. 部署到 Vercel
npm install -g vercel
vercel login
vercel
```

## 📱 添加到手机主屏幕

部署完成后：
1. 在手机浏览器中打开你的网址
2. **iPhone**: 点击分享按钮 → "添加到主屏幕"
3. **Android**: 菜单 → "添加到主屏幕"

## 🔑 获取 API Key（可选）

如果你想搜索全球食物数据库：

1. 访问 [api-ninjas.com/register](https://api-ninjas.com/register)
2. 免费注册账号
3. 获取你的 API Key
4. 在 App 中点击右上角按钮设置 API Key

**免费额度**: 50,000 次请求/月（个人使用完全够用）

## 📊 功能特点

✅ 苹果原生 UI 设计
✅ 卡路里进度环显示
✅ 三大营养素追踪（蛋白质、碳水、脂肪）
✅ 微量元素显示（膳食纤维、钙、铁）
✅ 本地数据库（20 种常见食物）
✅ API 集成（可搜索全球食物）
✅ 响应式设计（手机/平板/电脑均可用）

## 🛠️ 技术栈

- React 18
- Vite
- Lucide React（图标）
- API Ninjas Nutrition API

## 📝 本地数据库食物列表

白米饭、鸡胸肉、西兰花、香蕉、鸡蛋、燕麦、三文鱼、牛奶、苹果、牛肉、番茄、黄瓜、胡萝卜、豆腐、鸡腿肉、酸奶、全麦面包、菠菜、橙子、红薯

## ⚡ 其他部署选项

- **Netlify**: 类似 Vercel，也是免费的
- **GitHub Pages**: 适合静态网站
- **自己的服务器**: 运行 `npm run build` 然后部署 `dist` 文件夹

## 🆘 常见问题

**Q: 为什么搜不到食物？**
A: 默认使用本地数据库（20种食物）。如需更多食物，请设置 API Key。

**Q: API 免费吗？**
A: 是的！API Ninjas 提供免费套餐，每月 50,000 次请求。

**Q: 能在手机上用吗？**
A: 可以！部署后添加到主屏幕，就像原生 App 一样。

**Q: 数据会保存吗？**
A: 当前版本数据保存在浏览器中，刷新后会丢失。如需持久化，可以后续添加后端。

## 📧 需要帮助？

如有问题，欢迎反馈！
