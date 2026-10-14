"use client"
import { useEffect, useState } from "react"
import { getAllPosts } from "../lib/api"
import { BlogType } from "../types/blogType"

export default function page() {
  const [posts, setPosts] = useState<BlogType[]>([]);

  useEffect(() => {
    getAllPosts()
      .then(setPosts)
  }, [])

  console.log(posts)
  return (
    <main className="bg-background">
      blog
    </main>
  )
}