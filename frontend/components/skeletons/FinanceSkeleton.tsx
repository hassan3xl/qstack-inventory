import { Skeleton } from "@/components/ui/skeleton";

export function FinanceSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-card p-6 rounded-lg border border-border shadow-sm flex flex-col gap-4"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 space-y-6">
          <Skeleton className="h-6 w-64 mb-4" />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col">
          <Skeleton className="h-6 w-64 mb-8" />
          <div className="flex-1 flex items-end justify-center gap-6 pb-4">
            <Skeleton className="w-16 h-48 rounded-t-lg" />
            <Skeleton className="w-16 h-32 rounded-t-lg" />
            <Skeleton className="w-16 h-40 rounded-t-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
