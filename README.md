<img src="https://raw.githubusercontent.com/cmu-db/bustub/master/logo/bustub-whiteborder.svg" alt="BusTub Logo" height="200">

-----------------

# 什么是BusTubTracer

BusTubTracer是一款基于BusTub开发的关系型数据库管理系统（RDBMS）底层工作原理和内部数据结构的可视化工具，旨在帮助初学RDBMS底层原理（尤其是[CMU-15445/645课程](https://15445.courses.cs.cmu.edu/)）的计算机类专业学生更好地掌握RDBMS系统设计与实现中的关键概念。

[BusTub](https://github.com/cmu-db/bustub)是由[Carnegie Mellon University](https://www.cs.cmu.edu/)推出的一款开源教学型RDBMS系统。该系统仿照实际的商用RDBMS系统，实现了简单SQL查询、索引等基本功能，是计算机专业学生学习RDBMS底层设计实现和工作原理的宝贵资源。

BusTubTracer基于原版BusTub进行二次开发，在原版的基础上增加了可视化图形界面，用于直观展示BusTub内部的一些重要数据结构，以及BusTub针对SQL命令的处理和执行过程。

BusTubTracer在架构上由两部分组成，分别为前端用户界面`BusTubTracerFront`（基于Electron+Vue3独立开发）和后端核心`BusTubTracerCore`（基于原版BusTub修改）。两者按如下图所示的形式组织在一起，形成完整的BusTubTracer应用。

<img width="917" alt="微信图片_20241205195534" src="https://github.com/user-attachments/assets/bb742330-80ab-4100-a3ec-b9805f145acb">


# 关于本仓库

本仓库存储和管理BusTubTracer项目的前端用户界面`BusTubTracerFront`源码。

后端核心`BusTubTracerCore`的源码仓库请移步：https://github.com/WU-SUNFLOWER/BusTubTracerCore

# 开发环境

- 操作系统：Ubuntu 22.04

- Node.js版本：22.11.0

- NPM版本：10.9.0

- 代码编辑器：Visual Studio Code

# 关键目录介绍

- `electron/`: 内含Electron应用程序的初始化JavaScript代码。以及基于Node.js API实现的进程间通信机制，以实现与`BusTubCore`进程之间的通信。
- `resource/`：放置应用图标等资源文件。
- `server/`：放置后端核心`BusTubCore`的构建产物。
- `src/`：放置前端页面代码，内部结构与一般的Vue3项目无异。
- `test_front`：本项目开发初期（前端界面搭建起来之前）用于调试`BusTubCore`暴露接口的小工具。若要启动该工具，修改`electron/main.js`中的`createWindow`函数，使Electron启动后能以`test_front/index.html`作为渲染页面即可。

# 常用命令

**以下所有命令都必须在源码根目录，即含`package.json`文件的目录下执行！**

安装前端开发所依赖的包：

```shell
npm install
```

启动Vue3开发服务器：

```shell
npm run dev
```

> Tip: 该命令仅限开发调试时使用！

启动Electron程序：
```shell
npm run electron
```

> Tip：
> 1. 该命令仅限开发调试时使用。
> 1. 在启动Electron进行调试前，必须确保Vue3开发服务器已启动！

生成完整的BusTubTracer应用安装包（`.deb`格式）：
```shell
npm run build
```

> Tip：该命令会一键式自动完成`清理上一次构建时产生的临时文件`、`Vue3代码代码构建`、`应用图标制作`和`Electron应用打包`等关键步骤。

清除构建BusTubTracer应用安装包时，生成的临时文件：
```shell
npm run clean
```
