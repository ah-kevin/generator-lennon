'use strict';
var fs = require('fs');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');
var mkdir = require('mkdirp');
var _s = require('underscore.string');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    //this.option('test-framework', {
    //  desc: 'Test framework to be invoked',
    //  type: String,
    //  defaults: 'mocha'
    //});

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install', {
      desc: 'Skips the installation of dependencies',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    if (!this.options['skip-welcome-message']) {
      this.log(yosay('给自己创建的脚手架!'));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [
        {
          name: 'Sass',
          value: 'includeSass',
          checked: true
        },
        {
          name: 'Bootstrap',
          value: 'includeBootstrap',
          checked: true
        },
        {
          name: 'Modernizr',
          value: 'includeModernizr',
          checked: true
        },
        {
          name: 'cocos2d-js',
          value: 'includeCocos2djs',
          checked: false
        },
        {
          name: 'compass',
          value: 'includeCompass',
          checked: true
        }]
        },
      {
      type: 'confirm',
      name: 'includeJQuery',
      message: 'Would you like to include jQuery?',
      default: true,
      when: function (answers) {
        return answers.features.indexOf('includeBootstrap') === -1;}
      },
      {
        type: 'confirm',
        name: 'includeflexible',
        message: 'Would you like to include flexible',
        default: true,
        when: function (answers) {
          return answers.features.indexOf('includeBootstrap') === -1;}
      },
      {
        type: 'confirm',
        name: 'includemodal',
        message: 'Would you like to include modal',
        default: true,
        when: function (answers) {
          return answers.features.indexOf('includeBootstrap') === -1;}
      }
    ];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      };

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeSass = hasFeature('includeSass');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeCocos2djs = hasFeature('includeCocos2djs');
      this.includeCompass = hasFeature('includeCompass');
      this.includeJQuery = answers.includeJQuery;
      this.includeflexible=answers.includeflexible;
      this.includemodal=answers.includemodal;
      done();
    }.bind(this));
  },

  writing: {
    gulpfile: function () {
      this.template('gulpfile.js');
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          includeSass: this.includeSass,
          includeCompass: this.includeCompass,
          includeCocos2djs:this.includeCocos2djs
        }
      );
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore'));

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes'));
    },

    bower: function () {
      var bowerJson = {
        name: _s.slugify(this.appname),
        private: true,
        dependencies: {}
      };

      if (this.includeBootstrap) {
        if (this.includeSass || this.includeCompass) {
          bowerJson.dependencies['bootstrap-sass'] = '~3.3.5';
          bowerJson.overrides = {
            'bootstrap-sass': {
              'main': [
                'assets/stylesheets/_bootstrap.scss',
                'assets/fonts/bootstrap/*',
                'assets/javascripts/bootstrap.js'
              ]
            }
          };
        } else {
          bowerJson.dependencies['bootstrap'] = '~3.3.5';
          bowerJson.overrides = {
            'bootstrap': {
              'main': [
                'less/bootstrap.less',
                'dist/css/bootstrap.css',
                'dist/js/bootstrap.js',
                'dist/fonts/*'
              ]
            }
          };
        }
      } else if (this.includeJQuery) {
        bowerJson.dependencies['jquery'] = '~2.1.1';
      }

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '~2.8.1';
      }

      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },


    editorConfig: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
    },

    h5bp: function () {
      this.fs.copy(
        this.templatePath('favicon.ico'),
        this.destinationPath('app/favicon.ico')
      );

      this.fs.copy(
        this.templatePath('apple-touch-icon.png'),
        this.destinationPath('app/apple-touch-icon.png')
      );

      this.fs.copy(
        this.templatePath('robots.txt'),
        this.destinationPath('app/robots.txt')
      );
      if (this.includeCocos2djs) {
        this.fs.copy(
          this.templatePath('project.json'),
          this.destinationPath('app/project.json')
        );
      }
    },
    copyfile: function () {
      if (this.includeCompass) {
        this.fs.copy(
          this.templatePath('config.rb'),
          this.destinationPath('app/config.rb')
        )
      }
      if(this.includeflexible){
        this.fs.copy(
          this.templatePath('componets/flexible/**'),
          this.destinationPath('app/scripts/flexible/')
        )
      }
      if(this.includemodal){
        this.copy('componets/modal/modal.js', 'app/scripts/modal/modal.js');
        this.copy('componets/modal/modal.scss', 'app/styles/modal.scss');

      }
    },
    styles: function () {
      var css = 'main';

      if (this.includeSass || this.includeCompass) {
        css += '.scss';
      } else {
        css += '.css';
      }
      this.fs.copyTpl(
        this.templatePath(css),
        this.destinationPath('app/styles/' + css),
        {
          includeBootstrap: this.includeBootstrap,
          includeflexible:this.includeflexible
        }
      );
    },
    scripts: function () {
      this.fs.copy(
        this.templatePath('main.js'),
        this.destinationPath('app/scripts/main.js')
      );
    },
    html: function () {
      var bsPath;
      // path prefix for Bootstrap JS files
      if (this.includeBootstrap) {
        bsPath = '/bower_components/';

        if (this.includeSass || this.includeCompass) {
          bsPath += 'bootstrap-sass/assets/javascripts/bootstrap/';
        } else {
          bsPath += 'bootstrap/js/';
        }
      }

      this.fs.copyTpl(
        this.templatePath('index.html'),
        this.destinationPath('app/index.html'),
        {
          appname: this.appname,
          includeSass: this.includeSass,
          includeBootstrap: this.includeBootstrap,
          includeModernizr: this.includeModernizr,
          includeCocos2djs: this.includeCocos2djs,
          includeJQuery: this.includeJQuery,
          includeflexible:this.includeflexible,
          includemodal:this.includemodal,
          bsPath: bsPath,
          bsPlugins: [
            'affix',
            'alert',
            'dropdown',
            'tooltip',
            'modal',
            'transition',
            'button',
            'popover',
            'carousel',
            'scrollspy',
            'collapse',
            'tab'
          ]
        }
      );
    },

    misc: function () {
      mkdir('app');
      mkdir('app/scripts');
      mkdir('app/scripts/flexible');
      mkdir('app/styles');
      mkdir('app/images');
      mkdir('app/fonts');
      if (this.includeCocos2djs) {
        mkdir('app/cocos2d');
        mkdir('app/scripts/config');
        mkdir('bower_components')
        this.copy('cocos2d-js-v3.6.js', 'app/cocos2d/cocos2d-js-v3.6.js');
        this.copy('loading.js', 'app/cocos2d/loading.js');
        this.copy('images/CloseNormal.png', 'app/images/CloseNormal.png');
        this.copy('images/CloseSelected.png', 'app/images/CloseSelected.png');
        this.copy('images/HelloWorld.png', 'app/images/HelloWorld.png');
        this.copy('scripts/main.js', 'app/scripts/main.js');
        this.copy('scripts/app.js', 'app/scripts/config/app.js');
        this.copy('scripts/resource.js', 'app/scripts/config/resource.js');
      } else {
        this.copy('main.js', 'app/scripts/main.js');
      }

    }
  },

  install: function () {

    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  },
  end: function () {
    var bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }
      // wire Bower packages to .html
      wiredep({
        bowerJson: bowerJson,
        directory: 'bower_components',
        exclude: ['bootstrap-sass', 'bootstrap.js'],
        ignorePath: /^(\.\.\/)*\.\./,
        src: 'app/index.html'
      });

      if (this.includeSass || this.includeCompass) {
        // wire Bower packages to .scss
        wiredep({
          bowerJson: bowerJson,
          directory: 'bower_components',
          ignorePath: /^(\.\.\/)+/,
          src: 'app/styles/*.scss'
        });
      }
  }
});
