import './style.scss';
import './editor.scss';
 
const registerBlockType = wp.blocks.registerBlockType;
const { Dashicon } = wp.components;
 
registerBlockType("cgb/a11y-table", {
    title: 'A11y Table',
    icon: 'screenoptions',
    category: 'common',
    attributes: {
        showTable: {
            type: 'boolean',
            default: false
        }
    },
    //////////////////// EDIT ////////////////////
    edit: props => {
        const { attributes: { showTable }, className, setAttributes } = props;
        let formClass = '';
        if(showTable) { formClass = 'is-hidden'; }
        return (
            <div>
                <table className={ className }>
                    <tbody>
                    </tbody>
                </table>
                <form className={ formClass }>
                    <button
                        type='submit'
                        onClick={evt => buildTable(evt) }
                    >
                        Insert table
                    </button>
                </form>
            </div>
        );
        function buildTable(evt) {
            evt.preventDefault();
            props.setAttributes({ showTable: true });
        }
    },
    //////////////////// SAVE ////////////////////
    save: props => {
        const { className } = props;
        return <table><tbody><tr><td>Cell</td></tr></tbody></table>;
    }
});