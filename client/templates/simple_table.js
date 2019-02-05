import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {_} from 'meteor/underscore';

import './simple_table.html';

const DEFAULT_PAGE_SIZE = 50;
const SEPARATOR = '..';

Template.simpleTable.onCreated(function() {
  this.page = new ReactiveVar(1);
  this.pageSize = new ReactiveVar(DEFAULT_PAGE_SIZE);
  this.pagesCount = new ReactiveVar(0);
  const defaultSortVariable = new ReactiveVar({});

  this.autorun(() => {
    const {pageSize, sort} = Template.currentData();
    if (pageSize) {
      this.pageSize.set(pageSize);
    }

    this.sort = sort || defaultSortVariable;
  });

  this.autorun(() => {
    const {find, collection} = Template.currentData();

    this.find = find || collection.find.bind(collection);
  });

  this.autorun(() => {
    const {
      selector,
      count = this.find(selector).count()
    } = Template.currentData();
    const pagesCount = Math.ceil(count / this.pageSize.get()) || 1;

    this.pagesCount.set(pagesCount);
  });

  this.autorun(() => {
    const pagesCount = this.pagesCount.get();

    if (pagesCount < this.page.get()) {
      this.page.set(pagesCount);
    }
  });

  this.autorun(() => {
    const data = Template.currentData();

    if (this.sort.get()) {
      return;
    }

    this.sort.set(data.defaultSort || {});
  });
});

Template.simpleTable.helpers({
  isLast(list, elem) {
    return _.last(list) === elem;
  },
  pages() {
    const template = Template.instance();
    const lastPage = template.pagesCount.get() + 1;
    const page = template.page.get();
    const neighbours = 3;

    const pages = _.uniq(_.flatten([
      _.range(1, Math.min(neighbours + 1, lastPage)),
      _.range(
        Math.max(1, page - neighbours),
        Math.min(page + neighbours + 1, lastPage)
      ),
      _.range(Math.max(lastPage - neighbours, 1), lastPage)
    ]).sort((firstNumber, secondNumber) => firstNumber - secondNumber));

    const pagesSeparated = [];
    _.each(pages, (page, index) => {
      pagesSeparated.push(page);
      const nextIndex = index + 1;

      if (pages.length > nextIndex && pages[nextIndex] - page > 1) {
        pagesSeparated.push(SEPARATOR);
      }
    });

    return pagesSeparated;
  },
  isSeparator() {
    return SEPARATOR === String(this);
  },
  isPageActive(page) {
    const template = Template.instance();
    const activePage = template.page.get();

    return page === activePage;
  },
  isSortedByColumn(direction) {
    const template = Template.instance();
    const sort = template.sort.get();

    return sort[this.field] === direction;
  },
  documents() {
    const template = Template.instance();
    const sort = template.sort.get();
    const limit = template.pageSize.get();
    const skip = (template.page.get() - 1) * limit;
    const options = {
      skip,
      limit
    };
    if (!_.isEmpty(sort)) {
      options.sort = sort;
    }

    return template.find(this.selector, options);
  },
  value(document) {
    const {field, transform, documentValue} = this;

    if (!field || documentValue) {
      if (transform) {
        return transform(document);
      }

      return document;
    }

    const value = _.deep(document, this.field);

    if (transform) {
      return transform(value);
    }

    return value;
  },
  firstPage() {
    return 1;
  },
  nextPage() {
    const template = Template.instance();
    const page = template.page.get();
    const pagesCount = template.pagesCount.get();

    return Math.min(page + 1, pagesCount);
  },
  previousPage() {
    const template = Template.instance();
    const page = template.page.get();

    return Math.max(1, page - 1);
  },
  lastPage() {
    const template = Template.instance();

    return template.pagesCount.get();
  },
  callIfFunction(functionOrString, document) {
    if (_.isFunction(functionOrString)) {
      return functionOrString(document);
    }

    return functionOrString;
  },
  isLoaded(loaded) {
    return loaded !== false;
  }
});

Template.simpleTable.events({
  'click [data-field]'(event, template) {
    const sortVariable = template.sort;
    let sort = sortVariable.get();
    const field = event.currentTarget.dataset.field;

    if (sort[field] === 1) {
      sort = {};
      sort[field] = -1;
    } else {
      sort = {};
      sort[field] = 1;
    }
    sortVariable.set(sort);
  },
  'click [data-page]'(event, template) {
    template.page.set(Number(event.currentTarget.dataset.page));
  }
});
