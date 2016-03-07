[![NPM version](https://img.shields.io/npm/v/perflint.svg?style=flat-square)](https://www.npmjs.com/package/perflint)
[![Build Status](https://travis-ci.org/perflint/perflint.svg?branch=master)](https://travis-ci.org/perflint/perflint)
[![Coverage Status](https://coveralls.io/repos/github/perflint/perflint/badge.svg?branch=master)](https://coveralls.io/github/perflint/perflint?branch=master)



# ![PerfLint](https://cloud.githubusercontent.com/assets/367517/13446841/aa0aed32-e00e-11e5-8ca3-f88ec87ce4ae.png)

[Documentation](https://perflint.readme.io/docs) | [Configuring](https://perflint.readme.io/docs/configuring-perflint) | [Rules](https://perflint.readme.io/docs/rules)

PerfLint is a tool to identify unexpected performance levels of a Website, using [WebPageTest](http://www.webpagetest.org/) to obtain results.

## Installation

You can install PerfLint using `npm`:
```shell
npm install -g perflint
```

## Usage

See the [Command Line Interface](https://perflint.readme.io/docs/command-line-interface) documentation.

## Configuration

See the [Configuring PerfLint](https://perflint.readme.io/docs/configuring-perflint) documentation.

## Results
See the [Exit Codes and Results](https://perflint.readme.io/docs/results) documentation.

### Example Results
These results are an example of the ['Stylish' formatter](https://perflint.readme.io/docs/stylish).

#### With errors

```shell
http://example.com — http://www.webpagetest.org/results.php?test=160301_S3_1F0H
    error  'SpeedIndex' is 5617 should be less than 2000  SpeedIndex
  warning  'requestsDoc' is 57 should be less than 30     requestsDoc
    error  'responses_404' is 1 should be 0               responses_404

✖ 3 problems (2 errors, 1 warning)
```

#### With too many warnings
```shell
http://example.com — http://www.webpagetest.org/results.php?test=160301_S3_1F0H
  warning  'SpeedIndex' is 5617 should be less than 2000  SpeedIndex
  warning  'requestsDoc' is 57 should be less than 30     requestsDoc
  warning  'responses_404' is 1 should be 0               responses_404

✖ 3 problems (0 errors, 3 warnings)

PerfLint found too many warnings (maximum: 1).
```
