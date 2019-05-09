import React from 'react';
import Prism from 'prismjs';
import PrismDecorator from 'draft-js-prism';


const prismPlugin = {
  decorators: [
    new PrismDecorator({
      prism: Prism,
      getSyntax(block) {
        // console.log({ block })
        const language = block.getData().get('language');
        // console.log({ language })
        if (typeof Prism.languages[language] === 'object') {
          return language;
        }
        return null;
      },
      render({ type, children }) {
        return <span className={`prism-token token ${type}`}>{children}</span>;
      }
    })
  ],
  // blockStyleFn: function blockStyleFn(block) {
  //   // console.log(block, block.getType())
  //   const language = block.getData().get('language')
  //   switch (block.getType()) {
  //     case 'code-block':
  //       return language ? `language-${language}` : null;
  //     default:
  //       break;
  //   }
  //   return null;
  // },
};

export default prismPlugin;
