import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirect to Clerk's sign-in page
  redirect('/sign-in');
}