declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"bibliografia": {
"archetipi-e-inconscio-collettivo.md": {
	id: "archetipi-e-inconscio-collettivo.md";
  slug: "archetipi-e-inconscio-collettivo";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"ayurveda-scienza-autoguarigione.md": {
	id: "ayurveda-scienza-autoguarigione.md";
  slug: "ayurveda-scienza-autoguarigione";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"bhagavad-gita.md": {
	id: "bhagavad-gita.md";
  slug: "bhagavad-gita";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"charaka-samhita.md": {
	id: "charaka-samhita.md";
  slug: "charaka-samhita";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"eastern-body-western-mind.md": {
	id: "eastern-body-western-mind.md";
  slug: "eastern-body-western-mind";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"eraclito-frammenti.md": {
	id: "eraclito-frammenti.md";
  slug: "eraclito-frammenti";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"hatha-yoga-pradipika.md": {
	id: "hatha-yoga-pradipika.md";
  slug: "hatha-yoga-pradipika";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"huangdi-neijing.md": {
	id: "huangdi-neijing.md";
  slug: "huangdi-neijing";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"i-ching.md": {
	id: "i-ching.md";
  slug: "i-ching";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"il-miracolo-della-presenza-mentale.md": {
	id: "il-miracolo-della-presenza-mentale.md";
  slug: "il-miracolo-della-presenza-mentale";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"il-potere-del-serpente.md": {
	id: "il-potere-del-serpente.md";
  slug: "il-potere-del-serpente";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"il-segreto-del-fiore-doro.md": {
	id: "il-segreto-del-fiore-doro.md";
  slug: "il-segreto-del-fiore-doro";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"il-tao-della-fisica.md": {
	id: "il-tao-della-fisica.md";
  slug: "il-tao-della-fisica";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"il-tao-la-via-dellacqua-che-scorre.md": {
	id: "il-tao-la-via-dellacqua-che-scorre.md";
  slug: "il-tao-la-via-dellacqua-che-scorre";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"kundalini-energia-del-profondo.md": {
	id: "kundalini-energia-del-profondo.md";
  slug: "kundalini-energia-del-profondo";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"la-via-dei-tarocchi.md": {
	id: "la-via-dei-tarocchi.md";
  slug: "la-via-dei-tarocchi";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"psicologia-del-kundalini-yoga.md": {
	id: "psicologia-del-kundalini-yoga.md";
  slug: "psicologia-del-kundalini-yoga";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"psicologia-e-alchimia.md": {
	id: "psicologia-e-alchimia.md";
  slug: "psicologia-e-alchimia";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"psicomagia.md": {
	id: "psicomagia.md";
  slug: "psicomagia";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"risveglio-energia-di-guarigione-tao.md": {
	id: "risveglio-energia-di-guarigione-tao.md";
  slug: "risveglio-energia-di-guarigione-tao";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"sistemi-taoisti-stress-vitalita.md": {
	id: "sistemi-taoisti-stress-vitalita.md";
  slug: "sistemi-taoisti-stress-vitalita";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"tao-te-ching.md": {
	id: "tao-te-ching.md";
  slug: "tao-te-ching";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"the-web-that-has-no-weaver.md": {
	id: "the-web-that-has-no-weaver.md";
  slug: "the-web-that-has-no-weaver";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"upanishad.md": {
	id: "upanishad.md";
  slug: "upanishad";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"yoga-sutra.md": {
	id: "yoga-sutra.md";
  slug: "yoga-sutra";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"zen-shiatsu.md": {
	id: "zen-shiatsu.md";
  slug: "zen-shiatsu";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
"zhuangzi.md": {
	id: "zhuangzi.md";
  slug: "zhuangzi";
  body: string;
  collection: "bibliografia";
  data: InferEntrySchema<"bibliografia">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}
