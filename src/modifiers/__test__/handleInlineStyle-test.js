/* eslint-disable no-unused-vars */

import Draft, { EditorState, SelectionState } from "draft-js";
import handleInlineStyle from "../handleInlineStyle";
import { defaultInlineWhitelist } from "../../constants";

describe("handleInlineStyle", () => {
  describe("no markup", () => {
    const rawContentState = {
      entityMap: {},
      blocks: [
        {
          key: "item1",
          text: "Test",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {},
        },
      ],
    };
    const contentState = Draft.convertFromRaw(rawContentState);
    const selection = new SelectionState({
      anchorKey: "item1",
      anchorOffset: 6,
      focusKey: "item1",
      focusOffset: 6,
      isBackward: false,
      hasFocus: true,
    });
    const editorState = EditorState.forceSelection(
      EditorState.createWithContent(contentState),
      selection
    );
    it("does not convert block type", () => {
      const newEditorState = handleInlineStyle(
        defaultInlineWhitelist,
        editorState,
        " "
      );
      expect(newEditorState).toEqual(editorState);
      expect(Draft.convertToRaw(newEditorState.getCurrentContent())).toEqual(
        rawContentState
      );
    });
  });

  const testCases = {
    "converts a mix of bold and italic and strikethrough in one go": {
      character: "*",
      before: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "*~hello _inline~_ style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
      },
      after: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              { length: 12, offset: 0, style: "BOLD" },
              { length: 12, offset: 0, style: "STRIKETHROUGH" },
              { length: 6, offset: 6, style: "ITALIC" },
            ],
            entityRanges: [],
            data: {},
          },
        ],
      },
      selection: new SelectionState({
        anchorKey: "item1",
        anchorOffset: 17,
        focusKey: "item1",
        focusOffset: 17,
        isBackward: false,
        hasFocus: true,
      }),
    },

    "should not covert inside the code style": {
      character: "`",
      before: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "`h~el*lo _inline~_* style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
      },
      after: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "h~el*lo _inline~_* style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [{ length: 18, offset: 0, style: "CODE" }],
            entityRanges: [],
            data: {},
          },
        ],
      },
      selection: new SelectionState({
        anchorKey: "item1",
        anchorOffset: 19,
        focusKey: "item1",
        focusOffset: 19,
        isBackward: false,
        hasFocus: true,
      }),
    },

    "converts to bold with astarisks": {
      character: "*",
      before: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello *inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
      },
      after: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              {
                length: 6,
                offset: 6,
                style: "BOLD",
              },
            ],
            entityRanges: [],
            data: {},
          },
        ],
      },
      selection: new SelectionState({
        anchorKey: "item1",
        anchorOffset: 13,
        focusKey: "item1",
        focusOffset: 13,
        isBackward: false,
        hasFocus: true,
      }),
    },
    "converts semicolons to bold with astarisks": {
      character: "*",
      before: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello *TL;DR: style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
      },
      after: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello TL;DR: style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              {
                length: 6,
                offset: 6,
                style: "BOLD",
              },
            ],
            entityRanges: [],
            data: {},
          },
        ],
      },
      selection: new SelectionState({
        anchorKey: "item1",
        anchorOffset: 13,
        focusKey: "item1",
        focusOffset: 13,
        isBackward: false,
        hasFocus: true,
      }),
    },
    "converts to italic with underscore": {
      character: "_",
      before: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello _inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
      },
      after: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              {
                length: 6,
                offset: 6,
                style: "ITALIC",
              },
            ],
            entityRanges: [],
            data: {},
          },
        ],
      },
      selection: new SelectionState({
        anchorKey: "item1",
        anchorOffset: 13,
        focusKey: "item1",
        focusOffset: 13,
        isBackward: false,
        hasFocus: true,
      }),
    },
    "combines to italic and bold with astarisks": {
      character: "*",
      before: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello *inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              {
                length: 3,
                offset: 2,
                style: "ITALIC",
              },
            ],
            entityRanges: [],
            data: {},
          },
        ],
      },
      after: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              {
                length: 3,
                offset: 2,
                style: "ITALIC",
              },
              {
                length: 6,
                offset: 6,
                style: "BOLD",
              },
            ],
            entityRanges: [],
            data: {},
          },
        ],
      },
      selection: new SelectionState({
        anchorKey: "item1",
        anchorOffset: 13,
        focusKey: "item1",
        focusOffset: 13,
        isBackward: false,
        hasFocus: true,
      }),
    },
    "converts to code with backquote": {
      character: "`",
      before: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello `inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
      },
      after: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              {
                length: 6,
                offset: 6,
                style: "CODE",
              },
            ],
            entityRanges: [],
            data: {},
          },
        ],
      },
      selection: new SelectionState({
        anchorKey: "item1",
        anchorOffset: 13,
        focusKey: "item1",
        focusOffset: 13,
        isBackward: false,
        hasFocus: true,
      }),
    },
    "converts to strikethrough with tildes": {
      character: "~",
      before: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello ~inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
      },
      after: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              {
                length: 6,
                offset: 6,
                style: "STRIKETHROUGH",
              },
            ],
            entityRanges: [],
            data: {},
          },
        ],
      },
      selection: new SelectionState({
        anchorKey: "item1",
        anchorOffset: 13,
        focusKey: "item1",
        focusOffset: 13,
        isBackward: false,
        hasFocus: true,
      }),
    },

    // combine tests

    "combines to bold and italic with underscores": {
      character: "_",
      before: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello _inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              {
                length: 5,
                offset: 5,
                style: "BOLD",
              },
            ],
            entityRanges: [],
            data: {},
          },
        ],
      },
      after: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "hello inline style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              {
                length: 4,
                offset: 5,
                style: "BOLD",
              },
              {
                length: 6,
                offset: 6,
                style: "ITALIC",
              },
            ],
            entityRanges: [],
            data: {},
          },
        ],
      },
      selection: new SelectionState({
        anchorKey: "item1",
        anchorOffset: 13,
        focusKey: "item1",
        focusOffset: 13,
        isBackward: false,
        hasFocus: true,
      }),
    },
    "does not convert markdown in the middle of the word": {
      character: "*",
      before: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "*h~ello _inline~_ style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
      },
      after: {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "h~ello inline~ style",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              { length: 14, offset: 0, style: "BOLD" },
              { length: 7, offset: 7, style: "ITALIC" },
            ],
            entityRanges: [],
            data: {},
          },
        ],
      },
      selection: new SelectionState({
        anchorKey: "item1",
        anchorOffset: 17,
        focusKey: "item1",
        focusOffset: 17,
        isBackward: false,
        hasFocus: true,
      }),
    },
  };
  Object.keys(testCases).forEach(k => {
    describe(k, () => {
      const testCase = testCases[k];
      const { before, after, selection, character } = testCase;
      if (!character)
        throw new Error(
          "Invalid test case, needs to provide character option."
        );
      const contentState = Draft.convertFromRaw(before);
      const editorState = EditorState.forceSelection(
        EditorState.createWithContent(contentState),
        selection
      );

      const wrongSelectionState = selection.merge({
        anchorOffset: 0,
        focusOffset: 0,
      });
      const sameEditorState = EditorState.forceSelection(
        editorState,
        wrongSelectionState
      );

      it("does not convert markdown to style or block type if selection is at the wrong place", () => {
        const newEditorState = handleInlineStyle(
          defaultInlineWhitelist,
          sameEditorState,
          character
        );
        expect(Draft.convertToRaw(newEditorState.getCurrentContent())).toEqual(
          before
        );
        expect(newEditorState).toEqual(sameEditorState);
      });

      it("converts markdown to style or block type", () => {
        const newEditorState = handleInlineStyle(
          defaultInlineWhitelist,
          editorState,
          character
        );
        expect(Draft.convertToRaw(newEditorState.getCurrentContent())).toEqual(
          after
        );
        expect(newEditorState).not.toEqual(editorState);
      });
    });
  });
});
