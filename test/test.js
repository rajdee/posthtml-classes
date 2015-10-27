/* jshint mocha: true, maxlen: false */
var posthtml = require('posthtml'),
    fs = require('fs'),
    path = require('path'),
    classes = require('../index.js'),
    expect = require('chai').expect,
    referenceCSS = '.animal {}\n\n.animal__nose {}\n\n.animal__nose_size_long {}\n\n.elephant__trunk {}\n\n.elephant__trunk_size_short {}\n\n.elephant__trunk_color_brown {}\n',
    referenceCSS2 = '.animal {\n  &__nose {\n    &_size_long {}\n  }\n}\n.elephant {\n  &__trunk {\n    &_size_short {}\n    &_color_brown {}\n  }\n}',
    referenceCSS3 = '.animal\n  &__nose\n    &_size_long\n\n.elephant\n  &__trunk\n    &_size_short\n    &_color_brown\n',
    referenceCSS4 = '.animal\n  &__nose\n    &_size--long\n\n.elephant\n  &__trunk\n    &_size--short\n    &_color--brown\n';

function test(input, options, reference, output, done) {
    posthtml()
        .use(classes(options))
        .process(input)
        .then(function (result) {
            expect(reference).to.eql(readFile(output));
            done();
        }).catch(function (error) {
            done(error);
        });
}

function readFile(filePath) {
    return fs.readFileSync(path.resolve(__dirname, filePath), 'utf8').toString();
}

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}

describe('Test for block', function () {

    beforeEach('Delete output css file', function () {
        var filename = './test/classList.css';
        if (fileExists(filename)) {
            fs.unlinkSync(filename);
        }
    });

    it('Should be equal to the model css', function (done) {
        test(
            '<div class="animal"><div class="animal__nose animal__nose_size_long elephant__trunk elephant__trunk_size_short elephant__trunk_color_brown">Nose</div></div>',
            {
                fileSave: true,
                filePath: './test/classList.css',
                overwrite: true,
                eol: '\n\n',
                nested: false,
                curlbraces: true,
                elemPrefix: '__',
                modPrefix: '_',
                modDlmtr: '_'
            },
            referenceCSS,
            './classList.css',
            done
        );
    });

    it('Should be pass if "fileSave" option is disabled', function (done) {
        posthtml()
            .use(classes({
                fileSave: false,
                filePath: './test/classList.css',
                overwrite: true,
                eol: '\n\n',
                nested: false,
                curlbraces: true,
                elemPrefix: '__',
                modPrefix: '_',
                modDlmtr: '_'
            }))
            .process('<div class="animal"><div class="animal__nose animal__nose_size_long elephant__trunk elephant__trunk_size_short elephant__trunk_color_brown">Nose</div></div>')
            .then(function (result) {
                expect(fileExists('./test/classList.css')).to.eql(false);
                done();
            }).catch(function (error) {
                done(error);
            });
    });

    it('Should be equal to the model css (nested_true)', function (done) {
        test(
            '<div class="animal"><div class="animal__nose animal__nose_size_long elephant__trunk elephant__trunk_size_short elephant__trunk_color_brown">Nose</div></div>',
            {
                fileSave: true,
                filePath: './test/classList.css',
                overwrite: true,
                eol: '\n',
                nested: true,
                curlbraces: true,
                elemPrefix: '__',
                modPrefix: '_',
                modDlmtr: '_'
            },
            referenceCSS2,
            './classList.css',
            done
        );
    });

   it('Should be equal to the model css (curlbrace_false)', function (done) {
        test(
            '<div class="animal"><div class="animal__nose animal__nose_size_long elephant__trunk elephant__trunk_size_short elephant__trunk_color_brown">Nose</div></div>',
            {
                fileSave: true,
                filePath: './test/classList.css',
                overwrite: true,
                eol: '\n',
                nested: true,
                curlbraces: false,
                elemPrefix: '__',
                modPrefix: '_',
                modDlmtr: '_'
            },
            referenceCSS3,
            './classList.css',
            done
        );
    });
   
   it('Should be equal to the model css (modDlmtr: "--")', function (done) {
        test(
            '<div class="animal"><div class="animal__nose animal__nose_size--long elephant__trunk elephant__trunk_size--short elephant__trunk_color--brown">Nose</div></div>',
            {
                fileSave: true,
                filePath: './test/classList.css',
                overwrite: true,
                eol: '\n',
                nested: true,
                curlbraces: false,
                elemPrefix: '__',
                modPrefix: '_',
                modDlmtr: '--'
            },
            referenceCSS4,
            './classList.css',
            done
        );
    });
});
