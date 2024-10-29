monorepo
monorepo是一种项目代码管理方式，指单个仓库中管理多个项目

需要在根目录创建一个packages 目录
需要在根目录新建一个pnpm-workspace.yaml的文件

组件需要兼容vue2/vue3

- 使用vue-demi库，能够帮助开发者创建能够同时兼容vue2和vue3的组件或插件，而不需要维护两套独立的代码
- vue2能使用setup，需要安装@vue/composition-api，和vue-template-complier

组件需要兼容vue2/vue3的流程

- simple-ui项目需要安装 vue-demi: pnpm add vue-demi，将npm文档那的需要添加依赖复制到package.json中
- 可以在package.json的dependencies中添加不同vue版本
- 构建vue-demi切换vue版本的命令行1.新增切换的命令：
  "switch:vue3": "vue-demi-switch 3 vue3"
  "switch:vue2": "vue-demi-switch 2 vue2" 2.新增构建vue3版本 和 vue2版本的命令，注意在构建时，需要现切换vue版本
  "build:vue3": "pnpm switch:vue3 && vue-tsc && vite build"
  "build:vue2": "pnpm switch:vue2 && vue-tsc && vite build" 3.更改build的命令，改成可以同时更新vue3/vue2两个版本
  "build": "pnpm build:vue3 && pnpm build:vue2"
- 注意，此时的模板编译还是有点问题的，原因是编译插件的问题
  - 在vite.config.js中，@vitejs/plugin-vue是编译vue3的，编译vue2需要使用vue2的插件
  - 在simple-ui项目中，安装vue2插件: pnpm add -D vite-plugin-vue2
  - 在vite.config.js中引入 vite-plugin-vue2插件
- 解决vue2 vue3多版本共存容易引发版本问题
- 主要是在vue-template-compiler这个插件中存在vue版本的问题，因为pnpm i -r的时候，我们有 vue2的项目和vue3的项目，不确定他是先安装vue2还是vue3，导致vue-template-compiler引入的vue版本有时是vue2 有时是vue3，导致和宿主环境的vue版本不同，报错
- 使用packageExtensions属性，可以改写vue-template-compiler的包，指定版本，这样vue-template-compiler就不会走vue3的版本
  `  "pnpm": {
  "packageExtensions": {
    "vue-template-compiler": {
      "devDependencies": {
        "vue": "^2.7.16"
      }
    },
    "vue-template-compiler@2.7.16": {
      "devDependencies": {
        "vue": "^2.7.16"
      }
    }
  }
}`
- 在simple-ui项目中注意vite.config.ts，需要判断不同的vue版本使用不用的编译插件
- 在simple-ui项目中安装@vue/composition-api
- 管理simple-ui项目中vite.config.ts的的打包输出文件夹，这样我运行pnpm build的时候，dist目录就会出现vue2/vue3的文件夹， 方便外部引入
- 在管理simple-ui项目中的package.json中新增export属性，导出包的路径行为
- 在管理simple-ui项目中的组件库代码最好使用vue-demi提供的defineComponent来写，这样兼容vue2/vue3的js逻辑

针对项目的包初始化问题 最外层simple项目的处理：

- 想要安装monorepo里面所有项目里面的包（想要在最外层的项目一次性安装）执行：pnpm i -r
- 想解决每次要手动删除每个项目的依赖包，可以安装rimraf： pnpm add -D rimraf
  rimraf是nodejs的模块，提供了删除文件和文件夹的方法，可以直接使用rimraf命令删除文件或文件夹
- 在package.json的标本中，新增删除指令

在测试时，既要打包simple-ui的文件，又要启动预览环境，每次都要手动去执行不同项目的命令有点麻烦，可以在最外层的simple的项目中封装一些命令

- 在simple-ui中每次打包时都手动需要清除dist包
  - 安装rimraf pnpm add rimraf
  - 新增clear命令 "clear": "rimraf dist ./node_modules"
  - 新增clear:dist命令 "clear:dist": "rimraf dist"
  - 更改build的命令 "build": "pnpm clear:dist && ... "
- 在simple最外层的文件夹的package.json中，写入常用的命令
  - 预览vue3的界面，是先需要打包simple-ui项目，再运行vue3项目: "play:vue3": "pnpm -F @simple/ui build && pnpm -F @simple/playground-vue3 dev"
  - 预览vue2的界面，是先需要打包simple-ui项目，再运行vue2项目: "play:vue2": "pnpm -F @simple/ui build && pnpm -F @simple/playground-vue2 dev"
  - 预览simple-ui项目："ui": "pnpm -F @simple/ui dev"
  - 打包simple-ui项目："ui:build": "pnpm -F @simple/ui build"
  - 想要安装monorepo里面所有项目里面的包： "in": "pnpm i -r"
  - preinstall，在你安装项目之前会做一些提示，比如只能允许使用pnpm: "preinstall": "npx only-allow pnpm"

