export class Game {
    constructor(
        public name: string,
        public description: string,
        public genre: string,
        public id?: number
  ) {}
}

//No usamos crypto/UUID porque no es necesario en este caso, ya que el id puede ser generado por la base de datos.
//Definimos id? de esta manera para que sea opcional, ya que al crear un nuevo juego no es necesario proporcionarlo.