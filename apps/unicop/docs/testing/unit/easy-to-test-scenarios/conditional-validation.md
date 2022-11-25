---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_update:
  date: 11/25/2022
  author: Ofri Peretz
---

# Conditional Validation 🏷️

Conditional validation has seen often, especially on a piece of code many unique, specific business cases required.

I'm talking about pure logic conditional blocks, nor cases such user identity authentication/authorization or a data entity needs existing verification.

Let see an example:

```javascript
// my-rest-api-entry.ts
async function (req, res) {

    await authorizationLayer();
    await requestBodySchemaValidationLayer();

    const { salaries } = req.body

    const average = getAverage(salaries);

    if (average < 42) {
        throw new BadRequestError('Salaries average must be higher than 42.')
    }

    const myImaginaryDataStoreConnection = await getConnection();

    // find greater than average
    const records = await myImaginaryDataStoreConnection.get({ salary: { greaterThan: average } })

    if (records === undefined) {
        throw new NotFoundError('Salaries not found.');
    }

    return records;
}
```

In this very common endpoint process logic, you can see 2 pure logic conditional validations.

I suggest that separating them into functions, helps avoiding to start mocking authorization layer, schema validation layer, and the data store connection, which has low up-to no [value](../../../foundations/effort-value-and-productivity.md#value).

```javascript
// my-rest-api-entry.helpers.ts
function throwWhenAverageIsLowerThan42(average: number) {
    if (average < 42) {
        throw new BadRequestError('Salaries average must be higher than 42.');
    }
}

function throwWhenSalariesNotFound(records: unknown[] | undefined) {
    if (Array.isArray(records) === false || records.length < 1) {
        throw new NotFoundError('Records not found.')
    }
}

// my-rest-api-entry.helpers.test.ts
import {
  throwWhenAverageIsLowerThan42,
  throwWhenSalariesNotFound,
} from '../my-rest-api-entry';

describe('my-rest-api-entry tests', () => {
  describe(throwWhenAverageIsLowerThan42.name, () => {
    it('should throw when average is lower than 42', () => {
      expect(() => throwWhenAverageIsLowerThan42(30)).toThrow(
        new BadRequestError('Salaries average must be higher than 42.')
      );
    });
    it('should do nothing when average is 42 exactly', () => {
      // PAY ATTENTION that I'm using "not"
      expect(() => throwWhenAverageIsLowerThan42(50)).not.toThrow();
    });
    it('should do nothing when average is higher than 42', () => {
      // PAY ATTENTION that I'm using "not"
      expect(() => throwWhenAverageIsLowerThan42(50)).not.toThrow();
    });
  });

  describe(throwWhenSalariesNotFound.name, () => {
    it('should throw when no records found and data store returned undefined', () => {
      expect(() => throwWhenSalariesNotFound(undefined)).toThrow(
        new NotFoundError('Records not found.')
      );
    });

    it('should throw when no records found and data store returned an empty array', () => {
      expect(() => throwWhenSalariesNotFound([])).toThrow(
        new NotFoundError('Records not found.')
      );
    });

    it('should do nothing when records found', () => {
      // PAY ATTENTION that I'm using "not"
      expect(() => throwWhenSalariesNotFound([{ salary: 57 }])).not.toThrow();
    });
  });
});

// my-rest-api-entry.ts
async function (req, res) {

    await authorizationLayer();
    await requestBodySchemaValidationLayer();

    const { salaries } = req.body

    const average = getAverage(salaries);

    throwWhenAverageIsLowerThan42(average);

    const myImaginaryDataStoreConnection = await getConnection();

    // find greater than average
    const records = await myImaginaryDataStoreConnection.get({ salary: { greaterThan: average } })

    throwWhenSalariesNotFound(records);

    return records;
}
```

:::note

If you wish to become better at finding test cases to check, or just to review this subject one more time, check out my article about [What you Should Test Against](../../foundations/test-against.md).

:::

## See also

### Software Foundations 🏗️

- [Effort, Value And Productivity 🏷️](../../../foundations/effort-value-and-productivity.md)

### Testing > Foundations 🏗️

- [Test Code 🏷️](../../foundations/test-code.md)

### Testing > Unit Tests

- [Introduction ✨](../intro.md)
