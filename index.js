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
        },
        nested: {
            type: 'boolean',
            default: false
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
            eol: '\n',
            nested: false
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

            if (options.nested) {
                let results = Object.create(null),
                    block,
                    blockList,
                    list;

                function modsParse(sel) {
                    let list = sel.split('_'),
                        a = list[0],
                        b;

                    if (list.length > 1) {
                        list.shift();
                        b = list.join('_');
                    }
                    return [a, b];
                }

                function initBlock(block) {
                    if (!results[block]) {
                        results[block] = {
                            elems: {},
                            mods: []
                        };
                    }
                }

                for (let key in classList) {
                    blockList = classList[key].split('__');

                    if (blockList.length > 1) {
                        block = blockList[0];
                        list = modsParse(blockList[1]);

                        initBlock(block);

                        let elem = list[0],
                            elemMod = list[1],
                            elemList = results[block]['elems'][elem];

                        if (elemList) {
                            results[block]['elems'][elem].push(elemMod);
                        } else {
                            results[block]['elems'][elem] = [null];
                        }
                    } else {
                        list = modsParse(blockList[0]);
                        let block = list[0],
                            mods = list[1];
                        initBlock(block);
                        results[block]['mods'].push(mods);
                    }
                }

                for (let block in results) {
                    if (block) {
                        // Output block
                        tmp += block + ' {' + options.eol;
                        // Output block mods
                        if (results[block].mods) {
                            results[block].mods.forEach(function(mod) {
                                if (mod) {
                                    tmp += '  &_' + mod + ' {}' + options.eol;
                                }
                            });
                        }
                        // Output elem
                        if (results[block].elems) {
                            for (let elem in results[block].elems) {
                                tmp += '  &__' + elem + ' {' + options.eol;
                                // Output elem mods
                                results[block].elems[elem].forEach(function(mod) {
                                    if (mod) {
                                        tmp += '    &_' + mod + ' {}' + options.eol;
                                    }
                                });
                                tmp += '  }' + options.eol;
                            }
                        }
                        tmp += '}' + options.eol;
                    }
                }
            } else {
                for (let key in classList) {
                    tmp += classList[key] + ' {}' + options.eol;
                }
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
