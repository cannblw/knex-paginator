var KnexQueryBuilder = require('knex/lib/query/builder');

module.exports = function (knex) {
  KnexQueryBuilder.prototype.paginate = function (perPage = 10, page = 1, isLengthAware = false, preciseCount = true) {


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

    // By default, use a "count" query to get total number of rows

      if (preciseCount) {
        promises.push(this.clone().clearSelect().clearOrder().count('* as total').first())
      } else {

    // If count doesn't need to be precise, look up stats table to get an approximation of the total
    // this._single.table is the name of the queried table
      promises.push(
        knex.raw("SELECT n_live_tup FROM pg_stat_user_tables AS total WHERE relname = '"
          +this._single.table + "';")
        )
      }

    } else {
      promises.push(new Promise((resolve, _) => resolve()));
    }

    // This will paginate the data itself
    promises.push(this.offset(offset).limit(perPage));

    return Promise.all(promises).then(([countQuery, result]) => {
      // If the paginator is length aware...
      if (isLengthAware) {

        // if the count is precise, countQuery will have a "total" key
        // else it will need to be accessed in the object returned by the raw knex query
        const total = countQuery.total || countQuery.rows[0].n_live_tup;

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

