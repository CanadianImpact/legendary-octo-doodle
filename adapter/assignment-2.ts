import assignment1 from "./assignment-1";

export type BookID = string;

export interface Book {
    _id?: BookID,
    name: string,
    author: string,
    description: string,
    price: number,
    image: string,
};

async function listBooks(filters?: Array<{ from?: number, to?: number }>): Promise<Book[]> {
    return assignment1.listBooks(filters);
}

async function createOrUpdateBook(book: Book): Promise<BookID> {
    let method = book._id ? "PUT" : "POST";  // Use POST for create, PUT for update
    let endpoint = book._id ? `http://localhost:3000/books/${book._id}` : `http://localhost:3000/books`;

    let result = await fetch(endpoint, {
        method: method,
        body: JSON.stringify(book),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (result.ok) {
        let res = await result.json() as { _id: BookID };
        return res._id;
    } else {
        let errorMessage = await result.text();  // Read the error message from the response
        throw new Error(`Failed to ${method === "POST" ? "create" : "update"} book: ${errorMessage}`);
    }

}
async function removeBook(book: BookID): Promise<void> {
    let result = await fetch(`http://localhost:3000/books/${book}`, { method: "DELETE" });

    if (!result.ok) {
        throw new Error("Failed to create or update book");
    }
}
const assignment = "assignment-2";

export default {
    assignment,
    createOrUpdateBook,
    removeBook,
    listBooks
};