

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
    const response = await fetch('http://localhost:3000/books');

    if (!response.ok) {
        throw new Error('Failed to fetch books from API');
    }

    const allBooks: Book[] = await response.json();

    // If no filters are provided, return all books
    if (!filters || filters.length === 0) {
        return allBooks;
    }

    // Apply filters based on the provided price criteria
    return allBooks.filter(book => {
        for (const filter of filters) {
            const { from, to } = filter;

            // Check if the book price is within the specified range
            if (from !== undefined && book.price < from) return false;  // Price is below the minimum
            if (to !== undefined && book.price > to) return false;      // Price is above the maximum
        }
        return true; // If book passed all filters
    });
}




export default {
    assignment,
    listBooks
};