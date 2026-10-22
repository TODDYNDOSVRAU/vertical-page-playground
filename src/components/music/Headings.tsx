import type { ReactNode } from "react";

export const H1 = ({ children }: { children: ReactNode }) => <h1 className="font-display text-4xl font-bold tracking-tight mb-5">{children}</h1>;
export const H2 = ({ children }: { children: ReactNode }) => <h2 className="font-display text-xl font-semibold mt-8 mb-3">{children}</h2>;
