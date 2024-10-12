import previous_assignment from './assignment-2'

export type BookID = string

export interface Book {
  id?: BookID
  name: string
  author: string
  description: string
  price: number
  image: string
};

export interface Filter {
  from?: number
  to?: number
  name?: string
  author?: string
};

// If multiple filters are provided, any book that matches at least one of them should be returned
// Within a single filter, a book would need to match all the given conditions


function filterBooks(books: Book[], filters: Filter[]): Book[] {
  return books.filter(book => {
    return filters.some(filter => {
      const matchesFrom = filter.from !== undefined ? book.price >= filter.from : true;
      const matchesTo = filter.to !== undefined ? book.price <= filter.to : true;
      const matchesName = filter.name ? book.name.toLowerCase().includes(filter.name.toLowerCase()) : true;
      const matchesAuthor = filter.author ? book.author.toLowerCase().includes(filter.author.toLowerCase()) : true;

      return matchesFrom && matchesTo && matchesName && matchesAuthor;
    });
  });
}

// Function to fetch and list books based on filters
async function listBooks(filters: Filter[] = []): Promise<Book[]> {
  try {
    const response = await fetch('http://localhost:3000/books');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const books: Book[] = await response.json();

    if (filters.length > 0) {
      return filterBooks(books, filters);
    }

    return books; // Return all books if no filters are applied
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error; // Handle or re-throw the error as necessary
  }
}



async function createOrUpdateBook(book: Book): Promise<BookID> {
  return await previous_assignment.createOrUpdateBook(book)
}

async function removeBook(book: BookID): Promise<void> {
  await previous_assignment.removeBook(book)
}

const assignment = 'assignment-3'

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks
}
