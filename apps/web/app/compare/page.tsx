import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card";
import { comparisons } from "@/lib/comparisons";

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Before &amp; After: AI Output vs Production Code
        </h1>
        <p className="mt-2 text-muted-foreground">
          Side-by-side comparisons showing what an AI agent generated and what
          the production code looks like after review. Each annotation explains
          what was wrong and why it was changed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {comparisons.map((example) => (
          <Link key={example.slug} href={`/compare/${example.slug}`}>
            <Card className="h-full transition-colors hover:border-foreground/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{example.title}</CardTitle>
                  <Badge variant="secondary">
                    {example.issueCount} issues
                  </Badge>
                </div>
                <CardDescription>{example.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {example.files.length} file
                  {example.files.length !== 1 && "s"} compared
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
