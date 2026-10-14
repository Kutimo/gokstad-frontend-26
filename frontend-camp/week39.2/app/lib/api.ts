import { BlogType } from "../types/blogType"

export async function getAllPosts(): Promise<BlogType[]> {
  const res: Response = await fetch("https://jsonplaceholder.typicode.com/posts")
  return res.json()
}
