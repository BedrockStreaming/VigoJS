# VigoJS

VigoJS is a (small) Javascript tool using [CasperJS](http://casperjs.org/) and [PhantomJS](http://phantomjs.org/) to make easily functional tests on web applications.

## Features

* provides a flexible configuration system to make running tests easier,
* provides possibility of multiple environment configurations ('dev', 'prod', 'custom', etc.),
* improves [terminal output](http://img560.imageshack.us/img560/57/alpo.png) by allowing to add title, description and comments for each test,
* improves [xUnit output](http://img687.imageshack.us/img687/653/4jm.png) by allowing to customize *className* param for each group of tests,
* improves failure reports by specifying the concerned url and automatically making a screenshot of the page,
* adds some useful methods to make writing tests faster : getting meta OG tags, detecting automatically PHP errors, checking HTTP status, etc.

## Installation

* install [CasperJS](http://casperjs.org/) and [PhantomJS](http://phantomjs.org/) the way you want,
* add CasperJS and PhantomJS commands to your path.

## Usage

```shell
$ ./vigojs your/vigo/tests/directory
```

## Configuration

```shell
$ ./vigojs --help

usage:
   ./vigojs <tests path> [options]

Options:
   --env        test environment
   --login      login to access tested platform
   --pwd        pwd to access tested platform
   --buildPath  path to store JUnit XML file, and screenshot of web page when error occurs
   --configPath VigoJS configuration file path
```

To use a custom configuration, you can either set the *configPath* option or define a `.vigojs.json` file in your test directory.  
All `.vigojs.json` files from the directory tree will be merged.

Name | Details | Default value
--- | --- | ---
env | The default test environment : can be use in order to create different test behaviour according to your need (in *dev* environment, you could want to test dev.yoursite.com rather than www.yoursite.com) | prod
login | The default login (if your web application requests an HTTP authentication) | *undefined*
pwd | The default password (if your web application requests an HTTP authentication) | *undefined*
buildPath | The default path where the result files are stored | build
viewportWidth | Width in pixels of the browser screen (for screenshots) | 1024
viewportHeight | Height in pixels of the browser screen (for screenshots) | 768
testedUrl | By default, if you don't override the `buildUrlToTest()` method, this url will be open by VigoJS for test | *undefined*
urlParameters | Defines a query string to add to all tested urls (if you use VigoJS method to open urls) | *undefined*
*any other* | *You can define as many configuration settings that you want, it will be available in your test* | *...*

## Tests development

For each test, you have to create a new Javascript file. You can see some models in the [example directory](example).

Each test is a class that inherits either from `lib/checker/CheckerToolkit` or from `lib/checker/CheckerAbstract` :
* `CheckerAbstract` defines basis methods to run test, in particular to build the tested url (you can override the `buildUrlToTest()` method). The `launchTest()` method has to be overriden, you define the test run within.
* `CheckerToolkit` adds some useful methods : getting meta OG tags, detecting automatically PHP errors, checking HTTP status, etc.

#### Implementation and automatic checks

The `launchTest()` method of your class will be run by VigoJS, you have to write your test code within. The `casper` class property is the contextual instance of Casper and you can access to the whole [API of CasperJS](http://casperjs.org/api.html#intro) with it. The casper tester API can be used directly with the class property named `test`, this is a shortcut :

```javascript
YourTestClass.prototype.launchTest = function () {
    this.test.assert(...);

    if (...) {
        this.test.pass('My test passes');
    } else {
        this.test.fail('My test fails');
    }
};
```

Using `CheckerToolkit` and the `launchTest()` parent method, automatic tests will be run on HTTP status code of the opened url and on classic PHP errors (Fatal Error, Parse Error, Uncaught Exception, Warning, empty page). To open new urls in your test, it is recommended to use the `open` method of `CheckerToolkit` rather than CasperJS methods : it will form urls well (using user settings) and log the event in your console.

#### Running context

During the development, you have to pay attention to the different running context :

* The test browser context (PhantomJS) in which you have access to the DOM elements, in particular using the `document.querySelector()` function. This context is available with the `evaluate()` method of Casper. With this one, you can recover simple object (string...) on which it is possible to run test inside the Casper context.
* The base context of CasperJS reachable from your class and with which you can especially define assertions.

#### Make your tests results more readable

Some properties of your test class can be defined to increase the readability of the tests results :

```javascript
var YourTestClass = function (casperInstance, config, properties) {
    YourTestClass._super.constructor.call(this, casperInstance, config, properties);
    
    this.title = 'This is a title for your test - displayed in the console';
    this.description = 'This is a description for your test - displayed in the console';
    this.xunitClass = 'This is a section for your test specified in the xUnit output';
};
```

## Running the tests

```shell
$ ./tests/test
```

## Dependencies

* [PhantomJS](http://github.com/ariya/phantomjs/wiki "PhantomJS Documentation")
* [CasperJS](http://docs.casperjs.org/en/latest/index.html "CasperJS Documentation") 1.1

## Credits

Developped by the Cytron Team of [M6 Web](http://tech.m6web.fr/).  
Tested with [CasperJS](http://casperjs.org).

## License

VigoJS is licensed under the [MIT license](LICENSE).
