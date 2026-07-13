/// <reference path="../.astro/types.d.ts" />

interface Window {
  dataLayer: Record<string, unknown>[];
}

declare namespace App {
  interface Locals {
    user?: import('@supabase/supabase-js').User | null;
  }
}
