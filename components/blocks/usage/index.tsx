import { Badge } from "@/components/ui/badge";
import { Section as SectionType } from "@/types/blocks/section";

export default function Usage({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="py-16">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          {section.label && (
            <Badge variant="outline" className="mb-4">
              {section.label}
            </Badge>
          )}
          <h2 className="mb-6 text-pretty text-3xl font-bold lg:text-4xl">
            {section.title}
          </h2>
          <p className="mb-16 text-muted-foreground lg:text-lg">
            {section.description}
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {section.items?.map((item, index) => (
              <div key={index} className="group relative flex flex-col items-center text-center">
                {/* Step number circle */}
                <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-background text-xl font-bold transition-all duration-200 group-hover:scale-110">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <h3 className="mb-3 text-lg font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                {/* Horizontal connector line (hidden on mobile and last item) */}
                {index < (section.items?.length ?? 0) - 1 && (
                  <div className="absolute right-0 top-7 hidden h-0.5 w-1/2 bg-border lg:block" />
                )}
                {index > 0 && (
                  <div className="absolute left-0 top-7 hidden h-0.5 w-1/2 bg-border lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 