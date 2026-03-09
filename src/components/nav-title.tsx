"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

interface NavTitleProps {
  showHome: boolean;
  reportSlug: string;
}

export function NavTitle({ showHome, reportSlug }: NavTitleProps) {
  return (
    <span className="inline-flex items-center gap-2">
      {showHome && (
        <Link
          href="/"
          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
          title="Přehled reportů"
        >
          <span className="relative">
            <Home size={16} strokeWidth={1.5} />
            <ArrowLeft
              size={9}
              strokeWidth={2.5}
              className="absolute -left-1.5 top-1/2 -translate-y-1/2"
            />
          </span>
        </Link>
      )}
      <Link
        href={`/${reportSlug}/uvod`}
        className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Image
          src="/logo.png"
          alt=""
          width={24}
          height={24}
          className="rounded-md"
        />
        AI Kompas
      </Link>
    </span>
  );
}
