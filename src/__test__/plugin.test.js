import Draft, { EditorState, SelectionState, ContentBlock } from "draft-js";
import {
  CheckableListItem,
  CheckableListItemUtils,
} from "draft-js-checkable-list-item";
import { applyMDtoInlineStyleChange } from "./utils";

import {
  defaultInlineWhitelist,
  defaultBlockWhitelist,
  ENTITY_TYPE,
} from "../constants";

import { Map, List } from "immutable";
import createMarkdownPlugin from "../";

describe("draft-js-markdown-plugin", () => {
  afterEach(() => {
    /* eslint-disable no-underscore-dangle */
    createMarkdownPlugin.__ResetDependency__("adjustBlockDepth");
    createMarkdownPlugin.__ResetDependency__("handleBlockType");
    createMarkdownPlugin.__ResetDependency__("handleInlineStyle");
    createMarkdownPlugin.__ResetDependency__("handleNewCodeBlock");
    createMarkdownPlugin.__ResetDependency__("insertEmptyBlock");
    createMarkdownPlugin.__ResetDependency__("splitBlockAndChange");
    createMarkdownPlugin.__ResetDependency__("handleLink");
    createMarkdownPlugin.__ResetDependency__("handleImage");
    createMarkdownPlugin.__ResetDependency__("leaveList");
    createMarkdownPlugin.__ResetDependency__("changeCurrentBlockType");
    createMarkdownPlugin.__ResetDependency__("replaceText");
    createMarkdownPlugin.__ResetDependency__("checkReturnForState");
    /* eslint-enable no-underscore-dangle */
  });

  const createEditorState = (rawContent, rawSelection) => {
    const contentState = Draft.convertFromRaw(rawContent);
    return EditorState.forceSelection(
      EditorState.createWithContent(contentState),
      rawSelection
    );
  };

  let plugin;
  let store;
  let currentEditorState;
  let newEditorState;
  let currentRawContentState;
  let newRawContentState;
  let currentSelectionState;
  let subject;
  let event;

  let modifierSpy;

  [[], [{}]].forEach(args => {
    beforeEach(() => {
      modifierSpy = jest.fn(() => newEditorState);

      event = new window.KeyboardEvent("keydown");
      jest.spyOn(event, "preventDefault");
      currentSelectionState = new SelectionState({
        anchorKey: "item1",
        anchorOffset: 0,
        focusKey: "item1",
        focusOffset: 0,
        isBackward: false,
        hasFocus: true,
      });

      newRawContentState = {
        entityMap: {},
        blocks: [
          {
            key: "item1",
            text: "altered!!",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
      };
      newEditorState = EditorState.createWithContent(
        Draft.convertFromRaw(newRawContentState)
      );

      store = {
        setEditorState: jest.fn(),
        getEditorState: jest.fn(() => {
          currentEditorState = createEditorState(
            currentRawContentState,
            currentSelectionState
          );
          return currentEditorState;
        }),
      };
      subject = null;
    });

    describe(args.length === 0 ? "without config" : "with config", () => {
      beforeEach(() => {
        plugin = createMarkdownPlugin(...args);
      });

      it("is loaded", () => {
        expect(typeof createMarkdownPlugin).toBe("function");
      });

      it("initialize", () => {
        plugin.initialize(store);
        expect(plugin.store).toEqual(store);
      });

      describe("handleReturn", () => {
        beforeEach(() => {
          subject = () =>
            plugin.handleReturn(event, store.getEditorState(), store);
        });
        it("does not handle", () => {
          currentRawContentState = {
            entityMap: {},
            blocks: [
              {
                key: "item1",
                text: "",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
              },
            ],
          };
          expect(subject()).toBe("not-handled");
          expect(modifierSpy).not.toHaveBeenCalledTimes(1);
          expect(store.setEditorState).not.toHaveBeenCalled();
        });

        it("does not handle if current entity is link", () => {
          currentRawContentState = {
            entityMap: {
              "0": {
                data: {
                  href: "www.google.com",
                  url: "http://www.google.com",
                },
                mutability: "MUTABLE",
                type: "LINK",
              },
            },
            blocks: [
              {
                key: "item1",
                text: "what **is** going on",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [
                  {
                    offset: 0,
                    key: 0,
                    length: 20,
                  },
                ],
                data: {},
              },
            ],
          };

          currentSelectionState = currentEditorState.getSelection().merge({
            focusOffset: 19,
            anchorOffset: 19,
          });

          currentEditorState = createEditorState(
            currentRawContentState,
            currentSelectionState
          );

          expect(subject()).toBe("not-handled");
        });

        it("resets current inline style", () => {
          currentRawContentState = {
            entityMap: {},
            blocks: [
              {
                key: "item1",
                text: "item1",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [{ offset: 0, length: 5, style: "BOLD" }],
                entityRanges: [],
                data: {},
              },
            ],
          };

          currentSelectionState = currentSelectionState.merge({
            focusOffset: 5,
            anchorOffset: 5,
          });

          expect(subject()).toBe("handled");
          expect(store.setEditorState).toHaveBeenCalled();
          newEditorState = store.setEditorState.mock.calls[0][0];
          expect(newEditorState.getCurrentInlineStyle().size).toBe(0);
        });

        it("leaves from list", () => {
          createMarkdownPlugin.__Rewire__("leaveList", modifierSpy); // eslint-disable-line no-underscore-dangle
          currentRawContentState = {
            entityMap: {},
            blocks: [
              {
                key: "item1",
                text: "",
                type: "ordered-list-item",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
              },
            ],
          };
          expect(subject()).toBe("handled");
          expect(modifierSpy).toHaveBeenCalledTimes(1);
          expect(store.setEditorState).toHaveBeenCalledWith(newEditorState);
        });

        const emptyBlockTypes = [
          "blockquote",
          "header-one",
          "header-two",
          "header-three",
          "header-four",
          "header-five",
          "header-six",
        ];

        emptyBlockTypes.forEach(type => {
          describe(`on ${type}`, () => {
            const text = "Hello";
            beforeEach(() => {
              createMarkdownPlugin.__Rewire__(
                "splitBlockAndChange",
                modifierSpy
              ); // eslint-disable-line no-underscore-dangle
              currentRawContentState = {
                entityMap: {},
                blocks: [
                  {
                    key: "item1",
                    text,
                    type,
                    depth: 0,
                    inlineStyleRanges: [],
                    entityRanges: [],
                    data: {},
                  },
                ],
              };
            });

            describe("at the end of line", () => {
              beforeEach(() => {
                createMarkdownPlugin.__Rewire__(
                  "insertEmptyBlock",
                  modifierSpy
                ); // eslint-disable-line no-underscore-dangle
                currentSelectionState = currentEditorState
                  .getSelection()
                  .merge({
                    focusOffset: text.length,
                    anchorOffset: text.length,
                  });

                currentEditorState = createEditorState(
                  currentRawContentState,
                  currentSelectionState
                );
              });
              it("inserts new empty block", () => {
                expect(subject()).toBe("handled");
                expect(modifierSpy).toHaveBeenCalledTimes(1);
                expect(store.setEditorState).toHaveBeenCalledWith(
                  newEditorState
                );
              });
            });
            describe("when not at the end of the line", () => {
              it("splits and resets block", () => {
                expect(subject()).toBe("handled");
                expect(modifierSpy).toHaveBeenCalled();
                expect(store.setEditorState).toHaveBeenCalled();
              });
            });
          });
        });

        ["ctrlKey", "shiftKey", "metaKey", "altKey"].forEach(key => {
          describe(`${key} is pressed`, () => {
            beforeEach(() => {
              const props = {};
              props[key] = true;
              event = new window.KeyboardEvent("keydown", props);
            });
            it("inserts new empty block", () => {
              const text = "Hello";
              currentRawContentState = {
                entityMap: {},
                blocks: [
                  {
                    key: "item1",
                    text,
                    type: "any type",
                    depth: 0,
                    inlineStyleRanges: [],
                    entityRanges: [],
                    data: {},
                  },
                ],
              };
              expect(subject()).toBe("not-handled");
              expect(store.setEditorState).not.toHaveBeenCalled();
            });
          });
        });
        it("handles new code block", () => {
          createMarkdownPlugin.__Rewire__("handleNewCodeBlock", modifierSpy); // eslint-disable-line no-underscore-dangle
          currentRawContentState = {
            entityMap: {},
            blocks: [
              {
                key: "item1",
                text: "```",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
              },
            ],
          };
          expect(subject()).toBe("handled");
          expect(modifierSpy).toHaveBeenCalledTimes(1);
          expect(store.setEditorState).toHaveBeenCalledWith(newEditorState);
        });
        it("handle code block closing", () => {
          createMarkdownPlugin.__Rewire__(
            "changeCurrentBlockType",
            modifierSpy
          ); // eslint-disable-line no-underscore-dangle
          currentRawContentState = {
            entityMap: {},
            blocks: [
              {
                key: "item1",
                text: "foo\n```",
                type: "code-block",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
              },
            ],
          };
          expect(subject()).toBe("handled");
          expect(modifierSpy).toHaveBeenCalledTimes(1);
        });
        it("insert new line char from code-block", () => {
          createMarkdownPlugin.__Rewire__("insertText", modifierSpy); // eslint-disable-line no-underscore-dangle
          currentRawContentState = {
            entityMap: {},
            blocks: [
              {
                key: "item1",
                text: "const foo = a => a",
                type: "code-block",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
              },
            ],
          };
          expect(subject()).toBe("handled");
          expect(modifierSpy).toHaveBeenCalledTimes(1);
          expect(store.setEditorState).toHaveBeenCalledWith(newEditorState);
        });
      });
      describe("blockStyleFn", () => {
        let type;
        beforeEach(() => {
          type = null;
          const getType = () => type;
          subject = () => plugin.blockStyleFn({ getType });
        });
        it("returns checkable-list-item", () => {
          type = "checkable-list-item";
          expect(subject()).toBe("checkable-list-item");
        });
        it("returns null", () => {
          type = "ordered-list-item";
          expect(subject()).toBeNull();
        });
      });
      describe("blockRendererFn", () => {
        let type;
        let data;
        let block;
        let spyOnChangeChecked;
        beforeEach(() => {
          type = null;
          data = {};
          spyOnChangeChecked = jest.spyOn(
            CheckableListItemUtils,
            "toggleChecked"
          );
          subject = () => {
            block = new ContentBlock({
              type,
              data: Map(data),
              key: "item1",
              characterList: List(),
            });
            return plugin.blockRendererFn(block, store);
          };
        });
        afterEach(() => {
          CheckableListItemUtils.toggleChecked.mockRestore();
        });
        it("returns renderer", async () => {
          type = "checkable-list-item";
          data = { checked: true };
          const renderer = subject();
          expect(typeof renderer).toBe("object");
          expect(renderer.component).toBe(CheckableListItem);
          expect(typeof renderer.props.onChangeChecked).toBe("function");
          expect(renderer.props.checked).toBe(true);
          const event = new Event("change", { bubbles: true });

          event.simulated = true;
          renderer.props.onChangeChecked(event);
          await new Promise(resolve => setTimeout(() => resolve()));
          expect(spyOnChangeChecked).toHaveBeenCalledWith(
            currentEditorState,
            block
          );
        });
        it("returns null", () => {
          type = "ordered-list-item";
          expect(subject()).toBeNull();
        });
      });
      describe("onTab", () => {
        beforeEach(() => {
          subject = () => {
            createMarkdownPlugin.__Rewire__("adjustBlockDepth", modifierSpy); // eslint-disable-line no-underscore-dangle
            return plugin.onTab(event, store);
          };
        });
        describe("no changes", () => {
          it("returns handled", () => {
            expect(subject()).toBe("handled");
          });
          it("returns not-handled", () => {
            modifierSpy = jest.fn(() => currentEditorState);
            expect(subject()).toBe("not-handled");
          });
        });
      });
      describe("handleBeforeInput", () => {
        let character;
        beforeEach(() => {
          character = " ";
          subject = editorState =>
            plugin.handleBeforeInput(
              character,
              editorState || store.getEditorState(),
              store
            );
          currentRawContentState = {
            entityMap: {},
            blocks: [
              {
                key: "item1",
                text: "",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
              },
            ],
          };
        });
        ["handleImage"].forEach(modifier => {
          describe(modifier, () => {
            beforeEach(() => {
              createMarkdownPlugin.__Rewire__(modifier, modifierSpy); // eslint-disable-line no-underscore-dangle
            });
            it("returns handled", () => {
              expect(subject()).toBe("handled");
              expect(modifierSpy).toHaveBeenCalledWith(
                currentEditorState,
                " ",
                ENTITY_TYPE.IMAGE
              );
            });
          });
        });
        ["handleLink"].forEach(modifier => {
          describe(modifier, () => {
            beforeEach(() => {
              createMarkdownPlugin.__Rewire__(modifier, modifierSpy); // eslint-disable-line no-underscore-dangle
            });
            it("returns handled", () => {
              expect(subject()).toBe("handled");
              expect(modifierSpy).toHaveBeenCalledWith(
                currentEditorState,
                " ",
                ENTITY_TYPE.LINK
              );
            });
          });
        });
        ["handleBlockType"].forEach(modifier => {
          describe(modifier, () => {
            beforeEach(() => {
              createMarkdownPlugin.__Rewire__(modifier, modifierSpy); // eslint-disable-line no-underscore-dangle
            });
            it("returns handled", () => {
              expect(subject()).toBe("handled");
              expect(modifierSpy).toHaveBeenCalledWith(
                defaultBlockWhitelist,
                currentEditorState,
                " "
              );
            });
          });
        });
        ["handleInlineStyle"].forEach(modifier => {
          describe(modifier, () => {
            beforeEach(() => {
              createMarkdownPlugin.__Rewire__(modifier, modifierSpy); // eslint-disable-line no-underscore-dangle
            });
            it("returns handled", () => {
              expect(subject()).toBe("handled");
              expect(modifierSpy).toHaveBeenCalledWith(
                defaultInlineWhitelist,
                currentEditorState,
                " "
              );
            });
            it("unstickys inline style", () => {
              currentRawContentState = {
                entityMap: {},
                blocks: [
                  {
                    key: "item1",
                    text: "item1",
                    type: "unstyled",
                    depth: 0,
                    inlineStyleRanges: [
                      { offset: 0, length: 5, style: "BOLD" },
                    ],
                    entityRanges: [],
                    data: {},
                  },
                ],
              };

              currentSelectionState = currentSelectionState.merge({
                focusOffset: 5,
                anchorOffset: 5,
              });

              expect(
                subject(applyMDtoInlineStyleChange(store.getEditorState()))
              ).toBe("handled");
              expect(store.setEditorState).toHaveBeenCalled();
              newEditorState = store.setEditorState.mock.calls[0][0];
              const block = newEditorState.getCurrentContent().getLastBlock();
              const length = block.getLength();
              expect(block.getInlineStyleAt(length - 1).toJS()).toEqual([]);
              expect(block.getInlineStyleAt(length - 2).toJS()).toEqual([
                "BOLD",
              ]);
            });
          });
        });
        describe("character is not a space", () => {
          beforeEach(() => {
            character = "x";
          });
          it("returns not-handled", () => {
            expect(subject()).toBe("not-handled");
          });
        });
        describe("no matching modifiers", () => {
          it("returns not-handled", () => {
            expect(subject()).toBe("not-handled");
          });
        });
        describe("current entity is a link", () => {
          it("returns not-handled", () => {
            currentRawContentState = {
              entityMap: {
                "0": {
                  data: {
                    href: "www.google.com",
                    url: "http://www.google.com",
                  },
                  mutability: "MUTABLE",
                  type: "LINK",
                },
              },
              blocks: [
                {
                  key: "item1",
                  text: "what **is** going on",
                  type: "unstyled",
                  depth: 0,
                  inlineStyleRanges: [],
                  entityRanges: [
                    {
                      offset: 0,
                      key: 0,
                      length: 20,
                    },
                  ],
                  data: {},
                },
              ],
            };

            currentSelectionState = currentEditorState.getSelection().merge({
              focusOffset: 19,
              anchorOffset: 19,
            });

            currentEditorState = createEditorState(
              currentRawContentState,
              currentSelectionState
            );

            expect(subject()).toBe("not-handled");
          });
        });
        it("handles new code block on space", () => {
          createMarkdownPlugin.__Rewire__("handleNewCodeBlock", modifierSpy); // eslint-disable-line no-underscore-dangle
          currentRawContentState = {
            entityMap: {},
            blocks: [
              {
                key: "item1",
                text: "```",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
              },
            ],
          };
          character = " ";
          expect(subject()).toBe("handled");
          expect(modifierSpy).toHaveBeenCalledTimes(1);
          expect(store.setEditorState).toHaveBeenCalledWith(newEditorState);
        });
      });
    });
  });
});
