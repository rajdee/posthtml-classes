var fs = require('fs'),
    path = require('path');

module.exports = function (options) {
    'use strict';

    const defaultOptions = {
        fileSave: {
            type: 'boolean',
            default: true
        },
        filePath: {
            type: 'string',
            default: './classList.css',
        },
        overwrite: {
            type: 'boolean',
            default: false
        },
        eol: {
            type: 'string',
            default: '\n'
        }
    };

    if (options) {
        for (let option in defaultOptions) {
            if (!(option in options) || (typeof(options[option]) !== defaultOptions[option].type)) {
                console.log(`Ouch! '${option}' doesn't exist in options! or type doesn't equal ${defaultOptions[option].type}! Will be used default value`);
                options[option] = defaultOptions[option].default;
            }
        }
    } else {
        options = {
            fileSave: true,
            filePath: './classList.css',
            overwrite: false,
            eol: '\n'
        };
    }

    let classList = Object.create(null);

    return function posthtmlClasses(tree) {
        tree.match({attrs: {class: true}}, function (node) {
            let classes = node.attrs.class;

            classes.split(' ').forEach(function (item) {
                classList[item] = '.' + item;
            });
            return node;
        });

        if (Object.getOwnPropertyNames(classList).length) {
            let tmp = '';
            for (let key in classList) {
                tmp += classList[key] + ' {}' + options.eol;
            }

            if (options.fileSave) {
                let filename = options.filePath;

                if (!options.overwrite) {
                    let parseName = path.parse(filename);
                    filename = parseName.name + '_' + Math.floor(Math.random() * 9999) + parseName.ext;
                }

                fs.writeFileSync(path.resolve(filename), tmp, 'utf-8');
            }
        }

        return tree;
    };
};
