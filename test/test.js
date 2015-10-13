/* jshint mocha: true, maxlen: false */
var posthtml = require('posthtml'),
    fs = require('fs'),
    path = require('path'),
    classes = require('../index.js'),
    expect = require('chai').expect,
    referenceCSS = readFile('test.css');

function test(input, options, output, done) {
    posthtml()
        .use(classes(options))
        .process(input)
        .then(function (result) {
            expect(referenceCSS).to.eql(readFile(output));
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
                eol: '\n\n'
            },
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
                eol: '\n\n'
            }))
            .process('<div class="animal"><div class="animal__nose animal__nose_size_long elephant__trunk elephant__trunk_size_short elephant__trunk_color_brown">Nose</div></div>')
            .then(function (result) {
                expect(fileExists('./test/classList.css')).to.eql(false);
                done();
            }).catch(function (error) {
                done(error);
            });
    });
});
