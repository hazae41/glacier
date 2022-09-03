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
    <Link href="/storage" passHref shallow>
      <a>Persistent storage</a>
    </Link>
    <Link href="/make" passHref shallow>
      <a>Schema maker</a>
    </Link>
    <Link href="/scroll" passHref shallow>
      <a>Scroll pagination</a>
    </Link>
  </div>
}