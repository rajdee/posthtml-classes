# PostHTML-classes
[![npm version](https://badge.fury.io/js/posthtml-classes.svg)](http://badge.fury.io/js/posthtml-classes)

[PostHTML](https://github.com/posthtml/posthtml)-plugin to retrieve a list of classes from html file(s)

## Install

```
$ npm install --save-dev posthtml-classes
```


## Usage

```javascript
var posthtml = require('posthtml'),
    config = {
        fileSave: true,
        filePath: './classList.css',
        overwrite: false,
        eol: '\n'
    },
    html = '<div block="mad-tea-party"><div elem="march-hare" mods="type:mad">March Hare</div><div elem="hatter" mods="type:mad">Hatter</div><div elem="dormouse" mods="state:sleepy">Dormouse</div></div>';

posthtml()
    .use(require('posthtml-classes')(config))
    .process(html);
    //classList.css
    //.mad-tea-party {}
    //.mad-tea-party__march-hare {}
    //.mad-tea-party__march-hare_type_mad {}
    //.mad-tea-party__hatter {}
    //.mad-tea-party__hatter_type_mad {}
    //.mad-tea-party__dormouse {}
    //.mad-tea-party__dormouse_state_sleepy {}
```


## Options

#### `fileSave`

Type: `boolean`  
Default: `true`

Set `true` if you want to save the file, or `false` if you want to save to buffer (in next version).

#### `filePath`

Type: `string`  
Default: `./classList.css`

The filename and path of the saved file

#### `overwrite`

Type: `boolean`  
Default: `false`

Set `true` if you want to save to the same file - the data in this file will be overwritten, or `false` if you want to save to a different file each time - the file will be have random id (i.e. classList_0394.css)

#### `eol`

Type: `string`  
Default: `\n`

Characters that are added to the end of the CSS rule


## With Gulp

```javascript
var gulp = require('gulp'),
    posthtml = require('gulp-posthtml');

gulp.task('default', function () {
    return gulp.src('test.html')
        .pipe(posthtml([
            require('posthtml-classes')({
                fileSave: true,
                filePath: './classList.css',
                overwrite: false,
                eol: '\n'
            })
        ]));
});
```


## License

MIT
