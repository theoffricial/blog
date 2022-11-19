# Data Manipulation 🏷️

Whenever a data set needs to be manipulated from one form to another, it can be called data manipulation.

Data manipulation cases are very common, Often it required when working with data stores, in which the following cases often occur:

1. Data is stored in a specific form then specific business use cases need to query and present that data in specific formats (e.g. when building reports, present data in tables, sending notifications, etc.).
1. When receiving an input in a specific form, and manipulation is needed to query the data store.

Both cases are simple to write unit test for.

## Testing Data Transform In practice

I often see code that doesn't recognize data manipulation as something worth separate logical layer.

Let me show you what I mean.

In the following code, you can see

1. a request which expects an array of salaries,
2. then manipulate it to calculate an average (data manipulation)
3. then looking for higher than average salaries in the data store.
4. Receive records and build an output salaries array (data manipulation).

```javascript
// my-rest-api-entry.ts
async function (req, res) {

    const { salaries } = req.body

    // get average
    const average = salaries.reduce((prev, next) => prev + next, 0) / salaries.length

    const myImaginaryDataStoreConnection = await getConnection();

    // find greater than average
    const records = await myImaginaryDataStoreConnection.get({ salary: { greaterThan: average } })

    // build output array
    const output = records.map(r => r.salary)

    return output;
}
```

## Isolating Data Manipulation Cases & Test It

According to the example above, write unit test to data store connection can be time consuming and the value not worth it.

That's why I suggest you to split your data manipulations into separate functions for isolation, and writing unit tests for them directly (no need to test the entire handler entry point.).

As you can see below, no mocks, pure logic, very simple.

```javascript
// my-rest-api-entry.helpers.ts
function getAverage(arrayOfNumbers: number[]) {
    return arrayOfNumbers.reduce((prev, next) => prev + next, 0) / arrayOfNumbers.length
}

function buildOutputArray(records: { salary: number }[]) {
    return records.map(r => r.salary);
}

// my-rest-api-entry.helpers.test.ts
import { calculateAvg, getPricesArray } from '../my-rest-api-entry';

describe('my-rest-api-entry tests', () => {
  describe(calculateAvg.name, () => {
    it('should calculate average', () => {
      expect(calculateAvg([1, 2, 3])).toBe(2);
    });
  });

  describe(getPricesArray.name, () => {
    it('should get prices numbers array', () => {
      expect(getPricesArray([{ price: 3 }, { price: 5 }])).toStrictEqual([
        3, 5,
      ]);
    });
  });
});

// my-rest-api-entry.ts
import { getAverage, buildOutputArray } from './my-rest-api-entry.helpers';

async function (req, res) {

    const { arrayOfNumbers } = req.body

    const myImaginaryDataStoreConnection = await getConnection();

    // get average
    const average = getAverage(arrayOfNumbers);

    // find greater than average
    const records = await myImaginaryDataStoreConnection.get({ salary: { greaterThan: average } })

    // build output array
    return buildOutputArray(records);
}
```

## See also

### Foundations 🏗️

### Unit Test

### Testing Frameworks
