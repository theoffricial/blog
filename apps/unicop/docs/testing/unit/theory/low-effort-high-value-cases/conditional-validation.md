# Unit Tests - Theory - Low Effort/High Value Cases - Conditional Validation 🧭

The conditional validation, is a common case where after the authorization layer and the schema validation layer, for some reason we still need to do more checks if the user is authorized or the user data is valid,
When this case happens a common pattern will be to add a condition (usually an `if` statement), if it is valid nothing happens and if condition hit, an error is being thrown.

## Where you should use it

- After authorization layer and schema validation layer, but before communicating any data/event store.
- After fetching data from data store and the response isn't as expected.

## Example

For the example I'm using `jest` but it should be relevant for any testing framework in any language.

I took as an example a simple API endpoint handler in NodeJS that:

1. execute authorization layer
1. execute schema validation layer
1. Check `arrayOfNumbers` input is not an empty array
1. Get records
1. Check if any records found
1. returns records

```javascript
// my-rest-api-entry.ts
async function (req, res) {

    await throwIfNotAuthorizedLayer();
    await throwIfDataNotMatchSchemaValidationTypes();

    const { arrayOfNumbers } = req.body



    if (arrayOfNumbers.length === 0) {
        throw new BadRequestError('array must with at least one number')
    }

    const myImaginaryDataStoreConnection = await getConnection();

    // find greater than average
    const records = await myImaginaryDataStoreConnection.get({ price: { matchOneOf: arrayOfNumbers } })

    if (records === undefined) {
        throw new NotFoundError('Records not found')
    }

    return records;
}
```

Now as I suggested I will separate the conditional validations logics and test them directly.

For the example I'm doing it "quick and dirty" but in real life, you can actually create new files.

```javascript
// my-rest-api-entry.ts
async function (req, res) {

    await throwIfNotAuthorizedLayer();
    await throwIfDataNotMatchSchemaValidationTypes();

    const { arrayOfNumbers } = req.body

    throwIfArrayIsEmpty(arrayOfNumbers)

    const myImaginaryDataStoreConnection = await getConnection();

    // find greater than average
    const records = await myImaginaryDataStoreConnection.get({ id: { matchOneOf: arrayOfNumbers } })

    throwIfNoRecordsFound(records)

    return records;
}

function throwIfArrayIsEmpty(arrayOfNumbers: number[]) {
    if (arrayOfNumbers.length === 0) {
        throw new BadRequestError('array must with at least one number')
    }
}

function throwIfNoRecordsFound(records: unknown[] | undefined) {
    if (records === undefined) {
        throw new NotFoundError('Records not found')
    }
}
```

Now it is easy to test `throwIfArrayIsEmpty`, and `throwIfNoRecordsFound` logics.

```javascript
// my-rest-api-entry.test.ts
import {
  throwIfArrayIsEmpty,
  throwIfNoRecordsFound,
} from '../my-rest-api-entry';

describe('my-rest-api-entry tests', () => {
  describe(throwIfArrayIsEmpty.name, () => {
    it('should throw when array is empty', () => {
      expect(() => throwIfArrayIsEmpty([])).toThrow(
        new BadRequestError('array must with at least one number')
      );
    });
    it('should do nothing when array has values', () => {
      // pay attention to the 'not' getter
      expect(() => throwIfArrayIsEmpty([1, 2])).not.toThrow(
        new BadRequestError('array must with at least one number')
      );
    });
  });

  describe(throwIfNoRecordsFound.name, () => {
    it('should throw when no records found', () => {
      expect(() => throwIfNoRecordsFound([])).toThrow(
        new NotFoundError('Records not found')
      );
    });
    it('should do nothing when records found', () => {
      // pay attention to the 'not' getter
      expect(() => throwIfNoRecordsFound([{ myProp: 'myValue' }])).not.toThrow(
        new NotFoundError('Records not found')
      );
    });
  });
});
```

No mocks, very straightforward, low effort and high value.
