// import changeCurrentInlineStyle from "./changeCurrentInlineStyle";
// import { EditorState, Modifier } from "draft-js";
// import { inlineMatchers } from "../constants";
// import insertText from "./insertText";
// import { getCurrentLine as getLine } from "../utils";

// const handleChange = (editorState, line, whitelist) => {
//   console.log({ whitelist })
//   let newEditorState = editorState;
//   Object.keys(inlineMatchers)
//     .filter(matcher => whitelist.includes(matcher))
//     .some(k => {
//       inlineMatchers[k].some(re => {
//         let matchArr;
//         do {
//           matchArr = re.exec(line);
//           if (matchArr) {
//             console.log( {matchArr} )
//             if (matchArr[0][0].match(/^\s/)) {
//               matchArr[0] = matchArr[0].replace(/^\s/, "");
//               matchArr.index += 1;
//             }
//             newEditorState = changeCurrentInlineStyle(
//               newEditorState,
//               matchArr,
//               k
//             );
//           }
//         } while (matchArr);
//         return newEditorState !== editorState;
//       });
//       return newEditorState !== editorState;
//     });
//   return newEditorState;
// };

// const handleInlineStyle = (
//   whitelist,
//   editorStateWithoutCharacter,
//   character
// ) => {
//   const editorState = insertText(editorStateWithoutCharacter, character);
//   let selection = editorState.getSelection();
//   let line = getLine(editorState);
//   let newEditorState = handleChange(editorState, line, whitelist);
//   let lastEditorState = editorState;
// console.log('handleInlineStyle...')
//   // Recursively resolve markdown, e.g. _*text*_ should turn into both italic and bold
//   while (newEditorState !== lastEditorState) {
//     lastEditorState = newEditorState;
//     line = getLine(newEditorState);
//     newEditorState = handleChange(newEditorState, line, whitelist);
//   }

//   if (newEditorState !== editorState) {
//     let newContentState = newEditorState.getCurrentContent();
//     selection = newEditorState.getSelection();

//     if (character === "\n") {
//       newContentState = Modifier.splitBlock(newContentState, selection);
//     }

//     newEditorState = EditorState.push(
//       newEditorState,
//       newContentState,
//       "md-to-inline-style"
//     );

//     return newEditorState;
//   }

//   return editorStateWithoutCharacter;
// };

// export default handleInlineStyle;


import changeCurrentInlineStyle from './changeCurrentInlineStyle';

const inlineMatchers = {
  BOLD: /(?:^|\s|\n|[^A-z0-9_*~`])(\*{2}|_{2})((?!\1).*?)(\1)(\s|\n|[^A-z0-9_*~`])$/g,
  ITALIC: /(?:^|\s|\n|[^A-z0-9_*~`])(\*{1}|_{1})((?!\1).*?)(\1)(\s|\n|[^A-z0-9_*~`])$/g,
  CODE: /(?:^|\s|\n|[^A-z0-9_*~`])(`)((?!\1).*?)(\1)(\s|\n|[^A-z0-9_*~`])$/g,
  STRIKETHROUGH: /(?:^|\s|\n|[^A-z0-9_*~`])(~{2})((?!\1).*?)(\1)(\s|\n|[^A-z0-9_*~`])$/g
};

const handleInlineStyle = (editorState, character) => {
  const key = editorState.getSelection().getStartKey();
  const text = editorState.getCurrentContent().getBlockForKey(key).getText();
  const line = `${text}${character}`;
  let newEditorState = editorState;
  Object.keys(inlineMatchers).some((k) => {
    const re = inlineMatchers[k];
    let matchArr;
    do {
      matchArr = re.exec(line);
      // console.log(matchArr, re, line)
      if (matchArr) {
        newEditorState = changeCurrentInlineStyle(newEditorState, matchArr, k);
      }
    } while (matchArr);
    return newEditorState !== editorState;
  });
  return newEditorState;
};

export default handleInlineStyle;
