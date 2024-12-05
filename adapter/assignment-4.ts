import previous_assignment from './assignment-3'

export type BookID = string

export interface Book {
  id?: BookID
  name: string
  author: string
  description: string
  price: number
  image: string
  stock?: number
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

async function createOrUpdateBook (book: Book): Promise<BookID> {
  return await previous_assignment.createOrUpdateBook(book)
}

async function removeBook (book: BookID): Promise<void> {
  await previous_assignment.removeBook(book)
}

async function lookupBookById (book: BookID): Promise<Book> {
  const result = await fetch(`http://localhost:3000/books/${book}`)
  if (result.ok) {
    return await result.json() as Book
  } else {
    throw new Error('Couldnt Find Book')
  }
}

export type ShelfId = string
export type OrderId = string

async function placeBooksOnShelf (bookId: BookID, numberOfBooks: number, shelf: ShelfId): Promise<void> {
  const result = await fetch(`http://localhost:3000/warehouse/${bookId}/${shelf}/${numberOfBooks}`, { method: 'put' })
  if (!result.ok) {
    throw new Error('Couldnt Place on Shelf')
  }
}

async function orderBooks (order: BookID[]): Promise<{ orderId: OrderId }> {
  const result = await fetch('http://localhost:3000/order', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order })
  })
  if (!result.ok) {
    throw new Error('Couldnt Place on Shelf')
  }
  return { orderId: await result.text() }}

  async function findBookOnShelf (book: BookID): Promise<Array<{ shelf: ShelfId, count: number }>> {
    const result = await fetch(`http://localhost:3000/warehouse/${book}`)
    if (result.ok) {
      const results = (await result.json()) as Record<ShelfId, number>
      const shelfArray: Array<{ shelf: ShelfId, count: number }> = []
      for (const shelf of Object.keys(results)) {
        shelfArray.push({
          shelf,
          count: results[shelf]
        })
      }
      return shelfArray
    } else {
      throw new Error('Couldnt Find Book')
    }
  }

async function fulfilOrder (order: OrderId, booksFulfilled: Array<{ book: BookID, shelf: ShelfId, numberOfBooks: number }>): Promise<void> {
  throw new Error("Todo")
}3

async function listOrders (): Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>> {
  const result = await fetch('http://localhost:3000/order')
  if (result.ok) {
    return await result.json() as Array<{ orderId: OrderId, books: Record<BookID, number> }>
  } else {
    throw new Error('Couldnt Find Book')
  }
}

const assignment = 'assignment-4'

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks,
  placeBooksOnShelf,
  orderBooks,
  findBookOnShelf,
  fulfilOrder,
  listOrders,
  lookupBookById
}
