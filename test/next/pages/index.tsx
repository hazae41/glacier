import Link from "next/link";

export default function Page() {
  return <div className="flex flex-col">
    <Link href="/garbage" passHref>
      <a>Garbage collection</a>
    </Link>
    <Link href="/keys" passHref>
      <a>Arbitrary keys</a>
    </Link>
    <Link href="/optimistic" passHref>
      <a>Optimistic updates</a>
    </Link>
  </div>
}