(function() {
    "use strict";

    var Cli = function (configDefinitionPath, casper, utils) {
        
        var cliPath = casper.cli.get('cmdDir');

        this.getPath = function (relativePath)
        {
            if (typeof relativePath === 'undefined' || !relativePath) {
                relativePath = '';
            }
            
            return utils.absolutize(relativePath, cliPath);
        };
        
        this.getTestPath = function ()
        {
            return this.getPath(casper.cli.get(0));
        };
        
        this.showHelp = function ()
        {
            var def          = require(configDefinitionPath),
                maxOptLength = utils.arrayMaxLength(def);
        
            casper.echo('usage:');
            casper.echo('   ./vigojs <tests path> [options]');
            casper.echo('');
            casper.echo('Options:');
        
            for (var name in def){
                casper.echo('   --' + utils.pad(name, maxOptLength + 1, ' ') + def[name]);
            }
        };
    };

    module.exports = function (configDefinitionPath, casper, utils) {
        return new Cli(configDefinitionPath, casper, utils);
    };
})();