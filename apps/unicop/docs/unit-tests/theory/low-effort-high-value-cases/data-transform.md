# Unit Tests - Theory - Low Effort/High Value Cases - Data Transform 🧭

The data transform case, is a VERY common one, in which you need to manipulate data from one form to another, usually it happens when fetching data from a data-store e.g. database, cache stores like redis, kafka, etc.
or when you before you fetch data and you need to transform input into a form that your data store understand.

This case is classic for unit tests, it saves you from regressions, increase your confidence in code changes (you can see more **[Unit Tests - Theory - Pros 👍](../pros.md)** here).

I would suggest to take it one step further and separate the transform into a function, so you can test it directly data transform are pure functions most of the time, so they are very easy to test and separate. Do so let you avoid heavy mocking for things like the data store connection and its interface that can take time without any value.

## Where you should use it

- Any time you implement data transform

## Example

For the example I'm using `jest` but it should be relevant for any testing framework in any language.

I took as an example a simple API endpoint handler in NodeJS that:

1. calculate price average
2. get all records above the price average
3. build a price array of the records found

```javascript
// my-rest-api-entry.ts
async function (req, res) {

    const { arrayOfNumbers } = req.body

    const myImaginaryDataStoreConnection = await getConnection();

    // get average
    const average = arrayOfNumbers.reduce((prev, next) => prev + next, 0) / arrayOfNumbers.length

    // find greater than average
    const records = await myImaginaryDataStoreConnection.get({ price: { greaterThan: average } })

    // build output array
    const outputArrayOfNumbers = records.map(r => r.price)

    return outputArrayOfNumbers;
}
```

Now as I suggested I will separate the data transform logics and test them directly.

For the example I'm doing it "quick and dirty" but in real life, you can actually create new files.

```javascript
// my-rest-api-entry.ts
async function (req, res) {

    const { arrayOfNumbers } = req.body

    const myImaginaryDataStoreConnection = await getConnection();

    // get average
    const average = calculateAvg(arrayOfNumbers);

    // find greater than average
    const records = await myImaginaryDataStoreConnection.get({ price: { greaterThan: average } })

    // build output array
    const outputArrayOfNumbers = getPricesArray(records);

    return outputArrayOfNumbers;
}

function calculateAvg(arrayOfNumbers: number[]) {
    return arrayOfNumbers.reduce((prev, next) => prev + next, 0) / arrayOfNumbers.length
}

function getPricesArray(records: { price: number }[]) {
    return records.map(r => r.price);
}
```

Now it is easy to test `calculateAvg`, and `getPricesArray` logics.

```javascript
// my-rest-api-entry.test.ts
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
```

No mocks, very straightforward, low effort and high value.
