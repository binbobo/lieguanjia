tiger项目前端工程
app/内为根目录
请勿使用/api路径

### 初始化
先npm install
再bower install
如果选择angular版本，选择1.5.0
如果找不到express, npm install express
如果找不到express-http-proxy, npm install express-http-proxy
npm install gulp -g

###sass报错: Compilation failed.: The command exited with code:127
sudo gem install sass

### 推荐使用 Yarn（可选）
上面的 npm install 可以使用更为先进的 yarn 替代
首先 npm install -g yarn 安装 yarn 包管理
之后直接在目录使用 yarn 命令安装必备库
yarn 和 npm 互相兼容，所以不用担心兼容性问题

### 首次使用 (如报错cannot find gulp-xxx,则依次安装)
gulp styles 会编译基本库的sass到css
gulp mystyles 会编译其他的sass到css
gulp live 会监控文件修改并调用mystyles编辑css

### 开发环境
node app.js可以单独启动一个前端环境
需要先配置config.json，加入一个java后端地址，由node负责转发/api开头的请求
