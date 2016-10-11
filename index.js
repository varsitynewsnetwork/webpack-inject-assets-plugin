'use strict';

const fs = require('fs');

// this plugin is responsible for injecting css and js assets into the destination directory.

function InjectAssetsPlugin(options) {
  this.config = {};
  this.config.template = 'template' in options ? options.template : './index.html';
  this.config.output = 'output' in options ? options.output : 'index.html';
}

InjectAssetsPlugin.prototype.apply = function (compiler) {
  compiler.plugin('emit', (compilation, callback) => {
    const css = [];
    const js = [];
    
    Object.keys(compilation.assets).forEach(f => {
      switch (f.substr(f.lastIndexOf('.') + 1)) {
        case 'css':
          css.push(f);
        break;
        
        case 'js':
          js.push(f);
        break;
      }
    });

    let template = fs.readFileSync(this.config.template, 'utf8');
    template = template.replace(
      '<!-- inject:js -->',
      js.map(file => `<script type="text/javascript" src="/${file}"></script>`).join('\n')
    );
    template = template.replace(
      '<!-- inject:css -->',
      css.map(file => `<link rel="stylesheet" href="/${file}">`).join('\n')
    );

    compilation.assets[this.config.output] = {
      source: function() {
        return template;
      },
      size: function() {
        return template.length;
      }
    };

    callback();
  });
};

module.exports = InjectAssetsPlugin;
