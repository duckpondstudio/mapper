### Package Overrides
Overrides found in `package.json`

- `serialize-javascript` 
  - Overridden to v7.0.3 or greater to avoid dev vulnerabilities. Using `npm audit fix` was broken prior to this, giving over a dozen high risk issues, tho `npm audit --omit=dev` showed zero issues.
  - `"serialize-javascript": "^7.0.3"`
- `fabric`
  - Overridden to v7.2.0 or greater to avoid [Stored XSS via SVG Export](https://github.com/advisories/GHSA-hfvx-25r5-qc3w) bug
  - Dependency graph version also updated, not just override
  - `"fabric": "^7.2.0"`
