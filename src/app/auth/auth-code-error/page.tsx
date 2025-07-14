import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div>
      <h1>Authentication Error</h1>
      <p>Sorry, we couldn`&apos;`t sign you in. Please try again.</p>
      <Link href="/login">
        Try Again
      </Link>
    </div>
  )
}
