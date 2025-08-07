import { MongoClient, ObjectId } from "mongodb"; // Importamos MongoClient y ObjectId de mongodb
import { Review } from "./review.entity.js"; // Importamos la entidad Review
import { ReviewRepository } from "./review.repository.interface.js"; // Importamos la interfaz ReviewRepository

const uri = process.env.MONGODB_URI || "mongodb://rateup:example@localhost:27017"; // URL de conexión a MongoDB
const mongoClient = new MongoClient(uri); // Creamos una instancia de MongoClient
const db = mongoClient.db(process.env.MONGODB_DB || 'rateup') // Seleccionamos la base de datos
const reviews = db.collection<Review>('reviews'); // Seleccionamos la colección de reseñas

export class ReviewMongoRepository implements ReviewRepository {
    constructor() {
        mongoClient.connect();
    }
    
    async create(review: Review): Promise<Review | undefined> {
       console.log('Creating review:', review);
        const id = (await reviews.insertOne(review)).insertedId; // Insertamos la reseña y obtenemos el ID
        const resultReview = await reviews.findOne({_id: id}); //Buscamos la reseña con la ID obtenida
        return resultReview || undefined; // Retornamos la reseña encontrada o undefined si no se encuentra
    }
}