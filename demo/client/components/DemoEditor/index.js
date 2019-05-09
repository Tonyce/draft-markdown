import React, { Component } from "react";
import Editor from "draft-js-plugins-editor";

import createMarkdownShortcutsPlugin from "draft-js-markdown-shortcuts-plugin"; // eslint-disable-line
import Draft, {
  convertToRaw,
  convertFromRaw,
  ContentState,
  EditorState,
} from "draft-js";
import styles from "./styles.css";
import Prism from "prismjs";
import "prismjs/components/prism-java";
import "prismjs/components/prism-scala";
import "prismjs/components/prism-go";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-perl";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-swift";

import prismPlugin from './plugins/prism';
import initialState from "./initial-state";

const renderLanguageSelect = ({
  options,
  onChange,
  selectedValue,
  selectedLabel,
}) => (
  <div className={styles.switcherContainer}>
    <div className={styles.switcher}>
      <select
        className={styles.switcherSelect}
        value={selectedValue}
        onChange={onChange}
      >
        {options.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className={styles.switcherLabel}>
        {selectedLabel} {String.fromCharCode(9662)}
      </div>
    </div>
  </div>
);

const languages = {
  js: "JavaScript",
  kotlin: "Kotlin",
  mathml: "MathML",
};

const plugins = [
  prismPlugin,
  createMarkdownShortcutsPlugin({ renderLanguageSelect }),
];

const initialEditorState = EditorState.createWithContent(
  convertFromRaw(initialState)
);

export default class DemoEditor extends Component {
  state = {
    editorState: initialEditorState,
  };

  onChange = editorState => {
    this.setState({
      editorState,
    });
  };

  focus = () => {
    this.editor.focus();
  };

  toMD = () => {
    const contentState = this.state.editorState.getCurrentContent();
    console.log({ contentState })
    const rawDraftContentState = convertToRaw(contentState)
    console.log({ rawDraftContentState })
  }

  render() {
    const { editorState } = this.state;
    return (
      <div>
        <div>
          <button onClick={this.toMD}>tomd</button>
        </div>
        <div className={styles.root}>
          <div className={styles.editor} onClick={this.focus}>
            <Editor
              editorState={editorState}
              onChange={this.onChange}
              plugins={plugins}
              spellCheck
              autoFocus
              placeholder="Write something here..."
              ref={element => {
                this.editor = element;
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
