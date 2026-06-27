import { redirect } from 'next/navigation';

export default function Root() {
  // Sidebar handles auth check — if not logged in it redirects to /login
  redirect('/dashboard');
}
