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

        <div className="mx-auto max-w-3xl">
          <div className="relative flex flex-col space-y-12">
            {/* Vertical line connecting steps */}
            <div className="absolute left-8 top-0 h-full w-0.5 bg-border" />

            {section.items?.map((item, index) => (
              <div key={index} className="relative flex gap-8">
                {/* Step number circle */}
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-2xl font-bold">
                  {index + 1}
                </div>

                <div className="flex-1 pt-4">
                  <h3 className="mb-4 text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 