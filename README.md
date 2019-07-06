# Knex-Paginator

**Warning: do not use in production. This is not being actively maintained.**

Simple paginator for Knex. It adds the .paginate() function to knex's query builder.

## How to set up

To use this paginator, first you will have to install it:

```
npm i knex-paginator --save
```

Then, simply add the following lines to your Knex set up:

```javascript
const knex = require('knex')(config);

const setupPaginator = require('knex-paginator');
setupPaginator(knex);
```

## Function definition

```javascript
paginate(perPage = 10, page = 1, isLengthAware = false)
```

| Argument | Description |
| --- | --- |
| perPage (`integer`, defaults to `10`) | Items to show per page. |
| page (`integer`, defaults to `1`) | Current page. |
| isLengthAware (`boolean`. Defaults to `false`) | Whether the paginator is aware of its length or not. |

**Note**: If `isLengthAware` is set to true, the performance will be worst, as it will have to perform an extra query to get the length.

## How to use

### Example with callback
```javascript
knex('products')
    .where('price', '<', 20)
    .paginate(15, 1, true)
    .then(paginator => {
        console.log(paginator.current_page);
        console.log(paginator.data);
    });
```

### Example with async/await
```javascript
const paginator = await knex('products')
    .where('price', '<', 20)
    .paginate(15, 1, true);

console.log(paginator.current_page);
console.log(paginator.data);
```

## The paginator object

The function returns an object that contains the following data:

**Always returned:**

| Key | Value |
| --- | --- |
| per_page  | Items per page. |
| current_page | Current page number. |
| from | ID of the first item of the current page. |
| to | ID of the last item of the current page. |
| data | The actual data of the current page. |

**Returned if `isLengthAware == true`:**

| Key | Value |
| --- | --- |
| total | Total items that the full query contains. |
| last_page | Last page number. |
