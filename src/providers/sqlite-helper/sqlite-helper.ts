import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';

@Injectable()
export class SqliteHelperProvider {

  private db: SQLiteObject;

  constructor(
    public platform: Platform,
    public sqlite: SQLite
  ) {
    console.log('Hello SqliteHelperProvider Provider');
  }

  private createDatabase(dbName?: string): Promise<SQLiteObject> {
    return this.platform.ready()
      .then((readSource: string) => {

         return this.sqlite.create({
           name: dbName || 'webgoias.db',
           location: 'default'
         }).then((db: SQLiteObject) => {
           this.db = db;
           return this.db;
         }).catch((error: Error) => {
          console.log('Erro ao abrir ou criar DB: ', error);
          return Promise.reject(error.message || error);
         });
      });
  }

  getDb(dbName?: string, newOpen?: boolean): Promise<SQLiteObject> {
    if(newOpen) return this.createDatabase(dbName);

    return (this.db) ? Promise.resolve(this.db) : this.createDatabase(dbName);
  }
}
