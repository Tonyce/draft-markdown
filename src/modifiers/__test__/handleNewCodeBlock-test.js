import sinon from "sinon";
import Draft, { EditorState, SelectionState } from "draft-js";
import handleNewCodeBlock from "../handleNewCodeBlock";

const removeBlockKeys = rawContentState => {
  return {
    ...rawContentState,
    blocks: rawContentState.blocks.map(block => {
      delete block.key;
      return block;
    }),
  };
};

describe("handleNewCodeBlock", () => {
  describe("in unstyled block with three backquotes", () => {
    const testNewCodeBlock = (text, data) => () => {
      const beforeRawContentState = {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text,
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
      };
      const afterRawContentState = {
        entityMap: {},
        blocks: [
          {
            text: "",
            type: "code-block",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data,
          },
          {
            text: "",
            type: "unstyled",
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
            depth: 0,
          },
        ],
      };
      const contentState = Draft.convertFromRaw(beforeRawContentState);
      const selection = new SelectionState({
        anchorKey: "item1",
        anchorOffset: text.length,
        focusKey: "item1",
        focusOffset: text.length,
        isBackward: false,
        hasFocus: true,
      });
      const editorState = EditorState.forceSelection(
        EditorState.createWithContent(contentState),
        selection
      );
      it("creates new code block", () => {
        const newEditorState = handleNewCodeBlock(editorState);
        expect(newEditorState).not.toEqual(editorState);
        expect(
          removeBlockKeys(
            Draft.convertToRaw(newEditorState.getCurrentContent())
          )
        ).toEqual(removeBlockKeys(afterRawContentState));
      });
    };

    describe("without langugate", testNewCodeBlock("```", {}));
    describe("with langugate", testNewCodeBlock("```js", { language: "js" }));
  });

  describe("in code block", () => {
    beforeAll(() => {
      sinon.stub(Draft, "genKey").returns("item2");
    });
    afterAll(() => {
      Draft.genKey.restore();
    });
    const beforeRawContentState = {
      entityMap: {},
      blocks: [
        {
          key: "item1",
          text: 'console.info("hello")',
          type: "code-block",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: { language: "js" },
        },
      ],
    };
    const afterRawContentState = {
      entityMap: {},
      blocks: [
        {
          key: "item1",
          text: 'console.info("hello")',
          type: "code-block",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: { language: "js" },
        },
        {
          key: "item2",
          text: "",
          type: "code-block",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: { language: "js" },
        },
      ],
    };
    const contentState = Draft.convertFromRaw(beforeRawContentState);
    it("adds new line inside code block", () => {
      const selection = new SelectionState({
        anchorKey: "item1",
        anchorOffset: 21,
        focusKey: "item1",
        focusOffset: 21,
        isBackward: false,
        hasFocus: true,
      });
      const editorState = EditorState.forceSelection(
        EditorState.createWithContent(contentState),
        selection
      );
      const newEditorState = handleNewCodeBlock(editorState);
      expect(newEditorState).not.toEqual(editorState);
      expect(Draft.convertToRaw(newEditorState.getCurrentContent())).toEqual(
        afterRawContentState
      );
    });
    it("does not add new line even inside code block", () => {
      const selection = new SelectionState({
        anchorKey: "item1",
        anchorOffset: 10,
        focusKey: "item1",
        focusOffset: 10,
        isBackward: false,
        hasFocus: true,
      });
      const editorState = EditorState.forceSelection(
        EditorState.createWithContent(contentState),
        selection
      );
      const newEditorState = handleNewCodeBlock(editorState);
      expect(newEditorState).toEqual(editorState);
      expect(Draft.convertToRaw(newEditorState.getCurrentContent())).toEqual(
        beforeRawContentState
      );
    });
  });

  describe("in unstyled block without three backquotes", () => {
    const rawContentState = {
      entityMap: {},
      blocks: [
        {
          key: "item1",
          text: "``",
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
      anchorOffset: 2,
      focusKey: "item1",
      focusOffset: 2,
      isBackward: false,
      hasFocus: true,
    });
    const editorState = EditorState.forceSelection(
      EditorState.createWithContent(contentState),
      selection
    );
    it("noop", () => {
      const newEditorState = handleNewCodeBlock(editorState);
      expect(newEditorState).toEqual(editorState);
      expect(Draft.convertToRaw(newEditorState.getCurrentContent())).toEqual(
        rawContentState
      );
    });
  });
});
