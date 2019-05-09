import insertLink from "./insertLink";

const handleLink = (editorState, character, entityType) => {
  const re = /\[([^\]]+)]\(([^)"]+)(?: "([^"]+)")?\)\s$/g;
  const key = editorState.getSelection().getStartKey();
  const text = editorState
    .getCurrentContent()
    .getBlockForKey(key)
    .getText();
  const line = `${text}${character}`;
  let newEditorState = editorState;
  let matchArr;
  do {
    matchArr = re.exec(line);
    if (matchArr) {
      newEditorState = insertLink(newEditorState, matchArr, entityType);
    }
  } while (matchArr);
  return newEditorState;
};

export default handleLink;
