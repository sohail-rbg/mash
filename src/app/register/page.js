import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // Redirect to Clerk's sign-up page
  redirect('/sign-up');
}