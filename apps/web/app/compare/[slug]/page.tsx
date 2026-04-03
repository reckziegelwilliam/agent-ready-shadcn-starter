import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { comparisons, comparisonsBySlug } from "@/lib/comparisons";
import { FileTabs } from "@/components/compare/file-tabs";

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompareDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const example = comparisonsBySlug[slug];

  if (!example) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/compare"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to comparisons
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {example.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{example.description}</p>
      </div>

      <FileTabs files={example.files} />
    </div>
  );
}
