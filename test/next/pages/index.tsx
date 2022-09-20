import Link from "next/link";

export default function Page() {
  return <div className="flex flex-col font-sans gap-4">
    <Link href="/theytube" passHref shallow>
      <a>Theytube: a complex store normalization example</a>
    </Link>
    <Link href="/array" passHref shallow>
      <a>Normalized array: a simple store normalization example</a>
    </Link>
    <Link href="/scroll" passHref shallow>
      <a>Normalized scroll pagination</a>
    </Link>
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
    <Link href="/suspense" passHref shallow>
      <a>React Suspense</a>
    </Link>
  </div>
}