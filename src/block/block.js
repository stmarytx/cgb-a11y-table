import './style.scss';
import './editor.scss';
 
const { __ } = wp.i18n;
const registerBlockType = wp.blocks.registerBlockType;
const { Dashicon } = wp.components;
const el = wp.element.createElement;
 
registerBlockType("cgb/a11y-table", {
    title: __('A11y Table'),
    icon: 'screenoptions',
    category: 'common',
    attributes: {
        dataBody: {
            type: 'array',
            source: 'query',
            default: [],
            selector: 'tbody tr',
            query: {
                bodyCells: {
                    type: 'array',
                    source: 'query',
                    default: [],
                    selector: 'td,th',
                    query: {
                        content: {
                            type: 'string',
                            source: 'html'
                        }
                    }
                }
            }
        },
        numCols: {
            type: 'string',
            default: '2'
        },
        numRows: {
            type: 'string',
            default: '2'
        },
        showTable: {
            type: 'boolean',
            default: false
        }
    },
    //////////////////// EDIT ////////////////////
    edit: props => {
        console.log('Edit Attributes: ',props.attributes);
        const { attributes: { dataBody, showTable }, className, setAttributes } = props;
        let numCols = parseInt(props.attributes.numCols, 10);
        let numRows = parseInt(props.attributes.numRows, 10);
        let formClass = '';
        if(showTable) { formClass = 'is-hidden'; }
        let tableBody, tableBodyData = dataBody
        .map(function(rows, rowIndex) {
            let rowCells = rows.bodyCells.map(function(cell, colIndex) {
                let cellOptions = {
                    contenteditable: 'true',
                    onInput: (evt) => {
                        // Copy the dataBody
                        let newBody = JSON.parse(JSON.stringify(dataBody));
                        // Create a new cell
                        let newCell = { content: evt.target.textContent };
                        // Replace the old cell
                        newBody[rowIndex].bodyCells[colIndex] = newCell;
                        // Set the attribute
                        props.setAttributes({
                            dataBody: newBody
                        });
                    }
                };
                let currentBodyCell = el(
                    'td',
                    cellOptions,
                    cell.content
                );
                return currentBodyCell;
            });
            return (<tr>{rowCells}</tr>);
        });
        if(tableBodyData.length) {      
            tableBody = <tbody>{ tableBodyData }</tbody>;
        }
        return (
            <div>
                <table className={ className }>
                    { tableBody }
                </table>
                <form className={ formClass }>
                    <div>
                        <label for='numCols'>{ __('Columns') }</label>
                        <input
                            type='number'
                            id='numCols'
                            value={ numCols }
                            min='1'
                            step='1'
                            pattern='[0-9]*'
                            onChange={ (evt) => props.setAttributes({ numCols: evt.target.value }) }
                        />
                    </div>
                    <div>
                        <label for='numRows'>{ __('Rows') }</label>
                        <input
                            type='number'
                            id='numRows'
                            value={ numRows }
                            min='1'
                            step='1'
                            pattern='[0-9]*'
                            onChange={ (evt) => props.setAttributes({ numRows: evt.target.value }) }
                        />
                    </div>
                    <button
                        type='submit'
                        onClick={evt => buildTable(evt) }
                    >
                        { __('Insert Table') }
                    </button>
                </form>
            </div>
        );
        function buildTable(evt) {
            evt.preventDefault();
            // Only build the table and hide the form if there are rows and columns
            if(numCols > 0 && numRows > 0) {
                // Build the tbody attribute array
                let newBody = [];
                for(var row = 0; row < numRows; row++) {
                    let thisRow = { bodyCells: [] };
                    for(var col = 0; col < numCols; col++) {
                        thisRow.bodyCells[col] = { content: '' };
                    }
                    newBody[row] = thisRow;
                }
                // Save atts
                props.setAttributes({
                    dataBody: newBody,
                    showTable: true
                });
            }
        }
    },
    //////////////////// SAVE ////////////////////
    save: props => {
        const { attributes: { dataBody }, className } = props;
        let numCols = parseInt(props.attributes.numCols, 10);
        let numRows = parseInt(props.attributes.numRows, 10);
        // Table Body
        let tableBody, tableBodyData = dataBody
        .map(function(rows) {
            let rowCells = rows.bodyCells.map(function(cell) {
                let currentBodyCell = el(
                    'td',
                    '',
                    cell.content.trim(' ')
                );
                return currentBodyCell;
            });
            return (<tr>{rowCells}</tr>);
        });
        if(tableBodyData.length) {      
            tableBody = <tbody>{ tableBodyData }</tbody>;
        }
        return (
            <table className={ className }>
                { tableBody }
            </table>
        );
    }
});