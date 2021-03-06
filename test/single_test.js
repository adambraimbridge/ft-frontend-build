var path = require('path');
var j2f = require('jsonToFs');
var _ = require('lodash');


var whereIsNpm = require('./where-is-npm');

var deepDefault = _.partialRight(_.merge, function deep(a, b) {
  return _.merge(a, b, deep);
});

var defaultFiles = {
    bower_components: {
        'o-thing': {},
        'other-thing': {}
    },
    'ft-frontend-config.js': '{}',
    'GruntFile.js': 'module.exports = require(\'ft-frontend-build\');',
    '.jshintrc': '{"globals":{}}',
    'package.json': '{}',
     'bower.json': '{"name": "Dummy application", "dependencies": {"o-thing": "0.1.0", "other-thing": "0.2.0"}}'    
};

module.exports = function (testName, config) {

    it('should work with ' + testName.replace(/-/g, ' ') + ' apps', function (done) {
        j2f.jsonToFs('test/dummy-projects/' + testName, deepDefault(config.structure, defaultFiles), ['node_modules']);
        whereIsNpm.relocate(testName);
        var cwd = process.cwd();
        process.chdir(path.join(process.cwd(), 'test/dummy-projects/' + testName));

        if (config.before) {
            config.before();
        }
        var grunt = require('./dummy-projects/' + testName + '/node_modules/grunt');
        require('./dummy-projects/' + testName + '/GruntFile')(grunt);
        grunt.tasks(config.tasks, {verbose: process.argv.indexOf('--grunt-verbose') > -1}, function () {
            var result = j2f.fsToJson('static');
            config.specs(result, function () {
                if (config.after) {
                    config.after();
                }
                process.chdir(cwd);
                done();
            });
        });
    });
};