import Link from "next/link";

export default function Page() {
  return <div className="flex flex-col">
    <Link href="/garbage" passHref shallow>
      <a>Garbage collection</a>
    </Link>
    <Link href="/keys" passHref shallow>
      <a>Arbitrary keys</a>
    </Link>
    <Link href="/optimistic" passHref shallow>
      <a>Optimistic updates</a>
    </Link>
    <Link href="/storage/sync" passHref shallow>
      <a>Sync storage</a>
    </Link>
  </div>
}