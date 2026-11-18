import { getPayloadClient, requireUser } from '@/lib/auth'
import NoteForm from '@/components/notes/NoteForm'
import DeleteNoteButton from '@/components/notes/DeleteNoteButton'

export default async function NotesPage() {
  const user = await requireUser()
  const payload = await getPayloadClient()

  // The Local API skips access control by default!
  // overrideAccess: false + user makes it obey our access rules.
  const { docs: notes } = await payload.find({
    collection: 'notes',
    user,
    overrideAccess: false,
    sort: '-createdAt',
  })

  return (
    <>
      <h1>My notes</h1>
      <NoteForm />
      {notes.length === 0 && <p>No notes yet.</p>}
      <ul className="notes">
        {notes.map((note) => (
          <li key={note.id}>
            <strong>{note.title}</strong>
            <p>{note.content}</p>
            <DeleteNoteButton id={note.id} />
          </li>
        ))}
      </ul>
    </>
  )
}
