const registerBlockType = wp.blocks.registerBlockType;
const { Dashicon } = wp.components;
 
registerBlockType("cgb/a11y-table", {
    title: 'A11y Table',
    icon: 'screenoptions',
    category: 'common',
    edit: props => {
        return <table><tbody><tr><td>Cell</td></tr></tbody></table>;
    },
    save: props => {
        return <table><tbody><tr><td>Cell</td></tr></tbody></table>;
    }
});