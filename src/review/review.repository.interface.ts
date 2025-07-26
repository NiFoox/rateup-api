import { Review } from "./review.entity"; // Importamos la entidad Review de review.entity.ts

// Una promesa es un objeto que representa la finalización o el fracaso de una operación asíncrona

export interface ReviewRepository { // Definimos la interfaz ReviewRepository
    create(review: Review): Promise<Review | undefined>; // Método para crear una nueva reseña, devuelve una promesa de Review
}