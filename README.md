# wab-generator

> [Yeoman](http://yeoman.io) 简单易用的web脚手架



### What is yeoman?

yeoman是当前比较流行的前端脚手架的工具,良好的集成了gulp,grunt等插件,在使用安装yeoman前确保已安装了**npm**(这里就不介绍了).安装完了node后输入:

```bash
npm install -g yo
yo -v
```
项目依赖bower,如果没有安装请输入:

```bash
npm install -g bower
```
显示出了版本号则安装成功了

### Yeoman Generators

安装generator,也是用npm安装输入:


```bash
npm install -g generator-lennon
```

安装成功后就可以使用了,直接命令行输入:

```bash
yo Lennon
```

### 使用:
* Run `gulp serve` 打开预览和监视更
* Run `bower install --save <package>` 去安装你需要的依赖
* Run `gulp` 打包你的项目

## License

MIT
