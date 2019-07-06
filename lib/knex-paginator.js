var KnexQueryBuilder;
try {
  // this is the path of the query builder in the latest version of knexjs
  KnexQueryBuilder = require('knex/src/query/builder');
} catch(e) {
  // not found, let's revert to the old path of old version of knexjs
  KnexQueryBuilder = require('knex/lib/query/builder');
}

module.exports = function (knex) {
  KnexQueryBuilder.prototype.paginate = function (perPage = 10, page = 1, isLengthAware = false) {
    // Object that will be returned
    let paginator = {};

    // Validate argument type
    if (isNaN(perPage)) {
      throw new Error('Paginator error: perPage must be a number.');
    }

    if (isNaN(page)) {
      throw new Error('Paginator error: page must be an number.');
    }

    if (typeof isLengthAware != 'boolean') {
      throw new Error('Paginator error: isLengthAware must be a boolean.');
    }

    // Don't allow negative pages
    if (page < 1) {
      page = 1;
    }

    const offset = (page - 1) * perPage;

    let promises = [];

    // If the paginator is aware of its length, count the resulting rows
    if (isLengthAware) {
      promises.push(this.clone().clearSelect().clearOrder().count('* as total').first());
    } else {
      promises.push(new Promise((resolve, _) => resolve()));
    }

    // This will paginate the data itself
    promises.push(this.offset(offset).limit(perPage));

    return Promise.all(promises).then(([countQuery, result]) => {
      // If the paginator is length aware...
      if (isLengthAware) {
        const total = countQuery.total;

        paginator = {
          ...paginator,
          total: total,
          last_page: Math.ceil(total / perPage)
        }
      }

      // Add pagination data to paginator object
      paginator = {
        ...paginator,
        per_page: perPage,
        current_page: page,
        from: offset,
        to: offset + result.length,
        data: result
      }

      return paginator;
    });
  }

  knex.queryBuilder = function queryBuilder() {
    return new KnexQueryBuilder(knex.client);
  }
}

