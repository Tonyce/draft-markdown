draft-js-markdown-plugin
==================================

[![Build Status](https://travis-ci.org/withspectrum/draft-js-markdown-plugin.svg?branch=master)](https://travis-ci.org/withspectrum/draft-js-markdown-plugin)
[![npm](https://img.shields.io/npm/v/draft-js-markdown-plugin.svg)][npm]
<!-- [![Coverage Status](https://coveralls.io/repos/github/withspectrum/draft-js-markdown-plugin/badge.svg?branch=master)](https://coveralls.io/github/withspectrum/draft-js-markdown-plugin?branch=master) -->

An opinionated [DraftJS] plugin for supporting Markdown syntax shortcuts in DraftJS. This plugin works with [DraftJS Plugins], and is a fork of the excellent [`draft-js-markdown-shortcuts-plugin`](https://github.com/ngs/draft-js-markdown-shortcuts-plugin) by [@ngs](https://github.com/ngs). (see [why fork that plugin](#why-fork-the-markdown-shortcuts-plugin) for more info)

![screen](screen.gif)

[View Demo][Demo]

## Installation

```sh
npm i --save draft-js-markdown-plugin
```

## Usage

```js
import React, { Component } from 'react';
import Editor from 'draft-js-plugins-editor';
import createMarkdownPlugin from 'draft-js-markdown-plugin';
import { EditorState } from 'draft-js';

export default class DemoEditor extends Component {

  state = {
    editorState: EditorState.createEmpty(),
    plugins: [createMarkdownPlugin()]
  };

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  render() {
    return (
      <Editor
        editorState={this.state.editorState}
        onChange={this.onChange}
        plugins={this.state.plugins}
      />
    );
  }
}
```

### Add code block syntax highlighting

Using the [`draft-js-prism-plugin`](https://github.com/withspectrum/draft-js-prism-plugin) you can easily add syntax highlighting support to your code blocks!

```JS
// Install prismjs and draft-js-prism-plugin
import Prism from 'prismjs';
import createPrismPlugin from 'draft-js-prism-plugin';

class Editor extends Component {
  state = {
    plugins: [
      // Add the Prism plugin to the plugins array 
      createPrismPlugin({
        prism: Prism
      }),
      createMarkdownPlugin()
    ]
  }
}
```

## Options

The `draft-js-markdown-plugin` is configurable. Just pass a config object. Here are the available options:

### `renderLanguageSelect`

```js
renderLanguageSelect = ({
  // Array of language options
  options: Array<{ label, value }>,
  // Callback to select an option
  onChange: (selectedValue: string) => void,
  // Value of selected option
  selectedValue: string,
  // Label of selected option
  selectedLabel: string
}) => React.Node
```

Code blocks render a select to switch syntax highlighting - `renderLanguageSelect` is a render function that lets you override how this is rendered. 

#### Example:

```
import createMarkdownPlugin from 'draft-js-markdown-plugin';

const renderLanguageSelect = ({ options, onChange, selectedValue }) => (
  <select value={selectedValue} onChange={onChange}>
    {options.map(({ label, value }) => (
      <option key={value} value={value}>
        {label}
      </option>
    ))}
  </select>
);

const markdownPlugin = createMarkdownPlugin({ renderLanguageSelect })
```

### `languages`

Dictionary for languages available to code block switcher

#### Example:

```js
const languages = {
  js: 'JavaScript'
}

const markdownPlugin = createMarkdownPlugin({ languages })
```

### `features`

A list of enabled features, by default all features are turned on.

```js
features = {
  block: Array<string>,
  inline: Array<string>,
}
```

#### Example:

```js
// this will only enable BOLD for inline and CODE
// as well as header-one for blocks
const features = {
  inline: ['BOLD'],
  block: ['CODE', 'header-one'],
}
const plugin = createMarkdownPlugin({ features })
```

*Available Inline features*:

```js
[
  'BOLD',
  'ITALIC',
  'CODE',
  'STRIKETHROUGH',
  'LINK',
  'IMAGE'
]
```

*Available Block features*:

```js
import { CHECKABLE_LIST_ITEM } from "draft-js-checkable-list-item"
[
  'CODE',
  'header-one',
  'header-two',
  'header-three',
  'header-four',
  'header-five',
  'header-six',
  'ordered-list-item',
  'unordered-list-item',
  // CHECKABLE_LIST_ITEM is a constant from 'draft-js-checkable-list-item'
  // see import statementabove
  CHECKABLE_LIST_ITEM,
  'blockquote',
]
```

### `entityType`

To interoperate this plugin with other DraftJS plugins, i.e. [`draft-js-plugins`](https://github.com/draft-js-plugins/draft-js-plugins), you might need to customize the `LINK` and `IMAGE` entity type created by `draft-js-markdown-plugin`.

#### Example:

```js
import createMarkdownPlugin from "draft-js-markdown-plugin";
import createFocusPlugin from "draft-js-focus-plugin";
import createImagePlugin from "draft-js-image-plugin";

const entityType = {
  IMAGE: "IMAGE",
};

const focusPlugin = createFocusPlugin();
const imagePlugin = createImagePlugin({
  decorator: focusPlugin.decorator,
});
// For `draft-js-image-plugin` to work, the entity type of an image must be `IMAGE`.
const markdownPlugin = createMarkdownPlugin({ entityType });

const editorPlugins = [focusPlugin, imagePlugin, markdownPlugin];
```

## Why fork the `markdown-shortcuts-plugin`?

Writing is a core part of our app, and while the `markdown-shortcuts-plugin` is awesome and battle-tested there are a few opinionated things we wanted to do differently. Rather than bother [@ngs](https://github.com/ngs) with tons of PRs, we figured it'd be better to own that core part of our experience fully. 

## License

Licensed under the MIT license, Copyright Ⓒ 2017 Space Program Inc. This plugin is forked from the excellent [`draft-js-markdown-shortcuts-plugin`](https://github.com/ngs/draft-js-markdown-shortcuts-plugin) by [Atsushi Nagase](https://github.com/ngs).

See [LICENSE] for the full license text.

[Demo]: https://markdown-plugin.spectrum.chat/
[DraftJS]: https://facebook.github.io/draft-js/
[DraftJS Plugins]: https://github.com/draft-js-plugins/draft-js-plugins
[LICENSE]: ./LICENSE
[npm]: https://www.npmjs.com/package/draft-js-markdown-plugin
