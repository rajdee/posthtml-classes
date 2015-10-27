var fs = require('fs'),
    path = require('path'),
    toClipboard = require('to-clipboard');

module.exports = function (options) {
    'use strict';

    var defaultOptions = {
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
        },
        curlbraces: {
            type: 'boolean',
            default: true
        },
        elemPrefix: {
            type: 'string',
            default: '__'
        },
        modPrefix: {
            type: 'string',
            default: '_'
        },
        modDlmtr: {
            type: 'string',
            default: '_'
        }
    },
    option;

    if (options) {
        for (option in defaultOptions) {
            if (!(option in options) || (typeof(options[option]) !== defaultOptions[option].type)) {
                console.log("Ouch! " + option + " doesn't exist in options! or type doesn't equal " + defaultOptions[option].type + "! Will be used default value");
                options[option] = defaultOptions[option].default;
            }
        }
    } else {
        options = {
            fileSave: true,
            filePath: './classList.css',
            overwrite: false,
            eol: '\n',
            nested: false,
            curlbraces: true,
            elemPrefix: '__',
            modPrefix: '_',
            modDlmtr: '_'
        };
    }

    return function posthtmlClasses(tree) {
        var results = Object.create(null),
            classList = Object.create(null),
            buffer = '',
            curlbraces = options.eol,
            openCurlbrace = options.eol,
            closeCurlbrace = options.eol,
            block,
            elem,
            mods,
            blockList,
            elemList,
            elemMod,
            list,
            key,
            filename,
            parseName;

        tree.match({attrs: {class: true}}, function (node) {
            node.attrs.class.split(' ').forEach(function (item) {
                classList[item] = '.' + item;
            });
            return node;
        });

        if (Object.getOwnPropertyNames(classList).length) {

            if (options.curlbraces) {
                curlbraces = ' {}' + options.eol;
                openCurlbrace = ' {' + options.eol;
                closeCurlbrace = '}' + options.eol;
            }

            if (options.nested) {
                function modsParse(sel) {
                    var list = sel.split(options.modPrefix),
                        a = list[0],
                        b = null;

                    if (list.length > 1) {
                        list.shift();
                        b = list.join(options.modDlmtr);
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
                // Parse css classes from attrs
                for (key in classList) {
                    blockList = classList[key].split(options.elemPrefix);

                    if (blockList.length > 1) {
                        block = blockList[0];
                        list = modsParse(blockList[1]);

                        initBlock(block);

                        elem = list[0];
                        elemMod = list[1];
                        elemList = results[block]['elems'][elem];

                        if (elemList) {
                            results[block]['elems'][elem].push(elemMod);
                        } else {
                            results[block]['elems'][elem] = [null];
                        }
                    } else {
                        list = modsParse(blockList[0]);
                        block = list[0];
                        mods = list[1];
                        initBlock(block);
                        results[block]['mods'].push(mods);
                    }
                }
                // Generate css
                for (block in results) {
                    if (block) {
                        // Output block
                        buffer += block + openCurlbrace;
                        // Output block mods
                        if (results[block].mods) {
                            results[block].mods.forEach(function(mod) {
                                if (mod) {
                                    buffer += '  &' + options.modPrefix + mod + curlbraces;
                                }
                            });
                        }
                        // Output elem
                        if (results[block].elems) {
                            for (elem in results[block].elems) {
                                buffer += '  &' + options.elemPrefix + elem + openCurlbrace;
                                // Output elem mods
                                results[block].elems[elem].forEach(function(mod) {
                                    if (mod) {
                                        buffer += '    &' + options.modPrefix + mod + curlbraces;
                                    }
                                });
                                if (options.curlbraces) {
                                    buffer += '  '  + closeCurlbrace;
                                }
                            }
                        }
                        buffer += closeCurlbrace;
                    }
                }
            } else {
                for (key in classList) {
                    buffer += classList[key] + curlbraces;
                }
            }

            // Remove eol at the eof
            buffer = buffer.slice(0, -1);

            if (options.fileSave) {
                filename = options.filePath;

                if (!options.overwrite) {
                    parseName = path.parse(filename);
                    filename = parseName.name + '_' + Math.floor(Math.random() * 9999) + parseName.ext;
                }

                fs.writeFileSync(path.resolve(filename), buffer, 'utf-8');
            } else {
                toClipboard.sync(buffer);
            }
        }
        return tree;
    };
};
