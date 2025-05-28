import Dexie, { type EntityTable } from 'dexie';
import { Entry } from 'stores/entriesStore';
import { Task } from 'stores/tasksStore';

export const indexedDb = new Dexie('mainIndexedDb') as Dexie & {
  entries: EntityTable<Entry, 'dbid'>;
  tasks: EntityTable<Task, 'dbid'>;
};

indexedDb.version(1).stores({
  entries: '&dbid',
  tasks: '&dbid',
});
