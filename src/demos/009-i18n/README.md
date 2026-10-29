# I18n

## Overview

Switch the examples between English (`en-US`), Russian (`ru-RU`) and Ukrainian (`uk-UA`). Compare
translations, named interpolation, missing messages, cardinal plural forms, decimal/currency/percent
formatting and dates in explicit time zones. Controls and the lab shell remain in English.

The selected language is saved under this demo's own localStorage key and restored on the next
visit or reload. Forget saved language removes that key and selects English. If storage is blocked
or full, language switching still works in memory and the status explains that it is session-only.
Only the language is persisted; sample inputs reset when the demo is remounted.

## Implementation

`Demo.vue` coordinates language selection and four independent panels: `MessageExamples.vue`,
`PluralExamples.vue`, `NumberExamples.vue` and `DateExamples.vue`. Shared CSS Module styles stay
local to the panels. `meta.ts` enables automatic discovery. No Core, router or dependency changes
are required; Vue, TypeScript and native Intl APIs implement the experiment.

`catalogs.ts` defines supported languages, typed message catalogs and per-language plural templates.
`i18n.ts` resolves a key in the chosen catalog, then English, then returns the key itself. The probe
includes a deliberately English-only message and a key absent in every catalog. The preview shows
the resolution path; fallback text has its actual source language in its `lang` attribute.
Named `{name}` interpolation returns text that Vue escapes. There is no HTML rendering, expression
evaluation, dynamic message loading or global document-language mutation.

Plural selection uses `Intl.PluralRules` cardinal categories and complete phrases per category,
with `other` as the template fallback. The displayed count and rule selection both round to at most
three fractional digits, so their visible value and category agree. Try zero, teens, 21 and 1.5.
English 21 uses `other`; Russian and Ukrainian 21 use `one`.

Number formatters use the selected locale and currency; choosing USD/EUR/UAH changes presentation,
not an exchange rate. The separate ratio input demonstrates percent scaling. Finite decimal inputs
are validated before formatting; empty and invalid fields show a dash rather than zero or NaN.

The date control represents a UTC instant, not device-local time. Strict parsing rejects normalized
invalid dates. Display can use UTC, Europe/Kyiv or America/New_York; ISO output makes it clear that
the underlying instant stays fixed. Changing a display zone can change the calendar date.
Formatters are computed from locale/currency/zone settings and reused while input values change.

`useLocalePreference.ts` validates saved codes before use, catches storage getter/read/write/remove
failures, and accesses only `vue-lab:009-i18n:locale`. It does not write a default on mount or persist
changes made by the forget action. No timers, observers or global event listeners are installed.

## Key Concepts

- Local typed catalogs, named interpolation and explicit message fallback.
- Language metadata on mixed-language content without changing the shell.
- Intl.PluralRules cardinal categories and locale-specific full phrases.
- Intl.NumberFormat, currencies, percent ratios and explicit fractional precision.
- Intl.DateTimeFormat, strict UTC parsing and display-time-zone conversion.
- Validated localStorage preferences and graceful in-memory behavior.

See [Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules),
[Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
and [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).

## Alternatives

Vue I18n can provide component integration, structured message syntax and larger catalog workflows.
ICU MessageFormat supports richer grammatical selection and nested messages. Lazy-loaded catalogs
are useful as the number of languages grows; server-side rendering needs coordinated locale selection.

## Limitations

- Three bundled languages; flat keys and named text interpolation only. No full ICU message grammar.
- Cardinal plurals only; ordinal forms, ranges, RTL layout and language negotiation are not included.
- English is the explicit default and fallback; browser language is not guessed. Existing tabs read
  the preference when mounting/reloading rather than synchronizing live across tabs.
- Intl results depend on browser ICU/CLDR and time-zone data; spacing and currency labels may vary.
- Storage is per origin, so development, preview and deployed pages have independent choices.
- Tests: `node --test src/demos/009-i18n/i18n.test.mjs`.