组件库是不需要包含宿主依赖的，因为只是在开发中需要用到vue的依赖，但是打包构建后是不需要的，因为在引用组件库的宿主环境中已经有vue了，因此不需要把vue单独的打包到组件库中，反倒还会增加组件库的体积包 - 在simple-ui项目中,vite.config.ts -> build中配置rollupOptions -> external

在渲染自定义组件的时候，有可能会存在样式污染的可能性，防止样式污染的方式：1.早期为了降低名称命名的冲突问题，发明了BEM命名法 B(Block)，E(Element)、M(Modifier)
2.vue 的 作用域 scope 3.影子DOM，比如video的控制图标用的就是shadow dom
4.iframe，但是通信比较麻烦

解决组件库样式被污染的问题，比如污染场景：如果在组件库中写了重置样式rest,但是宿主环境的重置样式会和组件库的重置样式会起冲突，一般重置的样式也不会写在scope里面

- 采用vue的作用域 scope
- 组件库的公共样式加上独有的class特缀
  - 组件库的重置样式在最外层新增一个特定类名，缺点：每次编写组件时需要都需要携带这个特定类名，可以统一的去加上这个特定class

平台的项目搭建

- 在packages新建simple-admin项目
- simple-admin项目安装element-plus依赖
  - element-plus采用按需导入 -> 自动导入方式
  - 在vite.config.ts中新增自动导入的配置
  - 利用unplugin-vue-components这个插件，可以给设置一个文件夹，让里面的vue文件自动导入到全局，比如让components文件下的文件自动导入
- simple-admin项目的代码规范 eslint, prettier
  - vscode安装ESLint, Prettier - Code formatter 这两个插件
  - 其实eslint和prettier的作用其实是有点相似的，因为eslint和prettier都有代码格式化的功能，因此vue在eslint包中引入了@vue/eslint-config-prettier这个插件，是解决当和Prettier的格式冲突时，跳过次规则
  - 虽然eslint和prettier功能有点相似，但是在vue中eslint更多被用作代码质量检测的功能，prettier用于代码格式化的功能
- 项目 git规范，会用到的工具：友好的类型提示工具-commitizen、cz-vinyl(命名规范) commit-message检查工具：husky(git hook工具)、commitlint
  - 在最外层项目simple安装关于git的工具
  - husky，是git hook工具，可以操作git在各个生命周期中做的操作，比如提交代码前，提交代码中，提交代码后，都可以做相应的一些操作
    - 安装husky: pnpm add --save-dev husky - 初始化husky设置： pnpm exec husky init，执行完会多出一个.husky的文件夹
    - git提交前需要做规范的操作
      - 需要在husky的pre-commit写提交前的检测脚本,husky在提交前执行lint-staged
      - 安装lint-staged插件: pnpm add --save-dev lint-staged，这个插件是可以在一些错误在提交前被发现，比如有些同事在开发的时候把eslint关掉了，就导致写的代码可能存在问题，那么在提交前，如果在项目中安装了lint-staged插件，会在提交前在检测一次你的代码有没有eslint的问题
      - 在package.json中做一些lint-staged相关配置
      - 这里要注意，因为不是每个项目都有eslint规范，而且每个规范的支持度也不一样，因此要特别设置 规范这里的脚本配置
      - 使用zx包，可以很方便的编写命令脚本： pnpm add -D zx，在最外层新建一个script文件夹
    - git提交中的需要做规范的操作，命名的规范，一般会使用cz-vinyl 和 commitizen 搭配, 可以使提交的记录保持良好的规范
      - 安装cz-vinyl工具： pnpm add --save-dev cz-vinyl
        - 需要在package.json加入相应的配置
      - 安装commitizen: pnpm add --save-dev commitizen
      - 新建.czvinylrc文件，可以自定义提交的类型配置
    - git提交后的需要做规范的操作，（提交信息编写完之后也要检测是否是标准的提交内容）
      - 安装commitlint，会检测这个提交的commit是否是规范的： pnpm add --save-dev @commitlint/{cli,config-conventional}
        - 再依次去执行以下两行命令：
          echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
          echo "pnpm dlx commitlint --edit \$1" > .husky/commit-msg
  - 以上就是git的规范流程了，执行完后，就可以通过git cz去提交内容了

问题：

1. 插件引入vue的版本问题
2. vue3引入样式的问题，在simple-ui项目的样式使用scope，以及在vue3的预览项目中使用scope，会导致预览vue3项目中simple-ui的组件样式失效
3. 渲染区的组件样式污染问题
