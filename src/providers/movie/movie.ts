import { Movie } from './../../models/movie.models';
import { SqliteHelperProvider } from './../sqlite-helper/sqlite-helper';
import { SQLiteObject } from '@ionic-native/sqlite';

import { Injectable } from '@angular/core';


@Injectable()
export class MovieProvider {

  private db: SQLiteObject;
  private isFirstCall: boolean = true;

  constructor(
    public sqliteHelperProvider: SqliteHelperProvider
  ) {

  }

  private getDb(): Promise<SQLiteObject> {
    if (this.isFirstCall) {
      //Se for a primeira chamada ao banco
      this.isFirstCall = false;
      //Conectar ao banco webgoias.db (Parametro passado mas nao necessario por ja ser o banco padrao)
      return this.sqliteHelperProvider.getDb('webgoias.db', true).then((db: SQLiteObject) => {
        this.db = db;
        this.db.executeSql('CREATE TABLE IF NOT EXISTS movie(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT', {})
          .then(success => console.log('Tabela Movies criada com sucesso!', success))
          .catch(error => console.log('Erro ao criar tabela Movies', error));
        return this.db;

      });
    }
    return this.sqliteHelperProvider.getDb();

  }

  getAll(orderBy?: string): Promise<Movie[]> {

    return this.getDb().then((db: SQLiteObject) => {

      return <Promise<any>>this.db.executeSql(`SELECT * FROM movie ORDER BY id ${orderBy || 'DESC'}`, {})
        .then(resultSet => {

          let list: Movie[] = [];

          for (let i = 0; i < resultSet.rows.length; i++) {
            list.push(resultSet.rows.item(i))
          }

          return list;

        }).catch((error: Error) => {
          console.log('Error ao executar metodo getAll', error)
        });

    });
  }

  create(movie: Movie): Promise<Movie> {
    return this.db.executeSql('INSERT INTO movie (title) VALUES(?)', [movie.title])
      .then(resultSet => {
        movie.id = resultSet.insertId;
        return movie;
      })
      .catch((error: Error) => {
        let errorMsg: string = `Erro ao inserir o filme: '${movie.title}'`;
        console.log(errorMsg, error);
        return Promise.reject(errorMsg);
      });

  }

  update(movie: Movie): Promise<boolean> {
    return this.db.executeSql('UPDATE movie set title = ? where id = ?', [movie.title, movie.id])
      .then(resultSet => resultSet.rows >= 0)
      .catch((error: Error) =>  {
        console.log(`Erro ao atualizar o filme ${movie.title} !`, error);
        return Promise.reject(error); 
      });
  }

  delete(id: number): Promise<boolean> {
    return this.db.executeSql(`DELETE FROM moive id = ?`,[id])
      .then(resultSet => resultSet.rowsAffected > 0)
      .catch((error: Error) =>  {
        console.log(`Erro ao deletar o filme com id ${id} !`, error);
        return Promise.reject(error); 
      });
  }

  deleteMovie(movie: Movie): Promise<boolean> {
    return this.db.executeSql(`DELETE FROM moive id = ?`,[movie.id])
      .then(resultSet => resultSet.rowsAffected > 0)
      .catch((error: Error) =>  {
        console.log(`Erro ao deletar o filme ${movie.title} !`, error);
        return Promise.reject(error); 
      });
  }

  getById(id: number): Promise<Movie> {

      return this.db.executeSql(`SELECT * from movie where id =?`,[id])
        .then(resultSet => resultSet.rows.item(0))
        .catch((error: Error) =>  {
          console.log(`Erro ao buscar filme com o id  ${id} !`, error);
          return Promise.reject(error); 
        });


  }


}
