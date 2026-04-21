import type GoldilocksEssentialsPlugin from "../main";
import type { Feature } from "../types";
import type { CompactTableSize } from "../types";

const STYLE_ID = "goldilocks-compact-tables";

const CSS_XS = `
/* Compact tables — xs */
.markdown-preview-view table,
.markdown-rendered table {
  font-size: 0.8125rem;
  line-height: 1.4;
  table-layout: fixed;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.markdown-preview-view thead th,
.markdown-rendered thead th {
  font-size: 0.7rem;
  padding: 6px 8px;
  letter-spacing: 0.03em;
}

.markdown-preview-view tbody td,
.markdown-rendered tbody td {
  padding: 5px 8px;
  font-size: 0.8125rem;
}

@media print {
  .markdown-preview-view table,
  .markdown-rendered table {
    font-size: 10px;
    line-height: 1.35;
    table-layout: fixed;
    width: 100% !important;
    max-width: 100% !important;
    word-wrap: break-word;
    overflow-wrap: break-word;
    page-break-inside: auto;
  }

  .markdown-preview-view thead th,
  .markdown-rendered thead th {
    font-size: 9px;
    padding: 3px 5px;
  }

  .markdown-preview-view tbody td,
  .markdown-rendered tbody td {
    font-size: 10px;
    padding: 3px 5px;
  }

  .markdown-preview-view tbody tr,
  .markdown-rendered tbody tr {
    page-break-inside: avoid;
  }
}
`;

const CSS_SM = `
/* Compact tables — sm */
.markdown-preview-view table,
.markdown-rendered table {
  font-size: 0.875rem;
  line-height: 1.5;
  table-layout: fixed;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.markdown-preview-view thead th,
.markdown-rendered thead th {
  font-size: 0.8rem;
  padding: 8px 10px;
  letter-spacing: 0.02em;
}

.markdown-preview-view tbody td,
.markdown-rendered tbody td {
  padding: 7px 10px;
  font-size: 0.875rem;
}

@media print {
  .markdown-preview-view table,
  .markdown-rendered table {
    font-size: 12px;
    line-height: 1.4;
    table-layout: fixed;
    width: 100% !important;
    max-width: 100% !important;
    word-wrap: break-word;
    overflow-wrap: break-word;
    page-break-inside: auto;
  }

  .markdown-preview-view thead th,
  .markdown-rendered thead th {
    font-size: 11px;
    padding: 4px 6px;
  }

  .markdown-preview-view tbody td,
  .markdown-rendered tbody td {
    font-size: 12px;
    padding: 4px 6px;
  }

  .markdown-preview-view tbody tr,
  .markdown-rendered tbody tr {
    page-break-inside: avoid;
  }
}
`;

const CSS_MAP: Record<CompactTableSize, string> = {
  xs: CSS_XS,
  sm: CSS_SM,
};

function injectStyles(size: CompactTableSize): void {
  removeStyles();
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = CSS_MAP[size];
  document.head.appendChild(el);
}

function removeStyles(): void {
  document.getElementById(STYLE_ID)?.remove();
}

export const compactTables: Feature = {
  id: "compact-tables",
  name: "Compact tables",
  description:
    "Tighter table styling \u2014 less padding, smaller font.",
  conflictsWith: [],

  load(plugin: GoldilocksEssentialsPlugin) {
    injectStyles(plugin.settings.compactTableSize);
  },

  unload() {
    removeStyles();
  },
};
