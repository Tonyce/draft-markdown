import { CHECKABLE_LIST_ITEM } from "draft-js-checkable-list-item";

export const CODE_BLOCK_REGEX = /^```([\w-]+)?\s*$/;

export const inlineMatchers = {
  // BOLD: [/(?:^|\s)\*(.+)\* $/g],
  // ITALIC: [/(?:^|\s)_(.+)_ $/g],
  // CODE: [/(?:^|\s)`([^`]+)` $/g],
  // STRIKETHROUGH: [/(?:^|\s)~(.+)~ $/g],
  // BOLD: /(?:^|\s|\n|[^A-z0-9_*~`])(\*{2}|_{2})((?!\1).*?)(\1)(\s|\n|[^A-z0-9_*~`])$/g,
  // // ITALIC: /(?:^|\s|\n|[^A-z0-9_*~`])(\*{1}|_{1})((?!\1).*?)(\1)(\s|\n|[^A-z0-9_*~`]$)/g,
  // CODE: /(?:^|\s|\n|[^A-z0-9_*~`])(`)((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g,
  // STRIKETHROUGH: /(?:^|\s|\n|[^A-z0-9_*~`])(~{2})((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g
};

export const CODE_BLOCK_TYPE = "code-block";

export const ENTITY_TYPE = {
  IMAGE: "IMG",
  LINK: "LINK",
};

export const defaultInlineWhitelist = [
  "BOLD",
  "ITALIC",
  "CODE",
  "STRIKETHROUGH",
  "LINK",
  "IMAGE",
];

export const defaultBlockWhitelist = [
  "CODE",
  "header-one",
  "header-two",
  "header-three",
  "header-four",
  "header-five",
  "header-six",
  "ordered-list-item",
  "unordered-list-item",
  CHECKABLE_LIST_ITEM,
  "blockquote",
];
