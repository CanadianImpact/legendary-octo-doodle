import { BookstoreAdapter, Book } from '../src/bookstoreAdapter';

export interface Book {
    name: string,
    author: string,
    description: string,
    price: number,
    image: string,
};
const assignment = "assignment-1";

// If you have multiple filters, a book matching any of them is a match.
async function listBooks(filters?: Array<{ from?: number, to?: number }>): Promise<Book[]> {
    try {
        // Fetch all books from the adapter
        const allBooks: Book[] = await BookstoreAdapter.getAllBooks();

        // If no filters are provided, return all books
        if (!filters || filters.length === 0) {
            return allBooks;
        }

        // Apply filters - book matches if it falls in any of the price ranges
        const filteredBooks = allBooks.filter(book => {
            return filters.some(filter => {
                const minPrice = filter.from ?? 0;
                const maxPrice = filter.to ?? Infinity;
                return book.price >= minPrice && book.price <= maxPrice;
            });
        });

        return filteredBooks;
    } catch (error) {
        console.error('Error listing books:', error);
        throw new Error('Failed to list books');
    }
}




export default {
    assignment,
    listBooks
};