import { MovieProvider } from './../../providers/movie/movie';
import { Movie } from './../../models/movie.models';
import { Component } from '@angular/core';
import { NavController, AlertController, ItemSliding, AlertOptions, LoadingController, Loading } from 'ionic-angular';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  movies: Movie[] = [];
  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public movieProvider: MovieProvider,
    public navCtrl: NavController
  ) {}

  ionViewDidLoad() {
    this.movieProvider.getAll()
      .then((movies: Movie[]) => {
        this.movies = movies;
      })
  }

  onSave(type: string, item?: ItemSliding, movie?: Movie): void {
    console.log('Clicou no add');
    let title: string;
    let acao: string;
    switch (type) {
      case 'create':
      title = 'Cadastrar';
      break;

      case 'update':
      acao = 'atualizar';
      title = acao.charAt(0).toUpperCase() + acao.substr(1); // Atualizar
      break;
    }
    console.log('Clicou no add na funcao '+title+'!!');
    console.log(movie);
    this.showAlert({
       itemSliding: item,
       title: `${title} filme`,
       type:type,
       movie: movie
    })

  }

  onDelete(movie: Movie): void {
    this.alertCtrl.create({
      title: `Deseja realmente deletar ${movie.title} ?`,
      buttons: [
        {
          text: 'Sim',
          handler: () => {
            let loading: Loading = this.showLoading(`Deletando o filme '${movie.title}'`);
            this.movieProvider.delete(movie.id)
            .then((deleted: boolean) => {
              if(deleted){
                this.movies.slice(this.movies.indexOf(movie),1);
              }
              loading.dismiss();
            }).catch((error: Error) => this.mostrarAleta(`Erro ao deletar o filme '${movie.title}'`));
          }
        },
        'Cancelar'
      ]
    }).present();
  }

  private mostrarAleta(mensagem: string) {
    let alertOpt: AlertOptions = {
      title: 'ATENÇÃO',
      message: mensagem
    }
    this.alertCtrl.create(alertOpt);
  }
  private showAlert(options: {itemSliding?: ItemSliding, title: string, type: string, movie?: Movie }): void {

    let alertOptions: AlertOptions = {
      title: options.title,
      inputs: [
        {
          name: 'title',
          placeholder: 'Título do filme'
        }
      ],
      buttons: [
        'Cancelar',
        {
          text: 'Salvar',
          handler: (data) => {
            let loading: Loading = this.showLoading(`Salvando o filme ${data.title}...`);
            let contextMovie: Movie;

            switch(options.type) {
              case 'create':
                contextMovie = new Movie(data.title);
              break;
              case 'update':
                options.movie.title = data.title;
                contextMovie = options.movie;
              break;
            }

            this.movieProvider[options.type](contextMovie)
              .then((result: any) => {
                if(options.type=='create') this.movies.unshift(result);
                loading.dismiss();

                if(ItemSliding) options.itemSliding.close();

              });
          }
        }
      ]

    };
    console.log('type:'+ options.type);
    if(options.type === 'update') {
      console.log(options.movie.title);
      
      alertOptions.inputs[0]['value'] = options.movie.title;
    }
    this.alertCtrl.create(alertOptions).present();

  }

  private showLoading(message?: string): Loading {
    let loading: Loading = this.loadingCtrl.create({
        content: message || 'Por favor, aguarde...'
    });

    loading.present();
    return loading;
  }


  
  
}
