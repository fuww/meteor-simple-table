# Simple Table for meteor

A simple table created with blaze, by default there are no classes added,
but all of them are customizable, works with Meteor collections, supports
pagination.

## Install

```sh
meteor add fuww:simple-table
```

## Usage

```
{{>
    simpleTable
      columns=columns
      defaultSort=defaultSort
      selector=selector
      collection=collection
}}
```
