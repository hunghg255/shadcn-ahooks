---
nav:
  path: /hooks
---

# useIndexedDB

A hook for managing IndexedDB storage with a simple and intuitive API.

## Examples

### Default usage

<code src="./demo/demo1.tsx" />

## API

### setupIndexedDB

Before using the `useIndexedDB` hook, you need to initialize the database configuration using `setupIndexedDB`.

```typescript
interface IndexedDBColumn {
  name: string;
  keyPath: string;
  options?: IDBIndexParameters;
}

interface IndexedDBStore {
  name: string;
  id: IDBObjectStoreParameters;
  indices: IndexedDBColumn[];
}

interface IndexedDBConfig {
  databaseName: string;
  version: number;
  stores: IndexedDBStore[];
}

setupIndexedDB(config: IndexedDBConfig): Promise<void>
```

#### Config

| Property     | Description                           | Type               | Default |
| ------------ | ------------------------------------- | ------------------ | ------- |
| databaseName | The name of the IndexedDB database    | `string`           | -       |
| version      | The version of the database schema    | `number`           | -       |
| stores       | Array of object store configurations  | `IndexedDBStore[]` | -       |

#### IndexedDBStore

| Property | Description                                  | Type                      | Default |
| -------- | -------------------------------------------- | ------------------------- | ------- |
| name     | The name of the object store                 | `string`                  | -       |
| id       | Object store parameters (e.g., keyPath, autoIncrement) | `IDBObjectStoreParameters` | -       |
| indices  | Array of index configurations                | `IndexedDBColumn[]`       | -       |

#### IndexedDBColumn

| Property | Description                          | Type                 | Default |
| -------- | ------------------------------------ | -------------------- | ------- |
| name     | The name of the index                | `string`             | -       |
| keyPath  | The key path for the index           | `string`             | -       |
| options  | Optional index parameters            | `IDBIndexParameters` | -       |

### useIndexedDB

```typescript
const {
  getByID,
  getOneByKey,
  getManyByKey,
  getAll,
  add,
  update,
  deleteByID,
  deleteAll,
  openCursor,
} = useIndexedDB<T>(storeName: string);
```

### Params

| Property  | Description                              | Type     | Default |
| --------- | ---------------------------------------- | -------- | ------- |
| storeName | The name of the object store to operate on | `string` | -       |

### Result

| Property     | Description                                           | Type                                                                 |
| ------------ | ----------------------------------------------------- | -------------------------------------------------------------------- |
| getByID      | Get a record by its primary key                       | `(id: string \| number) => Promise<T>`                               |
| getOneByKey  | Get a single record by an indexed key                 | `(keyPath: string, value: string \| number) => Promise<T \| undefined>` |
| getManyByKey | Get multiple records by an indexed key                | `(keyPath: string, value: string \| number) => Promise<T[]>`         |
| getAll       | Get all records from the store                        | `() => Promise<T[]>`                                                 |
| add          | Add a new record to the store                         | `(value: T, key?: any) => Promise<number>`                           |
| update       | Update an existing record (or insert if not exists)   | `(value: T, key?: any) => Promise<any>`                              |
| deleteByID   | Delete a record by its primary key                    | `(id: any) => Promise<any>`                                          |
| deleteAll    | Clear all records from the store                      | `() => Promise<any>`                                                 |
| openCursor   | Open a cursor to iterate over records                 | `(cursorCallback: (e: Event) => any, keyRange?: IDBKeyRange) => Promise<IDBCursorWithValue \| void>` |

## Usage Example

```typescript
import useIndexedDB, { setupIndexedDB } from 'ahooks';

// Initialize the database (typically in your app's entry point)
await setupIndexedDB({
  databaseName: 'MyDatabase',
  version: 1,
  stores: [
    {
      name: 'users',
      id: { keyPath: 'id', autoIncrement: true },
      indices: [
        { name: 'name', keyPath: 'name', options: { unique: false } },
        { name: 'email', keyPath: 'email', options: { unique: true } },
      ],
    },
  ],
});

// In your component
function UserComponent() {
  const { add, getAll, getByID, update, deleteByID } = useIndexedDB<User>('users');

  const addUser = async () => {
    const id = await add({ name: 'John Doe', email: 'john@example.com' });
    console.log('Added user with id:', id);
  };

  const fetchUsers = async () => {
    const users = await getAll();
    console.log('All users:', users);
  };

  return (
    // ...
  );
}
```

## Notes

- Make sure to call `setupIndexedDB` before using `useIndexedDB` in any component.
- The hook uses the browser's native IndexedDB API, so it's only available in browser environments.
- All operations return Promises, so you should handle them with `async/await` or `.then()`.
