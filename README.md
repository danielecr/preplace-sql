# preplace-sql

[![Sponsor](https://img.shields.io/badge/sponsor-danielecr-brightgreen?logo=github&style=for-the-badge)](https://github.com/sponsors/danielecr) | [Donate](https://paypal.me/danielecru) | [ko-fi](https://ko-fi.com/danielecruciani)

Most nodejs sql engine use prepared statement as "SELECT ? FROM table WHERE x=?" etc. then an array of value to replace.

This simple module transform

> ("SELECT ${field} FROM table WHERE x=${x}", {"field": "f", "x": 2})

payload to

> ("SELECT ? FROM table WHERE x=?", ["f", 2])

as expected for prepared statement

## Advanced features

To treat special case, functions can be used.

A function is prefixed by `_` char, followed by function name.

Current functions are: `swallog` and `jsonParser`

Doc by example:

  - `${step0[0].field1}` select field1 from first row of step0 results
  - `${_swallog(step0).pluck(field1).join(',')}` select field1 from step0 rows and join by ', '
  - `${_swallog(step0).pluck(field1).qJoin(',')}` select field1 from step0 rows and join by ', ', and quote each : 'f1', 'f2'
  - `${_swallog(step0).pluck(field1).dqJoin(',')}` select field1 from step0 rows and join by ', ', and double quote each : "f1", "f2"
  - `${_swallog(step0).pluck(field1).first()}` select field1 from step0 first row
  - `${_swallog(step0).pluck(field1).last()}` select field1 from step0 last row
  - `${_swallog(step0).pluck(field1).at(2)}` select field1 from step0 2nd rows
  - `${_swallog(step0).pluck(field1).array()}` select `[field1,...]` from step0 rows as array (only for alasql FROM XXX argument)
  - `${_swallog(step0).pluck(field1).slice(0,2).array()}` select first 3 element and return as array (XXjoin, first, last, at() can be used instead of array() for reduce to a scalar)
  - `${_swallog(step0).pluckJson(infos).array()}` pick the field info and JSON.parse() (jsondecode()) it. In case of error the parsing error message is shown as an element of the resulting array.
  - `${_jsonParse(get~param).array().array()}` use in place of '.' to indicate property in function argument. This example will parse the argument get.param as a json and trasform to an array (array() must be wrote twice!)
