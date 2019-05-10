// import { OrderedSet } from "immutable";
// import { EditorState, SelectionState, Modifier } from "draft-js";
// import removeInlineStyles from "./removeInlineStyles";

// const changeCurrentInlineStyle = (editorState, matchArr, style) => {
//   const currentContent = editorState.getCurrentContent();
//   const selection = editorState.getSelection();
//   const key = selection.getStartKey();
//   const { index } = matchArr;
//   const blockMap = currentContent.getBlockMap();
//   const block = blockMap.get(key);
//   const currentInlineStyle = block.getInlineStyleAt(index);
//   console.log('changeCurrentInlineStyle', { currentInlineStyle })
//   // do not modify the text if it is inside code style
//   const hasCodeStyle = currentInlineStyle.find(style => style === "CODE");
//   if (hasCodeStyle) {
//     return editorState;
//   }
//   const focusOffset = index + matchArr[0].length;

//   const wordSelection = SelectionState.createEmpty(key).merge({
//     anchorOffset: index,
//     focusOffset,
//   });

//   let newEditorState = editorState;
//   // remove all styles if applying code style
//   if (style === "CODE") {
//     newEditorState = removeInlineStyles(newEditorState, wordSelection);
//   }

//   const markdownCharacterLength = (matchArr[0].length - matchArr[1].length) / 2;

//   let newContentState = newEditorState.getCurrentContent();

//   // remove markdown delimiter at end
//   newContentState = Modifier.removeRange(
//     newContentState,
//     wordSelection.merge({
//       anchorOffset: wordSelection.getFocusOffset() - markdownCharacterLength,
//     })
//   );

//   let afterSelection = newContentState.getSelectionAfter();

//   afterSelection = afterSelection.merge({
//     anchorOffset: afterSelection.getFocusOffset() - markdownCharacterLength,
//     focusOffset: afterSelection.getFocusOffset() - markdownCharacterLength,
//   });

//   // remove markdown delimiter at start
//   newContentState = Modifier.removeRange(
//     newContentState,
//     wordSelection.merge({
//       focusOffset: wordSelection.getAnchorOffset() + markdownCharacterLength,
//     })
//   );
//   console.log('--------', newContentState)
//   // apply style
//   newContentState = Modifier.applyInlineStyle(
//     newContentState,
//     wordSelection.merge({
//       anchorOffset: index,
//       focusOffset: focusOffset - markdownCharacterLength * 2,
//     }),
//     style
//   );
//   newEditorState = EditorState.push(
//     editorState,
//     newContentState,
//     "change-inline-style"
//   );


//   return EditorState.setInlineStyleOverride(
//     EditorState.forceSelection(newEditorState, afterSelection),
//     OrderedSet.of("")
//   );
// };

// export default changeCurrentInlineStyle;

import { EditorState, SelectionState, Modifier } from 'draft-js';

const changeCurrentInlineStyle = (editorState, matchArr, style) => {
  const currentContent = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const key = selection.getStartKey();
  const { index } = matchArr;
  const blockMap = currentContent.getBlockMap();
  const block = blockMap.get(key);
  const currentInlineStyle = block.getInlineStyleAt(index).merge();
  const newStyle = currentInlineStyle.merge([style]);
  const focusOffset = index + matchArr[0].length;
  const wordSelection = SelectionState.createEmpty(key).merge({
    anchorOffset: index + matchArr[0].indexOf(matchArr[1]),
    focusOffset
  });
  let newContentState = Modifier.replaceText(
    currentContent,
    wordSelection,
    matchArr[2],
    newStyle
  );
  newContentState = Modifier.insertText(
    newContentState,
    newContentState.getSelectionAfter(),
    matchArr[4]
  );
  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    'change-inline-style'
  );
  return EditorState.forceSelection(newEditorState, newContentState.getSelectionAfter());
};

export default changeCurrentInlineStyle;
