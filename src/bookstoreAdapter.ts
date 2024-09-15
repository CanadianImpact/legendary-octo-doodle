import axios from 'axios';

// Update the Book interface to match your provided schema
export interface Book {
    name: string;
    author: string;
    description: string;
    price: number;
    image: string;
}

const BASE_URL = 'http://localhost:3000/books';

export class BookstoreAdapter {
    // Get all books from the API
    static async getAllBooks(): Promise<Book[]> {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching books:', error);
            throw new Error('Failed to fetch books');
        }
    }
}
